import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; address: string }> },
) {
  try {
    const { chainId, address } = await params;

    // Since 1inch limit order API requires different endpoints and authentication,
    // we'll return mock data for development
    if (process.env.NODE_ENV === "development") {
      // Return mock limit orders
      const mockOrders = [
        {
          id: "1",
          orderId: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: "active",
          makerAsset: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // ETH
          takerAsset: "0xa0b86a33e6441e5ba2ad8d73b8e76c6b72c2e6ef", // USDC
          makingAmount: "1.5",
          takingAmount: "4200.0",
          filled: "0",
          remaining: "1.5",
          maker: address,
          expiry: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
          createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          makerToken: {
            symbol: "ETH",
            name: "Ethereum",
            decimals: 18,
            logoURI: null,
          },
          takerToken: {
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
            logoURI: null,
          },
          rate: "2800.0",
        },
        {
          id: "2",
          orderId: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: "active",
          makerAsset: "0xa0b86a33e6441e5ba2ad8d73b8e76c6b72c2e6ef", // USDC
          takerAsset: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
          makingAmount: "5000.0",
          takingAmount: "0.1",
          filled: "0",
          remaining: "5000.0",
          maker: address,
          expiry: Math.floor(Date.now() / 1000) + 172800, // 48 hours from now
          createdAt: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
          makerToken: {
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
            logoURI: null,
          },
          takerToken: {
            symbol: "WBTC",
            name: "Wrapped Bitcoin",
            decimals: 8,
            logoURI: null,
          },
          rate: "50000.0",
        },
      ];

      return NextResponse.json(mockOrders);
    }

    // For production, implement 1inch limit order API
    // const response = await fetch(
    //   `https://api.1inch.dev/orderbook/v4.0/${chainId}/orders?maker=${address}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );

    return NextResponse.json([]);
  } catch (error: unknown) {

    return NextResponse.json(
      { error: "Failed to fetch limit orders" },
      { status: 500 },
    );
  }
}
