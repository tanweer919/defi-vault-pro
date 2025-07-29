import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string } },
) {
  try {
    const { chainId } = params;
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const statuses = searchParams.get("statuses")?.split(",") || [];
    const makerAsset = searchParams.get("makerAsset");
    const takerAsset = searchParams.get("takerAsset");
    const demo = searchParams.get("demo") === "true";

    if (demo || process.env.NODE_ENV === "development") {
      // Return mock data for demo mode
      const mockOrders = Array.from({ length: parseInt(limit) }, (_, i) => ({
        id: `order_${i + (parseInt(page) - 1) * parseInt(limit)}`,
        orderId: `${chainId}_${Date.now()}_${i}`,
        maker: "0x" + Math.random().toString(16).substr(2, 40),
        makerAsset: makerAsset || "0xA0b86a33E6441eFdBC03b1198C40d47B0DbD3CE5", // ETH
        takerAsset: takerAsset || "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        makingAmount: (Math.random() * 10 * 10 ** 18).toString(),
        takingAmount: (Math.random() * 30000 * 10 ** 6).toString(),
        status:
          statuses.length > 0
            ? statuses[i % statuses.length]
            : ["active", "filled", "cancelled"][i % 3],
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        expiresAt: new Date(
          Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        filledAmount: "0",
        remainingAmount: (Math.random() * 10 * 10 ** 18).toString(),
        chainId: parseInt(chainId),
        salt: Math.random().toString(),
        signature: "0x" + Math.random().toString(16).substr(2, 130),
        price: (Math.random() * 3000 + 1000).toFixed(2),
      }));

      const totalCount = 1000; // Mock total
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      return NextResponse.json({
        orders: mockOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages,
          hasMore: parseInt(page) < totalPages,
        },
        filters: {
          sortBy,
          statuses,
          makerAsset,
          takerAsset,
        },
      });
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.io/v5.2/${chainId}/limit-order/all`;
    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      ...(statuses.length > 0 && { statuses: statuses.join(",") }),
      ...(makerAsset && { makerAsset }),
      ...(takerAsset && { takerAsset }),
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
    console.error("Error fetching all limit orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch all limit orders" },
      { status: 500 },
    );
  }
}
