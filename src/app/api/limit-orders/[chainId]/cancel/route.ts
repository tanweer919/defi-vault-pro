import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId parameter required" },
        { status: 400 },
      );
    }

    // Since 1inch limit order cancellation requires wallet signatures,
    // we'll return mock success for development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        success: true,
        orderId,
        status: "cancelled",
        cancelledAt: Math.floor(Date.now() / 1000),
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      });
    }

    // For production, implement 1inch limit order cancellation
    // This would involve:
    // 1. Validating the order exists and belongs to the user
    // 2. Creating a cancellation transaction
    // 3. Submitting to 1inch orderbook
    // const response = await fetch(
    //   `https://api.1inch.dev/orderbook/v4.0/${chainId}/order/${orderId}`,
    //   {
    //     method: 'DELETE',
    //     headers: {
    //       'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );

    return NextResponse.json({
      success: true,
      message: "Order cancellation not implemented in production mode",
    });
  } catch (error: unknown) {

    return NextResponse.json(
      { error: "Failed to cancel limit order" },
      { status: 500 },
    );
  }
}
