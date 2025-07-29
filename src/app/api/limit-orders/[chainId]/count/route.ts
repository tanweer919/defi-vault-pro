import { NextRequest, NextResponse } from "next/server";

const ONEINCH_API_BASE = "https://api.1inch.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);

    // Demo mode handling
    if (process.env.NODE_ENV === "development") {
      const mockCount = {
        count: 42,
        active: 38,
        filled: 3,
        cancelled: 1,
        expired: 0,
      };

      return NextResponse.json(mockCount);
    }

    // Production 1inch API integration
    const API_KEY = process.env.ONEINCH_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "1inch API key not configured" },
        { status: 500 },
      );
    }

    const url = new URL(
      `${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/orders/count`,
    );

    // Add query parameters from request
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Fetch limit orders count API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch limit orders count" },
      { status: 500 },
    );
  }
}
