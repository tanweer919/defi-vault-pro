import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const tokens = searchParams.get("tokens");
    const currency = searchParams.get("currency") || "USD";

    if (!tokens) {
      return NextResponse.json(
        { error: "Tokens parameter required" },
        { status: 400 },
      );
    }

    const response = await axios.get(
      `https://api.1inch.dev/price/v1.1/${chainId}?tokens=${tokens}&currency=${currency}`,
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
    console.error("Price API error:", error);


    return NextResponse.json(
      { error: "Failed to fetch prices" },
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
    const body = await request.json();
    const { tokens, currency = "USD" } = body.params;
    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json(
        { error: "Tokens array required" },
        { status: 400 },
      );
    }

    const response = await axios.post(
      `https://api.1inch.dev/price/v1.1/${chainId}`,
      {
        currency,
        tokens,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;
    console.log(data);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Price API error:", error);


    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 },
    );
  }
}
