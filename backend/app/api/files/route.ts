import { NextResponse } from "next/server";
import { AutoDriveService } from "@/lib/autoDrive";
import { ContractService, ProposalType } from "@/lib/contract";
import { JsonRpcProvider } from "ethers";
import { config } from "@/lib/config";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY) {
      return NextResponse.json(
        { error: "AUTO_DRIVE_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Initialize AutoDrive
    const autoDrive = new AutoDriveService(
      process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY
    );

    // Get all files
    const { files } = await autoDrive.getFiles();

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
    const activeFiles = files.filter((file) => !deletedCids.includes(file.cid));

    // Get metadata for each file
    const filesWithMetadata = await Promise.all(
      activeFiles.map(async (file) => {
        try {
          const metadata = await autoDrive.getFileMetadata(file.cid);
          return {
            ...file,
            type: metadata.type,
          };
        } catch (error) {
          console.error(`Error getting metadata for file ${file.cid}:`, error);
          return file;
        }
      })
    );

    return NextResponse.json({ files: filesWithMetadata });
  } catch (error: any) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch files" },
      { status: 500 }
    );
  }
}
