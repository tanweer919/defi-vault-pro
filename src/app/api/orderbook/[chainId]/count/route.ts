import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    return NextResponse.json({ chainId, count: 0 });
  } catch (error) {
    console.error("Error in orderbook count route:", error);
    return NextResponse.json(
      { error: "Failed to load order count" },
      { status: 500 },
    );
  }
}
