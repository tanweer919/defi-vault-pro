import { NextRequest, NextResponse } from "next/server";

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

    const response = await fetch(
      `https://api.1inch.dev/price/v1.1/${chainId}?tokens=${tokens}&currency=${currency}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Price API error:", error);

    // Return mock prices in development
    if (process.env.NODE_ENV === "development") {
      const tokenList =
        request.nextUrl.searchParams.get("tokens")?.split(",") || [];
      const mockPrices: Record<string, number> = {};

      tokenList.forEach((token) => {
        if (token.includes("eeeeeeee")) {
          mockPrices[token] = 2800;
        } else if (token.includes("a0b86a33")) {
          mockPrices[token] = 1;
        } else if (token.includes("2260fac5")) {
          mockPrices[token] = 45000;
        } else {
          mockPrices[token] = Math.random() * 100;
        }
      });

      return NextResponse.json(mockPrices);
    }

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

    const response = await fetch(
      `https://api.1inch.dev/price/v1.1/${chainId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
        body: JSON.stringify({
          currency,
          tokens,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Price API error:", error);

    // Return mock prices in development
    if (process.env.NODE_ENV === "development") {
      const tokenList =
        request.nextUrl.searchParams.get("tokens")?.split(",") || [];
      const mockPrices: Record<string, number> = {};

      tokenList.forEach((token) => {
        if (token.includes("eeeeeeee")) {
          mockPrices[token] = 2800;
        } else if (token.includes("a0b86a33")) {
          mockPrices[token] = 1;
        } else if (token.includes("2260fac5")) {
          mockPrices[token] = 45000;
        } else {
          mockPrices[token] = Math.random() * 100;
        }
      });

      return NextResponse.json(mockPrices);
    }

    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 },
    );
  }
}
