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

    return NextResponse.json(
      { error: "Failed to fetch balances" },
      { status: 500 },
    );
  }
}
