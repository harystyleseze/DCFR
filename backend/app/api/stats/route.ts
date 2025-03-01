import { NextResponse } from "next/server";
import { createAutoDriveApi, apiCalls, Scope } from "@autonomys/auto-drive";
import { ContractService } from "@/lib/contract";
import { JsonRpcProvider } from "ethers";
import { config } from "@/lib/config";

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

    // Get files managed count
    const autoDrive = createAutoDriveApi({
      apiKey: process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY || "",
      network: "taurus",
    });
    const { totalCount: filesManaged } = await apiCalls.getRoots(autoDrive, {
      scope: Scope.User,
      limit: 1,
      offset: 0,
    });

    // Get DAO members count
    let daoMembers = 0;
    try {
      daoMembers = await contractService.getMemberCount();
    } catch (error) {
      console.error("Error fetching member count:", error);
    }

    return NextResponse.json({
      activeProposals,
      filesManaged,
      daoMembers,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
