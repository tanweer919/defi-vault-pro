import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ONEINCH_API_BASE = "https://api.1inch.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; orderHash?: string }> },
) {
  try {
    const { chainId, orderHash } = await params;

    // Production 1inch API integration
    const API_KEY = process.env.ONEINCH_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "1inch API key not configured" },
        { status: 500 },
      );
    }

    const endpoint = orderHash
      ? `${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/events/${orderHash}`
      : `${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/events`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const result = response.data;
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Fetch limit order events API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch limit order events" },
      { status: 500 },
    );
  }
}
