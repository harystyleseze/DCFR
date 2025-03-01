import { NextResponse } from "next/server";
import { createAutoDriveApi, apiCalls } from "@autonomys/auto-drive";

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY) {
      return NextResponse.json(
        { error: "AUTO_DRIVE_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { cid } = await req.json();

    if (!cid) {
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    const autoDrive = createAutoDriveApi({
      apiKey: process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY,
      network: "taurus",
    });

    await apiCalls.markObjectAsDeleted(autoDrive, { cid });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
