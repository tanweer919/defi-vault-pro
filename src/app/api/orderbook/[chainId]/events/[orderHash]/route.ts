import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chainId: string; orderHash: string }> },
) {
  try {
    const { chainId, orderHash } = await params;
    return NextResponse.json({ chainId, orderHash, events: [] });
  } catch (error) {
    console.error("Error in order events route:", error);
    return NextResponse.json(
      { error: "Failed to load order events" },
      { status: 500 },
    );
  }
}
