import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const orderData = await request.json();
    const demo = orderData.demo;

    if (demo) {
      // Return mock order quote for demo mode
      const mockQuote = {
        orderId: `order_${Date.now()}`,
        chainId: parseInt(chainId),
        fromToken: orderData.fromToken || {
          address: "0xA0b86a33E6441eFdBC03b1198C40d47B0DbD3CE5",
          symbol: "ETH",
          decimals: 18,
        },
        toToken: orderData.toToken || {
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          symbol: "USDT",
          decimals: 6,
        },
        amount: orderData.amount || "1000000000000000000", // 1 ETH
        price: (3000 + Math.random() * 100).toFixed(2),
        estimatedGas: "150000",
        protocolFee: "0.1",
        validUntil: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        signature: "0x" + Math.random().toString(16).substr(2, 130),
      };

      return NextResponse.json(mockQuote);
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.io/v5.2/${chainId}/limit-order/quote`;

    const response = await axios.get(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    }

    const data = response.data;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating order quote:", error);
    return NextResponse.json(
      { error: "Failed to create order quote" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
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

    if (demo) {
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
    console.error("Error getting order quote:", error);
    return NextResponse.json(
      { error: "Failed to get order quote" },
      { status: 500 },
    );
  }
}
