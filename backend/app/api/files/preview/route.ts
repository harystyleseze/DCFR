import { NextResponse } from "next/server";
import { AutoDriveService } from "@/lib/autoDrive";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

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

    const autoDrive = new AutoDriveService(
      process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY
    );

    const stream = await autoDrive.downloadFile(cid);
    const metadata = await autoDrive.getFileMetadata(cid);

    // Collect all chunks into a single buffer
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Create response with the buffer
    const response = new NextResponse(buffer);
    
    // Set appropriate headers for inline display
    response.headers.set("Content-Type", metadata.type || "application/octet-stream");
    response.headers.set("Content-Disposition", `inline; filename="${metadata.name}"`);
    response.headers.set("Content-Length", buffer.length.toString());
    response.headers.set("Cache-Control", "no-store, max-age=0");

    return response;
  } catch (error: any) {
    console.error("Error previewing file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to preview file" },
      { status: 500 }
    );
  }
} 