import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);

    const baseToken = searchParams.get("baseToken");
    const quoteToken = searchParams.get("quoteToken");
    const depth = parseInt(searchParams.get("depth") || "10");
    const demo = searchParams.get("demo") === "true";

    if (!baseToken || !quoteToken) {
      return NextResponse.json(
        { error: "Missing required parameters: baseToken, quoteToken" },
        { status: 400 },
      );
    }

    if (demo) {
      // Return mock market depth for demo mode
      const basePrice = 3000; // Base price around $3000
      const spread = 0.001; // 0.1% spread

      const bids = Array.from({ length: depth }, (_, i) => {
        const priceOffset = (i + 1) * spread;
        const price = basePrice * (1 - priceOffset);
        const amount = Math.random() * 5 + 0.1;
        const total = amount * price;

        return {
          price: price.toFixed(6),
          amount: amount.toFixed(4),
          total: total.toFixed(2),
          count: Math.floor(Math.random() * 10) + 1,
        };
      });

      const asks = Array.from({ length: depth }, (_, i) => {
        const priceOffset = (i + 1) * spread;
        const price = basePrice * (1 + priceOffset);
        const amount = Math.random() * 5 + 0.1;
        const total = amount * price;

        return {
          price: price.toFixed(6),
          amount: amount.toFixed(4),
          total: total.toFixed(2),
          count: Math.floor(Math.random() * 10) + 1,
        };
      });

      return NextResponse.json({
        baseToken: {
          address: baseToken,
          symbol: "BASE",
          decimals: 18,
        },
        quoteToken: {
          address: quoteToken,
          symbol: "QUOTE",
          decimals: 6,
        },
        marketPrice: basePrice.toFixed(2),
        spread: (spread * 100).toFixed(3) + "%",
        bids,
        asks,
        timestamp: new Date().toISOString(),
        depth,
        totalBidVolume: bids
          .reduce((sum, bid) => sum + parseFloat(bid.total), 0)
          .toFixed(2),
        totalAskVolume: asks
          .reduce((sum, ask) => sum + parseFloat(ask.total), 0)
          .toFixed(2),
      });
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.io/v5.2/${chainId}/limit-order/market-depth`;
    const queryParams = new URLSearchParams({
      baseToken,
      quoteToken,
      depth: depth.toString(),
    });

    const response = await axios.get(`${apiUrl}?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    }

    const data = response.data;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting market depth:", error);
    return NextResponse.json(
      { error: "Failed to get market depth" },
      { status: 500 },
    );
  }
}
