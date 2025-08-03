import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ONEINCH_API_BASE = "https://api.1inch.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; address: string }> },
) {
  try {
    const { chainId, address } = await params;
    const { searchParams } = new URL(request.url);
    const demo = searchParams.get("demo") === "true";

    // Demo mode - return mock orders
    if (process.env.NODE_ENV === "development" || demo) {
      const mockOrders = [
        {
          id: `demo_${Date.now()}_1`,
          orderId: `demo_${Date.now()}_1`,
          maker: address,
          makerAsset: "0x0000000000000000000000000000000000000000",
          takerAsset: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
          makingAmount: "1000000000000000000", // 1 ETH
          takingAmount: "3200000000", // 3200 USDC
          salt: Date.now().toString(),
          status: "active",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          filledAmount: "0",
          remainingAmount: "1000000000000000000",
          chainId: parseInt(chainId),
          signature: `0x${"0".repeat(130)}`,
        },
        {
          id: `demo_${Date.now()}_2`,
          orderId: `demo_${Date.now()}_2`,
          maker: address,
          makerAsset: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
          takerAsset: "0x0000000000000000000000000000000000000000",
          makingAmount: "5000000000", // 5000 USDC
          takingAmount: "1500000000000000000", // 1.5 ETH
          salt: (Date.now() + 1).toString(),
          status: "active",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          filledAmount: "0",
          remainingAmount: "5000000000",
          chainId: parseInt(chainId),
          signature: `0x${"1".repeat(130)}`,
        },
      ];

      return NextResponse.json(mockOrders);
    }

    // Production 1inch API integration
    const API_KEY = process.env.ONEINCH_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "1inch API key not configured" },
        { status: 500 },
      );
    }

    const url = new URL(`${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/orders`);
    url.searchParams.set("maker", address);

    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const result = response.data;
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Fetch user limit orders API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user limit orders" },
      { status: 500 },
    );
  }
}
