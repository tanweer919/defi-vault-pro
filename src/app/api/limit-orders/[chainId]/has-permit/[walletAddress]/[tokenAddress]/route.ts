import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      chainId: string;
      walletAddress: string;
      tokenAddress: string;
    }>;
  },
) {
  try {
    const { chainId, walletAddress, tokenAddress } = await params;
    const { searchParams } = new URL(request.url);
    const demo = searchParams.get("demo") === "true";

    if (demo || process.env.NODE_ENV === "development") {
      // Return mock active orders with permit for demo mode
      const mockOrders = Array.from(
        { length: Math.floor(Math.random() * 5) + 1 },
        (_, i) => ({
          id: `permit_order_${i}`,
          orderId: `${chainId}_${walletAddress}_${i}`,
          maker: walletAddress,
          makerAsset: tokenAddress,
          takerAsset: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
          makingAmount: (Math.random() * 10 * 10 ** 18).toString(),
          takingAmount: (Math.random() * 30000 * 10 ** 6).toString(),
          status: "active",
          createdAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          expiresAt: new Date(
            Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          filledAmount: "0",
          remainingAmount: (Math.random() * 10 * 10 ** 18).toString(),
          chainId: parseInt(chainId),
          permitInfo: {
            hasPermit: true,
            permitType: "EIP2612",
            deadline: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            nonce: Math.floor(Math.random() * 1000),
            signature: "0x" + Math.random().toString(16).substr(2, 130),
          },
          allowance: {
            current: (Math.random() * 100 * 10 ** 18).toString(),
            required: (Math.random() * 10 * 10 ** 18).toString(),
            isApproved: true,
          },
        }),
      );

      return NextResponse.json({
        walletAddress,
        tokenAddress,
        hasActiveOrders: mockOrders.length > 0,
        ordersWithPermit: mockOrders,
        totalCount: mockOrders.length,
        permitSupport: {
          eip2612: true,
          daiLike: true,
          uniswapV3: false,
        },
        tokenInfo: {
          address: tokenAddress,
          symbol: "TOKEN",
          decimals: 18,
          name: "Mock Token",
          supportsPermit: true,
        },
        summary: {
          totalValue: mockOrders
            .reduce((sum, order) => {
              return sum + parseFloat(order.makingAmount) / 10 ** 18;
            }, 0)
            .toFixed(4),
          averageOrderSize:
            mockOrders.length > 0
              ? (
                  mockOrders.reduce(
                    (sum, order) =>
                      sum + parseFloat(order.makingAmount) / 10 ** 18,
                    0,
                  ) / mockOrders.length
                ).toFixed(4)
              : "0",
          oldestOrder:
            mockOrders.length > 0
              ? Math.min(
                  ...mockOrders.map((order) =>
                    new Date(order.createdAt).getTime(),
                  ),
                )
              : null,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.io/v5.2/${chainId}/limit-order/has-permit/${walletAddress}/${tokenAddress}`;

    const response = await fetch(apiUrl, {
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
    console.error("Error getting orders with permit:", error);
    return NextResponse.json(
      { error: "Failed to get orders with permit" },
      { status: 500 },
    );
  }
}
