import { NextRequest, NextResponse } from "next/server";

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
      const response = await fetch(
        `https://api.1inch.dev/token/v1.2/${chainId}/metadata?address=${address}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
            "Content-Type": "application/json",
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch token metadata: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Get token list
      const response = await fetch(
        `https://api.1inch.dev/token/v1.2/${chainId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
            "Content-Type": "application/json",
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch token list: ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error: unknown) {
    console.error("Token API error:", error);

    // Return mock data in development
    if (process.env.NODE_ENV === "development") {
      const { searchParams } = request.nextUrl;
      const address = searchParams.get("address");

      if (address) {
        return NextResponse.json({
          address,
          symbol: "MOCK",
          name: "Mock Token",
          decimals: 18,
          logoURI: null,
        });
      } else {
        return NextResponse.json({
          tokens: [
            {
              address: "0x0000000000000000000000000000000000000000",
              symbol: "ETH",
              name: "Ethereum",
              decimals: 18,
              logoURI: null,
            },
            {
              address: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
              symbol: "USDC",
              name: "USD Coin",
              decimals: 6,
              logoURI: null,
            },
          ],
        });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 500 },
    );
  }
}
