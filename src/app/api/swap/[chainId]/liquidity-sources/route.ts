import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    return NextResponse.json({ chainId, sources: [] });
  } catch (error) {
    console.error("Error in liquidity-sources route:", error);
    return NextResponse.json(
      { error: "Failed to load liquidity sources" },
      { status: 500 },
    );
  }
}
