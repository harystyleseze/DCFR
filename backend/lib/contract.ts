import { ethers } from "ethers";
import { BrowserProvider, JsonRpcProvider } from "ethers";
import { config } from "./config";
import FileDAOABI from "./contracts/FileDAO.json";

const CONTRACT_ADDRESS = config.contract.address;
const CONTRACT_ABI = FileDAOABI.abi;

export enum ProposalType {
  UPLOAD,
  DELETE,
  SHARE,
}

export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: BrowserProvider | JsonRpcProvider | null = null;

  async initialize(provider: BrowserProvider | JsonRpcProvider) {
    try {
      this.provider = provider;
      const signer =
        provider instanceof BrowserProvider
          ? await provider.getSigner()
          : provider;
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Verify contract is accessible
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === "0x") {
        throw new Error("No contract deployed at the specified address");
      }
    } catch (error: any) {
      console.error("Initialization error:", error);
      throw new Error(`Failed to initialize contract: ${error.message}`);
    }
  }

  async addMember(memberAddress: string) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.addMember(memberAddress);
      await tx.wait();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to add member: ${error.message}`);
    }
  }

  async removeMember(memberAddress: string) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.removeMember(memberAddress);
      await tx.wait();
      return true;
    } catch (error: any) {
      if (error.message.includes("Cannot remove admin")) {
        throw new Error("The admin cannot be removed from the DAO");
      }
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }

  async createUploadProposal(
    cid: string,
    fileName: string,
    fileSize: number,
    votingPeriod: number = 300
  ) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.propose(
        ProposalType.UPLOAD,
        cid,
        fileName,
        fileSize,
        votingPeriod
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e: any) => e.event === "FileProposed"
      );
      return event?.args?.proposalId?.toString();
    } catch (error: any) {
      throw new Error(`Failed to create proposal: ${error.message}`);
    }
  }

  async voteOnProposal(proposalId: number, support: boolean) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.vote(proposalId, support);
      await tx.wait();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to vote: ${error.message}`);
    }
  }

  async executeProposal(proposalId: number) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.executeProposal(proposalId);
      await tx.wait();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to execute proposal: ${error.message}`);
    }
  }

  async getProposal(proposalId: number) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const proposal = await this.contract.proposals(proposalId);
      return {
        proposalType: proposal.proposalType,
        cid: proposal.cid,
        fileName: proposal.fileName,
        fileSize: proposal.fileSize.toString(),
        proposer: proposal.proposer,
        executed: proposal.executed,
        yesVotes: proposal.yesVotes.toString(),
        noVotes: proposal.noVotes.toString(),
        votingEnd: proposal.votingEnd.toString(),
        votingPeriod: proposal.votingPeriod.toString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get proposal: ${error.message}`);
    }
  }

  async isProposalPassed(proposalId: number) {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.isProposalPassed(proposalId);
  }

  async getVotingTimeLeft(proposalId: number) {
    if (!this.contract) throw new Error("Contract not initialized");
    const timeLeft = await this.contract.getProposalVotingTimeLeft(proposalId);
    return timeLeft.toString();
  }

  async isMember(address: string) {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.members(address);
  }

  async getMemberCount() {
    if (!this.contract) throw new Error("Contract not initialized");
    const count = await this.contract.memberCount();
    return parseInt(count.toString());
  }

  async hasAccess(cid: string, address: string) {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.hasAccess(cid, address);
  }

  async proposalCount() {
    if (!this.contract) throw new Error("Contract not initialized");
    const count = await this.contract.proposalCount();
    return parseInt(count.toString());
  }

  async isAdmin(address: string) {
    if (!this.contract) throw new Error("Contract not initialized");
    const adminAddress = await this.contract.admin();
    return adminAddress.toLowerCase() === address.toLowerCase();
  }

  async createProposal(
    name: string,
    cid: string,
    votingPeriod: number
  ): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.createProposal(name, cid, votingPeriod);
      const receipt = await tx.wait();

      // Get the ProposalCreated event from the receipt
      const event = receipt.logs.find(
        (log: any) => log.eventName === "ProposalCreated"
      );

      if (!event) {
        throw new Error(
          "ProposalCreated event not found in transaction receipt"
        );
      }

      // Return the proposal ID from the event
      return event.args[0].toString();
    } catch (error: any) {
      console.error("Error creating proposal:", error);
      throw new Error(error.message || "Failed to create proposal");
    }
  }

  async createDeleteProposal(
    cid: string,
    fileName: string,
    votingPeriod: number = 300
  ) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.propose(
        ProposalType.DELETE,
        cid,
        fileName,
        0, // fileSize is 0 for delete proposals
        votingPeriod
      );
      const receipt = await tx.wait();

      // Find the FileProposed event
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === "FileProposed"
      );

      if (!event) {
        throw new Error("FileProposed event not found in transaction receipt");
      }

      // Get the proposal ID from the event args
      const proposalId = event.args[0];
      if (!proposalId) {
        throw new Error("Proposal ID not found in event");
      }

      return proposalId.toString();
    } catch (error: any) {
      throw new Error(`Failed to create delete proposal: ${error.message}`);
    }
  }

  async executeDeleteProposal(proposalId: string) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.executeProposal(proposalId);
      await tx.wait();

      // Get the proposal details
      const proposal = await this.contract.proposals(proposalId);

      // Delete the file using the API route
      const response = await fetch("/api/proposals/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cid: proposal.cid }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete file");
      }

      return true;
    } catch (error: any) {
      throw new Error(`Failed to execute delete proposal: ${error.message}`);
    }
  }
}
