import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ONEINCH_API_BASE = "https://api.1inch.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;

    // Demo mode handling
    if (process.env.NODE_ENV === "development") {
      const mockPairs = [
        {
          makerAsset: "0x0000000000000000000000000000000000000000",
          takerAsset: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
          makerSymbol: "ETH",
          takerSymbol: "USDC",
          orderCount: 15,
          totalVolume: "125.5",
        },
        {
          makerAsset: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
          takerAsset: "0x0000000000000000000000000000000000000000",
          makerSymbol: "USDC",
          takerSymbol: "ETH",
          orderCount: 23,
          totalVolume: "78932.45",
        },
        {
          makerAsset: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          takerAsset: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
          makerSymbol: "WBTC",
          takerSymbol: "USDC",
          orderCount: 8,
          totalVolume: "3.2",
        },
      ];

      return NextResponse.json(mockPairs);
    }

    // Production 1inch API integration
    const API_KEY = process.env.ONEINCH_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "1inch API key not configured" },
        { status: 500 },
      );
    }

    const response = await axios.get(
      `${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/active-orders-pairs`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      },
    );

    const result = response.data;
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Fetch active token pairs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch active token pairs" },
      { status: 500 },
    );
  }
}
