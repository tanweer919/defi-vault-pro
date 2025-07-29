import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string } },
) {
  try {
    const { chainId } = params;
    const { searchParams } = new URL(request.url);

    const baseToken = searchParams.get("baseToken");
    const quoteToken = searchParams.get("quoteToken");
    const demo = searchParams.get("demo") === "true";

    if (!baseToken || !quoteToken) {
      return NextResponse.json(
        { error: "Missing required parameters: baseToken, quoteToken" },
        { status: 400 },
      );
    }

    if (demo || process.env.NODE_ENV === "development") {
      // Return mock orderbook for demo mode
      const basePrice = 3000;
      const now = Date.now();

      const bids = Array.from({ length: 20 }, (_, i) => ({
        id: `bid_${i}`,
        price: (basePrice * (0.999 - i * 0.0005)).toFixed(6),
        amount: (Math.random() * 2 + 0.1).toFixed(4),
        maker: "0x" + Math.random().toString(16).substr(2, 40),
        timestamp: new Date(now - Math.random() * 3600000).toISOString(),
        fills: Math.floor(Math.random() * 5),
      }));

      const asks = Array.from({ length: 20 }, (_, i) => ({
        id: `ask_${i}`,
        price: (basePrice * (1.001 + i * 0.0005)).toFixed(6),
        amount: (Math.random() * 2 + 0.1).toFixed(4),
        maker: "0x" + Math.random().toString(16).substr(2, 40),
        timestamp: new Date(now - Math.random() * 3600000).toISOString(),
        fills: Math.floor(Math.random() * 5),
      }));

      const lastTrades = Array.from({ length: 10 }, (_, i) => ({
        id: `trade_${i}`,
        price: (basePrice + (Math.random() - 0.5) * 10).toFixed(6),
        amount: (Math.random() * 1 + 0.01).toFixed(4),
        side: Math.random() > 0.5 ? "buy" : "sell",
        timestamp: new Date(now - i * 60000).toISOString(),
        txHash: "0x" + Math.random().toString(16).substr(2, 64),
      }));

      return NextResponse.json({
        pair: `${baseToken}/${quoteToken}`,
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
        bids: bids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)),
        asks: asks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
        lastTrades,
        stats: {
          bestBid: Math.max(...bids.map((b) => parseFloat(b.price))).toFixed(6),
          bestAsk: Math.min(...asks.map((a) => parseFloat(a.price))).toFixed(6),
          spread:
            (
              ((Math.min(...asks.map((a) => parseFloat(a.price))) -
                Math.max(...bids.map((b) => parseFloat(b.price)))) /
                Math.max(...bids.map((b) => parseFloat(b.price)))) *
              100
            ).toFixed(3) + "%",
          volume24h: (Math.random() * 10000).toFixed(2),
          priceChange24h: ((Math.random() - 0.5) * 10).toFixed(2) + "%",
          high24h: (basePrice * 1.05).toFixed(2),
          low24h: (basePrice * 0.95).toFixed(2),
        },
        timestamp: new Date().toISOString(),
      });
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.io/v5.2/${chainId}/limit-order/orderbook`;
    const queryParams = new URLSearchParams({
      baseToken,
      quoteToken,
    });

    const response = await fetch(`${apiUrl}?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`1inch API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting orderbook:", error);
    return NextResponse.json(
      { error: "Failed to get orderbook" },
      { status: 500 },
    );
  }
}
