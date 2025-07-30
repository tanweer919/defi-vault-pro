import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);

    const baseToken = searchParams.get("baseToken");
    const quoteToken = searchParams.get("quoteToken");
    const demo = searchParams.get("demo") === "true";

    if (demo || process.env.NODE_ENV === "development") {
      // Return mock market stats for demo mode
      const now = Date.now();

      const mockStats = {
        global: {
          totalOrders: 15742,
          activeOrders: 3421,
          totalVolume24h: (Math.random() * 50000000).toFixed(2),
          totalValueLocked: (Math.random() * 100000000).toFixed(2),
          averageOrderSize: (Math.random() * 5000).toFixed(2),
          topPairs: [
            {
              pair: "ETH/USDT",
              volume: (Math.random() * 10000000).toFixed(2),
              orders: 1234,
            },
            {
              pair: "WBTC/ETH",
              volume: (Math.random() * 5000000).toFixed(2),
              orders: 856,
            },
            {
              pair: "USDC/USDT",
              volume: (Math.random() * 8000000).toFixed(2),
              orders: 2341,
            },
            {
              pair: "DAI/USDC",
              volume: (Math.random() * 3000000).toFixed(2),
              orders: 567,
            },
            {
              pair: "WETH/DAI",
              volume: (Math.random() * 4000000).toFixed(2),
              orders: 789,
            },
          ],
          priceChange24h: ((Math.random() - 0.5) * 10).toFixed(2) + "%",
        },
        ...(baseToken &&
          quoteToken && {
            pair: {
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
              stats: {
                volume24h: (Math.random() * 1000000).toFixed(2),
                priceChange24h: ((Math.random() - 0.5) * 5).toFixed(2) + "%",
                high24h: (3000 * (1 + Math.random() * 0.1)).toFixed(2),
                low24h: (3000 * (1 - Math.random() * 0.1)).toFixed(2),
                currentPrice: (3000 + (Math.random() - 0.5) * 100).toFixed(2),
                totalOrders: Math.floor(Math.random() * 500) + 50,
                activeOrders: Math.floor(Math.random() * 100) + 10,
                avgSpread: (Math.random() * 0.5 + 0.1).toFixed(3) + "%",
                marketCap: (Math.random() * 50000000).toFixed(2),
              },
              recentActivity: Array.from({ length: 10 }, (_, i) => ({
                type: ["order_created", "order_filled", "order_cancelled"][
                  Math.floor(Math.random() * 3)
                ],
                amount: (Math.random() * 10).toFixed(4),
                price: (3000 + (Math.random() - 0.5) * 50).toFixed(2),
                timestamp: new Date(now - i * 60000).toISOString(),
                txHash: "0x" + Math.random().toString(16).substr(2, 64),
              })),
            },
          }),
        networkStats: {
          gasPrice: (Math.random() * 50 + 10).toFixed(0) + " gwei",
          blockNumber: Math.floor(Math.random() * 1000000) + 18500000,
          networkCongestion: ["Low", "Medium", "High"][
            Math.floor(Math.random() * 3)
          ],
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(mockStats);
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.io/v5.2/${chainId}/limit-order/market-stats`;
    const queryParams = new URLSearchParams();

    if (baseToken && quoteToken) {
      queryParams.append("baseToken", baseToken);
      queryParams.append("quoteToken", quoteToken);
    }

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
    console.error("Error getting market stats:", error);
    return NextResponse.json(
      { error: "Failed to get market stats" },
      { status: 500 },
    );
  }
}
