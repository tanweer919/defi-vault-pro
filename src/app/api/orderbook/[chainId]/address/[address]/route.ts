import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; address: string }> },
) {
  try {
    const { chainId, address } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 200) : 50;

    return NextResponse.json({ chainId, address, bids: [], asks: [], limit });
  } catch (error) {
    console.error("Error in orderbook address route:", error);
    return NextResponse.json(
      { error: "Failed to load orderbook for address" },
      { status: 500 },
    );
  }
}
