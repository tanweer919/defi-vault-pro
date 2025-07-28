import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  let body: any;

  try {
    const { chainId } = await params;
    body = await request.json();

    const response = await fetch(
      `https://api.1inch.dev/swap/v6.0/${chainId}/swap`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        next: { revalidate: 0 }, // No cache for swap transactions
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to build swap transaction: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {

    // Return mock data in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        tx: {
          to: "0x1234567890123456789012345678901234567890",
          data: "0x",
          value: "0",
          gas: "200000",
          gasPrice: "20000000000",
        },
        protocols: [
          {
            name: "Uniswap V3",
            part: 100,
            fromTokenAddress:
              body?.src || "0x0000000000000000000000000000000000000000",
            toTokenAddress:
              body?.dst || "0x0000000000000000000000000000000000000000",
          },
        ],
      });
    }

    return NextResponse.json(
      { error: "Failed to build swap transaction" },
      { status: 500 },
    );
  }
}
