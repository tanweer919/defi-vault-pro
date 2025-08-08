import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 100, 500) : 100;

    return NextResponse.json({ chainId, orders: [], limit });
  } catch (error) {
    console.error("Error in orderbook all route:", error);
    return NextResponse.json(
      { error: "Failed to load all orderbook entries" },
      { status: 500 },
    );
  }
}
