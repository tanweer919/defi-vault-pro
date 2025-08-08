import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    return NextResponse.json({ chainId, tokens: [] });
  } catch (error) {
    console.error("Error in swap tokens route:", error);
    return NextResponse.json(
      { error: "Failed to load tokens" },
      { status: 500 },
    );
  }
}
