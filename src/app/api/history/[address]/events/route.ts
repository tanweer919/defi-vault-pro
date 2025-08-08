import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 100) : 20;

    return NextResponse.json({ address, events: [], limit });
  } catch (error) {
    console.error("Error in history events route:", error);
    return NextResponse.json(
      { error: "Failed to load history events" },
      { status: 500 },
    );
  }
}
