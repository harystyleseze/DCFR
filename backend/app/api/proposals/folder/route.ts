import { NextResponse } from "next/server";
import { AutoDriveService } from "../../../../lib/autoDrive";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    console.log("Starting folder upload process...");

    if (!process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY) {
      console.error("NEXT_PUBLIC_AUTO_DRIVE_API_KEY not configured");
      return NextResponse.json(
        { error: "NEXT_PUBLIC_AUTO_DRIVE_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Parse the FormData
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    console.log("Files received:", files.length);

    try {
      console.log("Attempting to upload to AutoDrive...");

      const autoDrive = new AutoDriveService(
        process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY
      );

      const result = await autoDrive.uploadFolder(files as unknown as FileList);

      console.log("Upload successful:", result);

      // Get the total size of all files
      const totalSize = files.reduce(
        (acc: number, file: any) => acc + file.size,
        0
      );

      return NextResponse.json({
        success: true,
        cid: result.cid,
        name: result.name,
        totalSize,
      });
    } catch (uploadError: any) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }
  } catch (error: any) {
    console.error("Error in /api/proposals/folder:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
