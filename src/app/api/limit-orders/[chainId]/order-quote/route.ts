import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string } },
) {
  try {
    const { chainId } = params;
    const { searchParams } = new URL(request.url);

    const fromTokenAddress = searchParams.get("fromTokenAddress");
    const toTokenAddress = searchParams.get("toTokenAddress");
    const amount = searchParams.get("amount");
    const side = searchParams.get("side") || "sell";
    const demo = searchParams.get("demo") === "true";

    if (!fromTokenAddress || !toTokenAddress || !amount) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: fromTokenAddress, toTokenAddress, amount",
        },
        { status: 400 },
      );
    }

    if (demo || process.env.NODE_ENV === "development") {
      // Return mock quote for demo mode
      const isETH =
        fromTokenAddress.toLowerCase().includes("eth") ||
        fromTokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      const basePrice = isETH ? 3000 : 1; // ETH ~$3000, others ~$1
      const priceVariation = 0.98 + Math.random() * 0.04; // ±2% variation
      const currentPrice = basePrice * priceVariation;
      const inputAmount = parseFloat(amount);
      const outputAmount = inputAmount * currentPrice;

      return NextResponse.json({
        fromToken: {
          address: fromTokenAddress,
          symbol: isETH ? "ETH" : "TOKEN",
          decimals: 18,
        },
        toToken: {
          address: toTokenAddress,
          symbol: isETH ? "TOKEN" : "ETH",
          decimals: 18,
        },
        fromTokenAmount: amount,
        toTokenAmount: Math.floor(outputAmount * 10 ** 18).toString(),
        price: currentPrice.toFixed(6),
        priceImpact: "0.05",
        side,
        estimatedGas: "150000",
        protocolFee: "0.1",
        marketDepth: {
          bids: Array.from({ length: 5 }, (_, i) => ({
            price: (currentPrice * (0.99 - i * 0.001)).toFixed(6),
            amount: (Math.random() * 10).toFixed(4),
          })),
          asks: Array.from({ length: 5 }, (_, i) => ({
            price: (currentPrice * (1.01 + i * 0.001)).toFixed(6),
            amount: (Math.random() * 10).toFixed(4),
          })),
        },
        suggestedLimitPrice: (currentPrice * 1.005).toFixed(6), // 0.5% above market
        minReceived: Math.floor(outputAmount * 0.995 * 10 ** 18).toString(), // 0.5% slippage
      });
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.io/v5.2/${chainId}/limit-order/quote`;
    const queryParams = new URLSearchParams({
      fromTokenAddress,
      toTokenAddress,
      amount,
      side,
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
    console.error("Error getting order quote:", error);
    return NextResponse.json(
      { error: "Failed to get order quote" },
      { status: 500 },
    );
  }
}
