import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chainId: string; walletAddress: string }> },
) {
  try {
    const { chainId, walletAddress } = await params;
    return NextResponse.json({ chainId, walletAddress, hasActiveOrdersWithPermit: false });
  } catch (error) {
    console.error("Error in has-active-orders-with-permit route:", error);
    return NextResponse.json(
      { error: "Failed to check active orders with permit" },
      { status: 500 },
    );
  }
}
