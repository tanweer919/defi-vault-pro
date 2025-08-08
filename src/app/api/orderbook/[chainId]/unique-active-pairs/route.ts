import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    return NextResponse.json({ chainId, pairs: [] });
  } catch (error) {
    console.error("Error in unique-active-pairs route:", error);
    return NextResponse.json(
      { error: "Failed to load unique active pairs" },
      { status: 500 },
    );
  }
}
