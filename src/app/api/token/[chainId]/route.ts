import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = request.nextUrl;
    const address = searchParams.get("address");

    if (address) {
      // Get specific token metadata
      const response = await axios.get(
        `https://api.1inch.dev/token/v1.4/${chainId}/custom/${address}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;
      return NextResponse.json(data);
    } else {
      // Get token list
      const response = await axios.get(
        `https://api.1inch.dev/token/v1.2/${chainId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;
      return NextResponse.json(data);
    }
  } catch (error: unknown) {
    console.error("Token API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 500 },
    );
  }
}
