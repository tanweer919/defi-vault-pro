import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = request.nextUrl;

    // Validate required parameters
    const src = searchParams.get("src");
    const dst = searchParams.get("dst");
    const amount = searchParams.get("amount");
    const from = searchParams.get("from");

    if (!src || !dst || !amount || !from) {
      return NextResponse.json(
        { error: "Missing required parameters: src, dst, amount, from" },
        { status: 400 },
      );
    }

    // Build query string for 1inch Fusion Plus API
    const queryParams = new URLSearchParams({
      src,
      dst,
      amount,
      from,
      ...Object.fromEntries(searchParams.entries()),
    });

    const response = await axios.get(
      `https://api.1inch.dev/fusion/quote/v1.0/${chainId}?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;

    // Format the response for the frontend
    const formattedResponse = {
      fromToken: {
        address: data.src,
        symbol: data.srcSymbol,
        decimals: data.srcDecimals,
      },
      toToken: {
        address: data.dst,
        symbol: data.dstSymbol,
        decimals: data.dstDecimals,
      },
      fromAmount: data.srcAmount,
      toAmount: data.dstAmount,
      protocols: data.protocols || [],
      estimatedGas: data.estimatedGas,
      priceImpact: data.priceImpact,
      minimumReceived: data.dstAmount, // Will be calculated with slippage
      route: data.route || [],
      quoteId: data.quoteId,
    };

    return NextResponse.json(formattedResponse);
  } catch (error: unknown) {
    console.error("Swap quote API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch swap quote" },
      { status: 500 },
    );
  }
}
