import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ONEINCH_API_BASE = "https://api.1inch.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;


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
