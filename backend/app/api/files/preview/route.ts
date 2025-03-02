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

    const autoDrive = new AutoDriveService(
      process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY
    );

    const stream = await autoDrive.downloadFile(cid);
    const metadata = await autoDrive.getFileMetadata(cid);
    
    // Convert AsyncIterable<Buffer> to ReadableStream
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    
    // Create response from the readable stream
    const response = new Response(readableStream);
    
    // Set appropriate headers for inline display
    response.headers.set("Content-Type", metadata.type || "application/octet-stream");
    response.headers.set("Content-Disposition", `inline; filename="${metadata.name}"`);

    return response;
  } catch (error: any) {
    console.error("Error previewing file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to preview file" },
      { status: 500 }
    );
  }
} 