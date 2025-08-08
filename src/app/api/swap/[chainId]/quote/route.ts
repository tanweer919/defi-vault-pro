import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const fromToken = searchParams.get("fromTokenAddress");
    const toToken = searchParams.get("toTokenAddress");
    const amount = searchParams.get("amount");

    if (!fromToken || !toToken || !amount) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    return NextResponse.json({ chainId, fromToken, toToken, amount, price: "0" });
  } catch (error) {
    console.error("Error in swap quote route:", error);
    return NextResponse.json(
      { error: "Failed to get swap quote" },
      { status: 500 },
    );
  }
}
