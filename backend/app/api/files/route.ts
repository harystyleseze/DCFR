import { NextResponse } from "next/server";
import { createAutoDriveApi, apiCalls, Scope } from "@autonomys/auto-drive";
import { ContractService, ProposalType } from "@/lib/contract";
import { JsonRpcProvider } from "ethers";
import { config } from "@/lib/config";

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

    // Get pagination parameters from URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Initialize AutoDrive
    const autoDrive = createAutoDriveApi({
      apiKey: process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY || "",
      network: "taurus",
    });

    // Get files for the current page
    const { rows: files, totalCount } = await apiCalls.getRoots(autoDrive, {
      scope: Scope.User,
      limit,
      offset
    });

    console.log('Total files from getRoots:', totalCount);
    console.log('Files array length:', files.length);

    // Get metadata for each file
    const fileMetadataPromises = files.map(async (file) => {
      try {
        const objectInfo = await apiCalls.getObject(autoDrive, { cid: file.headCid });
        return {
          ...file,
          type: objectInfo.metadata.type || 'application/octet-stream'
        };
      } catch (error) {
        console.error(`Error fetching metadata for file ${file.headCid}:`, error);
        return file;
      }
    });

    const filesWithMetadata = await Promise.all(fileMetadataPromises);

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

    // Filter out deleted files
    const activeFiles = filesWithMetadata
      .filter((file) => !deletedCids.includes(file.headCid))
      .map((file) => ({
        name: file.name,
        cid: file.headCid,
        size: file.size,
        type: file.type || 'application/octet-stream',
      }));

    // Calculate the actual total count excluding deleted files
    const actualTotalCount = totalCount - deletedCids.length;

    return NextResponse.json({
      files: activeFiles,
      totalCount: actualTotalCount,
      currentPage: page,
      totalPages: Math.ceil(actualTotalCount / limit)
    });
  } catch (error: any) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch files" },
      { status: 500 }
    );
  }
}
