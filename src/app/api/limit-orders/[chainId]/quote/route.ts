import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ONEINCH_API_BASE = "https://api.1inch.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);

    const makerAsset = searchParams.get("makerAsset");
    const takerAsset = searchParams.get("takerAsset");
    const takingAmount = searchParams.get("takingAmount");

    if (!makerAsset || !takerAsset || !takingAmount) {
      return NextResponse.json(
        { error: "makerAsset, takerAsset, and takingAmount are required" },
        { status: 400 },
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

    const url = new URL(`${ONEINCH_API_BASE}/orderbook/v4.0/${chainId}/quote`);
    url.searchParams.set("makerAsset", makerAsset);
    url.searchParams.set("takerAsset", takerAsset);
    url.searchParams.set("takingAmount", takingAmount);

    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const result = response.data;
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Calculate making amount API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate making amount" },
      { status: 500 },
    );
  }
}
