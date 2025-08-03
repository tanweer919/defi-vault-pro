import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface SwapRequestBody {
  src: string;
  dst: string;
  amount: string;
  from: string;
  quoteId: string;
  slippage?: number;
  [key: string]: unknown;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  let body: SwapRequestBody;

  try {
    const { chainId } = await params;
    body = await request.json();

    // Validate required parameters
    const { src, dst, amount, from, quoteId, slippage } = body;

    if (!src || !dst || !amount || !from || !quoteId) {
      return NextResponse.json(
        {
          error: "Missing required parameters: src, dst, amount, from, quoteId",
        },
        { status: 400 },
      );
    }

    // Build the swap transaction using 1inch Fusion Plus
    const swapData = {
      src,
      dst,
      amount,
      from,
      quoteId,
      slippage: slippage || 1,
      ...body,
    };

    const response = await axios.post(
      `https://api.1inch.dev/fusion/swap/v1.0/${chainId}`,
      swapData,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;

    // Format the response for the frontend
    const formattedResponse = {
      tx: {
        to: data.tx.to,
        data: data.tx.data,
        value: data.tx.value || "0",
        gas: data.tx.gas,
        gasPrice: data.tx.gasPrice,
      },
      protocols: data.protocols || [],
      quoteId: data.quoteId,
      orderId: data.orderId,
      permit: data.permit,
    };

    return NextResponse.json(formattedResponse);
  } catch (error: unknown) {
    console.error("Build swap transaction API error:", error);

    // Return mock data in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        tx: {
          to: "0x1234567890123456789012345678901234567890",
          data: "0x",
          value:
            body?.src === "0x0000000000000000000000000000000000000000"
              ? body?.amount || "0"
              : "0",
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
        quoteId: "mock-quote-id",
        orderId: "mock-order-id",
      });
    }

    return NextResponse.json(
      { error: "Failed to build swap transaction" },
      { status: 500 },
    );
  }
}
