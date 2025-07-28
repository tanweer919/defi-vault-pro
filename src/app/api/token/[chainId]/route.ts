import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter required" },
        { status: 400 },
      );
    }

    // Handle native ETH token
    if (
      address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      return NextResponse.json({
        assets: {
          symbol: "ETH",
          name: "Ethereum",
          decimals: 18,
          logoURI:
            "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        },
      });
    }

    const response = await fetch(
      `https://api.1inch.dev/token-details/v1.0/details/${chainId}/${address}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour (token metadata rarely changes)
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch token metadata: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {

    return NextResponse.json({
      assets: {
        symbol: "UNKNOWN",
        name: "Unknown Token",
        decimals: 18,
        logoURI: null,
      },
    });
  }
}
