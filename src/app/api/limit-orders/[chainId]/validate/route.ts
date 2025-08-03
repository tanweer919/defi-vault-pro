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
      // Return mock validation for demo mode
      return NextResponse.json({
        valid: true,
        signature:
          orderData.signature ||
          "0x" + Math.random().toString(16).substr(2, 130),
        hash: "0x" + Math.random().toString(16).substr(2, 64),
        validationDetails: {
          signatureValid: true,
          nonceValid: true,
          expiredValid: true,
          amountValid: true,
          allowanceValid: true,
        },
        estimatedGas: "21000",
        protocolFee: "0.1",
      });
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.io/v5.2/${chainId}/limit-order/validate`;

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
    console.error("Error validating limit order signature:", error);
    return NextResponse.json(
      { error: "Failed to validate signature" },
      { status: 500 },
    );
  }
}
