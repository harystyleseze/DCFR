import { NextResponse } from "next/server";
import { createAutoDriveApi, apiCalls, Scope } from "@autonomys/auto-drive";
import { ContractService, ProposalType } from "@/lib/contract";
import { JsonRpcProvider } from "ethers";
import { config } from "@/lib/config";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Initialize contract service
    const provider = new JsonRpcProvider(config.contract.network.rpcUrl);
    const contractService = new ContractService();
    await contractService.initialize(provider);

    // Get all proposals
    const proposalCount = await contractService.proposalCount();
    const proposalPromises = [];
    for (let i = 1; i <= proposalCount; i++) {
      proposalPromises.push(contractService.getProposal(i));
    }
    const proposals = await Promise.all(proposalPromises);

    // Count active proposals
    const now = Math.floor(Date.now() / 1000);
    const activeProposals = proposals.filter((p) => {
      const votingEnded = parseInt(p.votingEnd) <= now;
      return !votingEnded && !p.executed;
    }).length;

    // Get deleted files count
    const deletedCids = proposals
      .filter((p) => p.proposalType === ProposalType.DELETE && p.executed)
      .map((p) => p.cid);

    // Get files managed count
    const autoDrive = createAutoDriveApi({
      apiKey: process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY || "",
      network: "taurus",
    });
    const { totalCount } = await apiCalls.getRoots(autoDrive, {
      scope: Scope.User,
      limit: 1,
      offset: 0,
    });

    // Adjust files managed count by subtracting deleted files
    const filesManaged = totalCount - deletedCids.length;

    // Get DAO members count
    let daoMembers = 0;
    try {
      daoMembers = await contractService.getMemberCount();
    } catch (error) {
      console.error("Error fetching member count:", error);
    }

    const response = NextResponse.json({
      activeProposals,
      filesManaged,
      daoMembers,
    });

    // Set cache control headers
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
