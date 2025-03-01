import { NextResponse } from "next/server";
import { ContractService } from "@/lib/contract";

export async function POST(req: Request) {
  try {
    const { proposalId, support } = await req.json();

    if (typeof proposalId !== "number" || typeof support !== "boolean") {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const contractService = new ContractService();
    await contractService.voteOnProposal(proposalId, support);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
