import { NextResponse } from "next/server";
import { AutoDriveService } from "@/lib/autoDrive";

export async function GET(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY) {
      return NextResponse.json(
        { error: "AUTO_DRIVE_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const cid = searchParams.get("cid");

    if (!cid) {
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    const autoDrive = new AutoDriveService(process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY);
    const metadata = await autoDrive.getFileMetadata(cid);

    return NextResponse.json({ metadata });
  } catch (error: any) {
    console.error("Error getting file metadata:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get file metadata" },
      { status: 500 }
    );
  }
} 