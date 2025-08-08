import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ONEINCH_API_BASE = "https://api.1inch.dev";
const SUPPORTED_CHAINS = ["1", "137", "56", "42161"]; // Ethereum, Polygon, BSC, Arbitrum

interface DemoOrder {
  id: string;
  orderId: string;
  maker: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  salt: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  filledAmount: string;
  remainingAmount: string;
  chainId: number;
  signature: string;
}

// Demo orders storage (in production, use database)
const demoOrders = new Map<string, DemoOrder>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const maker = searchParams.get("maker");

    // Demo mode - return stored demo orders
    if (searchParams.get("demo") === "true") {
      const orders = Array.from(demoOrders.values())
        .filter((order) => order.chainId === parseInt(chainId))
        .filter(
          (order) =>
            !maker || order.maker.toLowerCase() === maker.toLowerCase(),
        );

      return NextResponse.json(orders);
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
      `${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/address/${maker}`,
    );
    if (maker) {
      url.searchParams.set("maker", maker);
    }

    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const result = response.data;
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Fetch limit orders API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch limit orders" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const orderData = await request.json();

    // Validate chain ID
    if (!SUPPORTED_CHAINS.includes(chainId)) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 },
      );
    }

    // Validate required fields
    const {
      makerAsset,
      takerAsset,
      makingAmount,
      takingAmount,
      maker,
      expiry,
    } = orderData;
    if (
      !makerAsset ||
      !takerAsset ||
      !makingAmount ||
      !takingAmount ||
      !maker
    ) {
      return NextResponse.json(
        { error: "Missing required order parameters" },
        { status: 400 },
      );
    }

    // Demo mode handling
    if (orderData.demo) {
      const orderId = `demo_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const mockOrder: DemoOrder = {
        id: orderId,
        orderId,
        maker,
        makerAsset,
        takerAsset,
        makingAmount,
        takingAmount,
        salt: Date.now().toString(),
        status: "active",
        createdAt: new Date().toISOString(),
        expiresAt: expiry
          ? new Date(expiry * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        filledAmount: "0",
        remainingAmount: makingAmount,
        chainId: parseInt(chainId),
        signature: `0x${"0".repeat(130)}`, // Mock signature
      };

      // Store demo order
      demoOrders.set(orderId, mockOrder);

      return NextResponse.json({
        success: true,
        order: mockOrder,
      });
    }

    // Production 1inch API integration
    const API_KEY = process.env.ONEINCH_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "1inch API key not configured" },
        { status: 500 },
      );
    }

    // Prepare order for 1inch API
    const oneInchOrderData = {
      makerAsset,
      takerAsset,
      makingAmount,
      takingAmount,
      maker,
      receiver: maker,
      allowedSender: "0x0000000000000000000000000000000000000000",
      predicate: "0x",
      permit: "0x",
      preInteraction: "0x",
      postInteraction: "0x",
      salt: orderData.salt || Date.now().toString(),
      ...(expiry && { expiry }),
    };

    const response = await axios.post(
      `${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/order`,
      oneInchOrderData,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = response.data;

    return NextResponse.json({
      success: true,
      order: result,
    });
  } catch (error: unknown) {
    console.error("Create limit order API error:", error);
    return NextResponse.json(
      {
        error: "Failed to create limit order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
