import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    return NextResponse.json({ chainId, allowance: "0" });
  } catch (error) {
    console.error("Error in approve allowance route:", error);
    return NextResponse.json(
      { error: "Failed to load allowance" },
      { status: 500 },
    );
  }
}
