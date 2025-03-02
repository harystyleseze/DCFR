import { NextResponse } from "next/server";
import { createAutoDriveApi, apiCalls } from "@autonomys/auto-drive";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY) {
      return NextResponse.json(
        { error: "AUTO_DRIVE_API_KEY not configured" },
        { status: 500 }
      );
    }

    const api = createAutoDriveApi({
      apiKey: process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY,
      network: "taurus",
    });

    const sharedFiles = await apiCalls.getSharedWithMe(api, {
      limit: 100,
      offset: 0,
    });

    return NextResponse.json({
      files: sharedFiles.rows.map((file) => ({
        name: file.name,
        headCid: file.headCid,
        size: file.size,
      })),
      totalCount: sharedFiles.totalCount,
    });
  } catch (error: any) {
    console.error("Error fetching shared files:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch shared files" },
      { status: 500 }
    );
  }
} 