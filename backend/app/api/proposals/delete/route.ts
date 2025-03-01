import { NextResponse } from "next/server";
import { AutoDriveService } from "../../../../lib/autoDrive";

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

    const autoDrive = new AutoDriveService(
      process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY
    );
    await autoDrive.deleteFile(cid);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
