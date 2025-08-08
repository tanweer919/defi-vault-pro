import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chainId: string; walletAddress: string; token: string }> },
) {
  try {
    const { chainId, walletAddress, token } = await params;
    return NextResponse.json({ chainId, walletAddress, token, hasActiveOrdersWithPermit: false });
  } catch (error) {
    console.error("Error in has-active-orders-with-permit token route:", error);
    return NextResponse.json(
      { error: "Failed to check active orders with permit for token" },
      { status: 500 },
    );
  }
}
