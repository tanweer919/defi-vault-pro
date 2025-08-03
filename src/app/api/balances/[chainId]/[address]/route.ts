import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; address: string }> },
) {
  try {
    const { chainId, address } = await params;

    const response = await axios.get(
      `https://api.1inch.dev/balance/v1.2/${chainId}/balances/${address}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Balance API error:", error);

    // Return mock data in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "1.5",
        "0xa0b86a33e6441e5ba2ad8d73b8e76c6b72c2e6ef": "1000.0",
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "0.05",
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch balances" },
      { status: 500 },
    );
  }
}
