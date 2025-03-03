import { NextResponse } from "next/server";
import { ContractService, ProposalType } from "@/lib/contract";
import { JsonRpcProvider } from "ethers";
import { config } from "@/lib/config";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const provider = new JsonRpcProvider(config.contract.network.rpcUrl);
    const contractService = new ContractService();
    await contractService.initialize(provider);

    const proposalCount = await contractService.proposalCount();
    const proposalPromises = [];
    for (let i = 1; i <= proposalCount; i++) {
      proposalPromises.push(contractService.getProposal(i));
    }

    const proposals = await Promise.all(proposalPromises);
    const now = Math.floor(Date.now() / 1000);

    // Map proposals to a more usable format
    const formattedProposals = proposals.map((proposal, index) => ({
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

    // Separate active and executed proposals
    const activeProposals = formattedProposals.filter(p => {
      const votingEnded = parseInt(p.votingEnd) <= now;
      return !votingEnded && !p.executed;
    });

    const executedProposals = formattedProposals.filter(p => {
      const votingEnded = parseInt(p.votingEnd) <= now;
      return votingEnded || p.executed;
    });

    // Group proposals by type
    const groupedProposals = {
      active: {
        upload: activeProposals.filter(p => p.proposalType === ProposalType.UPLOAD),
        delete: activeProposals.filter(p => p.proposalType === ProposalType.DELETE),
        share: activeProposals.filter(p => p.proposalType === ProposalType.SHARE)
      },
      executed: {
        upload: executedProposals.filter(p => p.proposalType === ProposalType.UPLOAD),
        delete: executedProposals.filter(p => p.proposalType === ProposalType.DELETE),
        share: executedProposals.filter(p => p.proposalType === ProposalType.SHARE)
      }
    };

    return NextResponse.json({
      proposals: groupedProposals,
      stats: {
        active: activeProposals.length,
        executed: executedProposals.length,
        total: formattedProposals.length
      }
    });
  } catch (error: any) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch proposals" },
      { status: 500 }
    );
  }
} 