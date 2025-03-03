import { NextResponse } from "next/server";
import { AutoDriveService } from "../../../../lib/autoDrive";
import { ContractService, ProposalType } from "../../../../lib/contract";
import { JsonRpcProvider } from "ethers";
import { config } from "../../../../lib/config";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY) {
      return NextResponse.json(
        { error: "AUTO_DRIVE_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const autoDrive = new AutoDriveService(
      process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY
    );
    const searchResults = await autoDrive.searchFile(query);

    // Get list of deleted files from the contract
    const provider = new JsonRpcProvider(config.contract.network.rpcUrl);
    const contractService = new ContractService();
    await contractService.initialize(provider);

    const proposalCount = await contractService.proposalCount();
    const proposalPromises = [];

    for (let i = 1; i <= proposalCount; i++) {
      proposalPromises.push(contractService.getProposal(i));
    }

    const proposals = await Promise.all(proposalPromises);
    const deletedCids = proposals
      .filter((p) => p.proposalType === ProposalType.DELETE && p.executed)
      .map((p) => p.cid);

    // Filter out deleted files from search results
    const filteredResults = searchResults.filter(
      (file) => !deletedCids.includes(file.cid)
    );

    return NextResponse.json({ results: filteredResults });
  } catch (error: any) {
    console.error("Error searching files:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
