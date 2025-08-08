import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);

    const fromToken = searchParams.get("fromToken");
    const toToken = searchParams.get("toToken");
    const amount = searchParams.get("amount");
    const slippage = parseFloat(searchParams.get("slippage") || "1");
    const demo = searchParams.get("demo") === "true";

    if (!fromToken || !toToken || !amount) {
      return NextResponse.json(
        { error: "Missing required parameters: fromToken, toToken, amount" },
        { status: 400 },
      );
    }

    if (demo) {
      // Return mock optimal pricing for demo mode
      const basePrice = 3000;
      const marketPrice = basePrice + (Math.random() - 0.5) * 100;

      // Simulate different pricing strategies
      const strategies = [
        {
          name: "Conservative",
          description: "Lower price impact, higher fill probability",
          suggestedPrice: (marketPrice * 0.995).toFixed(6),
          expectedFillTime: "5-15 minutes",
          fillProbability: "85%",
          priceImpact: "0.02%",
        },
        {
          name: "Market",
          description: "Current market price",
          suggestedPrice: marketPrice.toFixed(6),
          expectedFillTime: "1-5 minutes",
          fillProbability: "95%",
          priceImpact: "0.05%",
        },
        {
          name: "Aggressive",
          description: "Better price, lower fill probability",
          suggestedPrice: (marketPrice * 1.005).toFixed(6),
          expectedFillTime: "15-60 minutes",
          fillProbability: "65%",
          priceImpact: "0.08%",
        },
      ];

      return NextResponse.json({
        fromToken: {
          address: fromToken,
          symbol: "FROM",
          decimals: 18,
        },
        toToken: {
          address: toToken,
          symbol: "TO",
          decimals: 18,
        },
        inputAmount: amount,
        marketPrice: marketPrice.toFixed(6),
        strategies,
        optimalStrategy: "Market",
        marketAnalysis: {
          volatility: (Math.random() * 20 + 5).toFixed(1) + "%",
          liquidity: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
          trend: ["Bullish", "Bearish", "Sideways"][
            Math.floor(Math.random() * 3)
          ],
          support: (marketPrice * 0.95).toFixed(2),
          resistance: (marketPrice * 1.05).toFixed(2),
        },
        gasEstimate: {
          slow: "21000",
          standard: "25000",
          fast: "30000",
        },
        recommendations: [
          "Consider setting limit price 0.5% above market for better execution",
          "High liquidity detected - good time to place large orders",
          "Market volatility is moderate - consider shorter expiration times",
        ],
        timestamp: new Date().toISOString(),
      });
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.dev/v5.2/${chainId}/limit-order/optimal-price`;
    const queryParams = new URLSearchParams({
      fromToken,
      toToken,
      amount,
      slippage: slippage.toString(),
    });

    const response = await axios.get(`${apiUrl}?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.data) {
      throw new Error("No data received from API");
    }

    const data = response.data;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting optimal pricing:", error);
    return NextResponse.json(
      { error: "Failed to get optimal pricing" },
      { status: 500 },
    );
  }
}
