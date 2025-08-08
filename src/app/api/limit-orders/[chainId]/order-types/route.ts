import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const demo = searchParams.get("demo") === "true";

    if (demo) {
      // Return mock order types for demo mode
      return NextResponse.json([
        {
          id: "limit",
          name: "Limit Order",
          description: "Buy or sell at a specific price or better",
          enabled: true,
          minAmount: "0.001",
          maxAmount: "1000000",
          features: ["price_target", "expiration", "partial_fill"],
        },
        {
          id: "stop_limit",
          name: "Stop Limit",
          description: "Trigger a limit order when price reaches stop price",
          enabled: true,
          minAmount: "0.001",
          maxAmount: "1000000",
          features: ["stop_price", "limit_price", "expiration"],
        },
        {
          id: "trailing_stop",
          name: "Trailing Stop",
          description: "Stop that follows the price at a fixed distance",
          enabled: false,
          minAmount: "0.001",
          maxAmount: "1000000",
          features: ["trail_amount", "trail_percent"],
        },
        {
          id: "fill_or_kill",
          name: "Fill or Kill (FOK)",
          description: "Execute immediately and completely or cancel",
          enabled: true,
          minAmount: "0.001",
          maxAmount: "1000000",
          features: ["immediate_execution", "no_partial_fill"],
        },
        {
          id: "immediate_or_cancel",
          name: "Immediate or Cancel (IOC)",
          description: "Execute immediately, cancel unfilled portion",
          enabled: true,
          minAmount: "0.001",
          maxAmount: "1000000",
          features: ["immediate_execution", "partial_fill_allowed"],
        },
        {
          id: "iceberg",
          name: "Iceberg Order",
          description: "Large order split into smaller visible portions",
          enabled: false,
          minAmount: "1.0",
          maxAmount: "1000000",
          features: ["hidden_quantity", "visible_size"],
        },
      ]);
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.dev/v5.2/${chainId}/limit-order/order-types`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.data) {
      throw new Error("No data received from API");
    }

    const data = response.data;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting order types:", error);
    return NextResponse.json(
      { error: "Failed to get order types" },
      { status: 500 },
    );
  }
}
