import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ONEINCH_API_BASE = "https://api.1inch.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);

    // Production 1inch API integration
    const API_KEY = process.env.ONEINCH_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "1inch API key not configured" },
        { status: 500 },
      );
    }

    const url = new URL(`${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/count`);

    // Add query parameters from request
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const result = response.data;
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Fetch limit orders count API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch limit orders count" },
      { status: 500 },
    );
  }
}
