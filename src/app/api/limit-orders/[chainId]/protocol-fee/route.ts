import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const demo = searchParams.get("demo") === "true";

    if (demo) {
      // Return mock protocol fee for demo mode
      return NextResponse.json({
        protocolFee: {
          percentage: "0.1", // 0.1%
          minimumFee: "1000000000000000", // 0.001 ETH in wei
          maximumFee: "100000000000000000", // 0.1 ETH in wei
        },
        feeStructure: {
          makerFee: "0.05", // 0.05%
          takerFee: "0.1", // 0.1%
          cancelFee: "0", // Free cancellation
          partialFillFee: "0.02", // 0.02% for partial fills
        },
        feeTokens: [
          {
            token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
            symbol: "ETH",
            decimals: 18,
            discountPercentage: "0", // No discount for ETH
          },
          {
            token: "0x111111111117dC0aa78b770fA6A738034120C302", // 1INCH token
            symbol: "1INCH",
            decimals: 18,
            discountPercentage: "50", // 50% discount with 1INCH
          },
        ],
        volumeDiscounts: [
          {
            minimumVolume: "0", // $0
            discountPercentage: "0",
          },
          {
            minimumVolume: "10000", // $10k
            discountPercentage: "10",
          },
          {
            minimumVolume: "100000", // $100k
            discountPercentage: "25",
          },
          {
            minimumVolume: "1000000", // $1M
            discountPercentage: "50",
          },
        ],
        feeCalculation: {
          example: {
            orderValue: "1000", // $1000 order
            baseFee: "1.0", // $1.0 (0.1%)
            volumeDiscount: "0", // No volume discount
            tokenDiscount: "0", // No token discount
            finalFee: "1.0", // $1.0
          },
          formula:
            "orderValue * protocolFeePercentage * (1 - volumeDiscount) * (1 - tokenDiscount)",
        },
        lastUpdated: new Date().toISOString(),
        networkSpecific: {
          chainId: parseInt(chainId),
          gasToken: "ETH",
          estimatedGasCost: (15 + Math.random() * 20).toFixed(1) + " gwei",
        },
      });
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.dev/v5.2/${chainId}/limit-order/protocol-fee`;

    const response = await axios.get(apiUrl, {
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
    console.error("Error getting protocol fee:", error);
    return NextResponse.json(
      { error: "Failed to get protocol fee" },
      { status: 500 },
    );
  }
}
