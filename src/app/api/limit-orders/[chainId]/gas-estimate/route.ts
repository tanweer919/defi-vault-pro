import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const orderData = await request.json();
    const demo = orderData.demo || process.env.NODE_ENV === "development";

    if (demo) {
      // Return mock gas estimate for demo mode
      const baseGas = 21000;
      const complexityMultiplier = 1 + Math.random() * 2; // 1x to 3x
      const estimatedGas = Math.floor(baseGas * complexityMultiplier);

      // Simulate different gas price scenarios
      const gasPrices = {
        slow: 10 + Math.random() * 5,
        standard: 15 + Math.random() * 10,
        fast: 25 + Math.random() * 15,
        instant: 40 + Math.random() * 20,
      };

      const calculateCost = (gasPrice: number) => {
        const costInWei = estimatedGas * gasPrice * 1e9; // Convert gwei to wei
        const costInEth = costInWei / 1e18;
        const costInUsd = costInEth * (3000 + Math.random() * 200); // ETH price variation
        return {
          wei: costInWei.toString(),
          eth: costInEth.toFixed(8),
          usd: costInUsd.toFixed(2),
        };
      };

      return NextResponse.json({
        estimatedGas: estimatedGas.toString(),
        gasLimit: Math.floor(estimatedGas * 1.2).toString(), // 20% buffer
        gasPrices: {
          slow: {
            gwei: gasPrices.slow.toFixed(1),
            cost: calculateCost(gasPrices.slow),
            estimatedTime: "3-5 minutes",
          },
          standard: {
            gwei: gasPrices.standard.toFixed(1),
            cost: calculateCost(gasPrices.standard),
            estimatedTime: "1-3 minutes",
          },
          fast: {
            gwei: gasPrices.fast.toFixed(1),
            cost: calculateCost(gasPrices.fast),
            estimatedTime: "30-60 seconds",
          },
          instant: {
            gwei: gasPrices.instant.toFixed(1),
            cost: calculateCost(gasPrices.instant),
            estimatedTime: "< 30 seconds",
          },
        },
        networkCongestion: ["Low", "Medium", "High"][
          Math.floor(Math.random() * 3)
        ],
        optimizations: [
          {
            name: "Bundle with other transactions",
            gasSaving: "15%",
            description: "Combine multiple operations to save gas",
          },
          {
            name: "Off-peak timing",
            gasSaving: "25%",
            description: "Execute during low network congestion",
          },
          {
            name: "Meta-transaction",
            gasSaving: "40%",
            description: "Use gasless transaction if available",
          },
        ],
        recommendations: {
          recommended: "standard",
          reason: "Best balance of cost and speed for limit orders",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // In production, this would call the actual 1inch API
    const apiUrl = `https://api.1inch.io/v5.2/${chainId}/limit-order/gas-estimate`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`1inch API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting gas estimate:", error);
    return NextResponse.json(
      { error: "Failed to get gas estimate" },
      { status: 500 },
    );
  }
}
