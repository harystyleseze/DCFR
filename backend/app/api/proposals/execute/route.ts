import { NextResponse } from "next/server";
import { ContractService } from "@/lib/contract";

export async function POST(req: Request) {
  try {
    const { proposalId } = await req.json();

    if (typeof proposalId !== "number") {
      return NextResponse.json(
        { error: "Invalid proposal ID" },
        { status: 400 }
      );
    }

    const contractService = new ContractService();

    // Check if proposal has passed
    const isPassed = await contractService.isProposalPassed(proposalId);
    if (!isPassed) {
      return NextResponse.json(
        { error: "Proposal has not passed" },
        { status: 400 }
      );
    }

    // Execute the proposal
    await contractService.executeProposal(proposalId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
