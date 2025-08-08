import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    return NextResponse.json({ chainId, spender: null });
  } catch (error) {
    console.error("Error in approve spender route:", error);
    return NextResponse.json(
      { error: "Failed to load spender" },
      { status: 500 },
    );
  }
}
