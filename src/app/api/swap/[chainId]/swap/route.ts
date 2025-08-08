import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ chainId, swapBuilt: false, body });
  } catch (error) {
    console.error("Error in swap route:", error);
    return NextResponse.json(
      { error: "Failed to build swap" },
      { status: 500 },
    );
  }
}
