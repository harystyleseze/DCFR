import { NextResponse } from "next/server";
import { ContractService, ProposalType } from "@/lib/contract";
import { JsonRpcProvider } from "ethers";
import { config } from "@/lib/config";

export async function GET() {
  try {
    console.log("Initializing contract service...");
    const provider = new JsonRpcProvider(config.contract.network.rpcUrl);
    const contractService = new ContractService();
    await contractService.initialize(provider);

    console.log("Fetching proposal count...");
    const proposalCount = await contractService.proposalCount();
    console.log(`Found ${proposalCount} total proposals`);

    const proposalPromises = [];
    for (let i = 1; i <= proposalCount; i++) {
      proposalPromises.push(contractService.getProposal(i));
    }

    console.log("Fetching all proposals...");
    const proposals = await Promise.all(proposalPromises);
    const now = Math.floor(Date.now() / 1000);

    // Debug log to check proposal types
    proposals.forEach((p, index) => {
      if (p) {
        console.log(`Proposal ${index + 1}:`, {
          type: p.proposalType,
          isDelete: p.proposalType === ProposalType.DELETE,
          typeValue: Number(p.proposalType),
          fileName: p.fileName
        });
      }
    });

    // Filter delete proposals
    const deleteProposals = proposals
      .filter(p => {
        if (!p) return false;
        const isDelete = Number(p.proposalType) === ProposalType.DELETE;
        console.log(`Checking proposal type: ${Number(p.proposalType)}, isDelete: ${isDelete}`);
        return isDelete;
      })
      .map((proposal, index) => ({
        id: index + 1,
        proposalType: Number(proposal.proposalType),
        cid: proposal.cid,
        fileName: proposal.fileName,
        fileSize: proposal.fileSize.toString(),
        proposer: proposal.proposer,
        executed: proposal.executed,
        yesVotes: proposal.yesVotes.toString(),
        noVotes: proposal.noVotes.toString(),
        votingEnd: proposal.votingEnd.toString(),
        votingPeriod: proposal.votingPeriod.toString()
      }));

    // Separate active and executed proposals using the same logic as stats API
    const activeProposals = deleteProposals.filter(p => {
      const votingEnded = parseInt(p.votingEnd) <= now;
      return !votingEnded && !p.executed;
    });

    const executedProposals = deleteProposals.filter(p => {
      const votingEnded = parseInt(p.votingEnd) <= now;
      return votingEnded || p.executed;
    });

    console.log(`Found ${activeProposals.length} active and ${executedProposals.length} executed delete proposals`);

    return NextResponse.json({ 
      proposals: deleteProposals,
      stats: {
        active: activeProposals.length,
        executed: executedProposals.length
      }
    });
  } catch (error: any) {
    console.error("Error in /api/proposals/delete/list:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch delete proposals",
        details: error.stack
      },
      { status: 500 }
    );
  }
} 