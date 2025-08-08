import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const orderHash = searchParams.get("orderHash");
    return NextResponse.json({ chainId, orderHash, events: [] });
  } catch (error) {
    console.error("Error in orderbook events route:", error);
    return NextResponse.json(
      { error: "Failed to load orderbook events" },
      { status: 500 },
    );
  }
}
