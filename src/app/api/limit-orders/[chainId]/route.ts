import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const orderData = await request.json();

    // Since 1inch limit order creation requires wallet signatures and special handling,
    // we'll return mock success for development
    if (process.env.NODE_ENV === "development") {
      const mockOrderResponse = {
        orderId: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "active",
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        ...orderData,
        createdAt: Math.floor(Date.now() / 1000),
        id: Math.random().toString(36).substr(2, 9),
      };

      return NextResponse.json(mockOrderResponse);
    }

    // For production, implement 1inch limit order creation
    // This would involve:
    // 1. Validating the order data
    // 2. Creating the order signature
    // 3. Submitting to 1inch orderbook
    // const response = await fetch(
    //   `https://api.1inch.dev/orderbook/v4.0/${chainId}/order`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(orderData)
    //   }
    // );

    return NextResponse.json({
      success: true,
      message: "Order creation not implemented in production mode",
    });
  } catch (error: unknown) {
    console.error("Create limit order API error:", error);

    return NextResponse.json(
      { error: "Failed to create limit order" },
      { status: 500 },
    );
  }
}
