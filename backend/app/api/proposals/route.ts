import { NextResponse } from "next/server";
import { createAutoDriveApi } from "@autonomys/auto-drive";
import { ContractService } from "../../../lib/contract";
import { BrowserProvider } from "ethers";

// Initialize AutoDrive with API key
const autoDrive = createAutoDriveApi({
  apiKey: process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY || "",
  network: "taurus",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    console.log("Starting file upload process...");

    if (!process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY) {
      console.error("NEXT_PUBLIC_AUTO_DRIVE_API_KEY not configured");
      return NextResponse.json(
        { error: "NEXT_PUBLIC_AUTO_DRIVE_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Parse the FormData
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file provided or invalid file" },
        { status: 400 }
      );
    }

    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    try {
      console.log("Attempting to upload to AutoDrive...");

      const cid = await autoDrive.uploadFileFromInput(file as File, {
        compression: true,
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`);
        },
      });

      console.log("Upload successful, CID:", cid);

      return NextResponse.json({
        success: true,
        cid,
        metadata: {
          name: file.name || "unnamed",
          totalSize: file.size,
          type: file.type || "application/octet-stream",
        },
      });
    } catch (uploadError: any) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }
  } catch (error: any) {
    console.error("Error in /api/proposals:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get("proposalId");

    if (!proposalId) {
      return NextResponse.json(
        { error: "Proposal ID required" },
        { status: 400 }
      );
    }

    const contractService = new ContractService();
    const proposal = await contractService.getProposal(Number(proposalId));
    const timeLeft = await contractService.getVotingTimeLeft(
      Number(proposalId)
    );
    const isPassed = await contractService.isProposalPassed(Number(proposalId));

    return NextResponse.json({
      proposal,
      timeLeft,
      isPassed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
