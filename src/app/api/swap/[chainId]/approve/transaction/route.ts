import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ chainId, ok: true, body });
  } catch (error) {
    console.error("Error in approve transaction route:", error);
    return NextResponse.json(
      { error: "Failed to build approve transaction" },
      { status: 500 },
    );
  }
}
