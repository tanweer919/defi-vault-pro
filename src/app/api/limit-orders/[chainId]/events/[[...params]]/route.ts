import { NextRequest, NextResponse } from "next/server";

const ONEINCH_API_BASE = "https://api.1inch.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; orderHash?: string }> },
) {
  try {
    const { chainId, orderHash } = await params;

    // Demo mode handling
    if (process.env.NODE_ENV === "development") {
      const mockEvents = [
        {
          id: "event_1",
          type: "OrderCreated",
          orderHash: orderHash || "0x123",
          maker: "0x1234567890123456789012345678901234567890",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          blockNumber: 12345678,
          transactionHash: "0xabc123def456",
        },
        {
          id: "event_2",
          type: "OrderFilled",
          orderHash: orderHash || "0x123",
          taker: "0x0987654321098765432109876543210987654321",
          filledAmount: "500000000000000000",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          blockNumber: 12345679,
          transactionHash: "0xdef456abc123",
        },
      ];

      return NextResponse.json(
        orderHash ? mockEvents : mockEvents.slice(0, 10),
      );
    }

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

    const response = await fetch(endpoint, {
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
    console.error("Fetch limit order events API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch limit order events" },
      { status: 500 },
    );
  }
}
