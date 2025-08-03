import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ONEINCH_API_BASE = "https://api.1inch.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; orderHash: string }> },
) {
  try {
    const { chainId, orderHash } = await params;

    // Demo mode handling
    if (process.env.NODE_ENV === "development") {
      const mockOrder = {
        id: orderHash,
        orderId: orderHash,
        maker: "0x1234567890123456789012345678901234567890",
        makerAsset: "0x0000000000000000000000000000000000000000",
        takerAsset: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
        makingAmount: "1000000000000000000",
        takingAmount: "3200000000",
        salt: Date.now().toString(),
        status: "active",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        filledAmount: "0",
        remainingAmount: "1000000000000000000",
        chainId: parseInt(chainId),
        signature: `0x${"0".repeat(130)}`,
      };

      return NextResponse.json(mockOrder);
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
      `${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/order/${orderHash}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      },
    );

    const result = response.data;
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Fetch limit order by hash API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch limit order" },
      { status: 500 },
    );
  }
}
