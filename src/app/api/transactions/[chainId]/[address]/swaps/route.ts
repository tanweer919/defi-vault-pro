import { NextRequest, NextResponse } from "next/server";

const ONEINCH_CONFIG = {
  apiKey: process.env.ONEINCH_API_KEY,
  baseURL: "https://api.1inch.dev/history/v2.0",
  supportedChains: {
    "1": { name: "Ethereum", id: 1 },
    "137": { name: "Polygon", id: 137 },
    "56": { name: "BSC", id: 56 },
    "42161": { name: "Arbitrum", id: 42161 },
    "10": { name: "Optimism", id: 10 },
    "8453": { name: "Base", id: 8453 },
    "43114": { name: "Avalanche", id: 43114 },
    "250": { name: "Fantom", id: 250 },
  },
};

interface OneInchSwapEvent {
  id: string;
  txHash: string;
  logIndex: number;
  blockNumber: number;
  timeStamp: number;
  protocols: Array<{
    name: string;
    part: number;
    fromTokenAddress: string;
    toTokenAddress: string;
  }>;
  fromToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    amount: string;
    logoURI?: string;
  };
  toToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    amount: string;
    logoURI?: string;
  };
  sender: string;
  recipient: string;
  gasPrice: string;
  gasUsed: string;
  gasCost: string;
  details: {
    priceImpact: string;
    slippage: string;
    minReturn: string;
    effectivePrice: string;
    routes: Array<{
      protocol: string;
      fromTokenAddress: string;
      toTokenAddress: string;
      part: number;
    }>;
  };
}

async function fetchSwapHistory(
  chainId: string,
  address: string,
  limit: number = 50,
  filters?: {
    protocols?: string[];
    minAmount?: string;
    maxAmount?: string;
    startTime?: number;
    endTime?: number;
  },
) {
  console.log(
    `[DEBUG] Fetching swap history for chain ${chainId}, address ${address}`,
  );

  const chainConfig =
    ONEINCH_CONFIG.supportedChains[
      chainId as keyof typeof ONEINCH_CONFIG.supportedChains
    ];

  if (!chainConfig) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  if (!ONEINCH_CONFIG.apiKey) {
    console.error(`[DEBUG] No 1inch API key configured`);
    return [];
  }

  const maxRetries = 3;
  const baseTimeout = 15000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const endpoint = `${ONEINCH_CONFIG.baseURL}/history/${address}/events/swaps`;

      const requestBody = {
        chainId: parseInt(chainId),
        limit,
        ...filters,
      };

      const timeoutMs = baseTimeout * attempt;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ONEINCH_CONFIG.apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429 && attempt < maxRetries) {
          console.warn("Rate limit exceeded, waiting before retry...");
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items) {
        console.warn(
          `1inch Swap API returned no items for ${chainConfig.name}`,
        );
        return [];
      }

      // Transform swap events with enhanced details
      const swapTransactions = data.items.map((swap: OneInchSwapEvent) => {
        const gasCostEth = swap.gasCost
          ? (parseFloat(swap.gasCost) / 1e18).toFixed(6)
          : "0";

        const fromAmountFormatted = (
          parseFloat(swap.fromToken.amount) /
          Math.pow(10, swap.fromToken.decimals)
        ).toFixed(6);

        const toAmountFormatted = (
          parseFloat(swap.toToken.amount) / Math.pow(10, swap.toToken.decimals)
        ).toFixed(6);

        return {
          hash: swap.txHash,
          timeStamp: swap.timeStamp.toString(),
          from: swap.sender,
          to: swap.recipient,
          value: "0", // Swaps typically don't transfer ETH directly
          valueInEth: "0",
          input: "swap",
          protocol: swap.protocols[0]?.name || "1inch",
          fromToken: {
            symbol: swap.fromToken.symbol,
            logoURI: swap.fromToken.logoURI,
            address: swap.fromToken.address,
            name: swap.fromToken.name,
            decimals: swap.fromToken.decimals,
          },
          toToken: {
            symbol: swap.toToken.symbol,
            logoURI: swap.toToken.logoURI,
            address: swap.toToken.address,
            name: swap.toToken.name,
            decimals: swap.toToken.decimals,
          },
          fromAmount: fromAmountFormatted,
          toAmount: toAmountFormatted,
          status: "1",
          gasUsed: swap.gasUsed,
          gasPrice: swap.gasPrice,
          gasCostEth,
          isError: "0",
          txreceipt_status: "1",
          functionName: "swap",
          methodId: null,
          chainId,
          chainName: chainConfig.name,
          blockNumber: swap.blockNumber.toString(),
          logIndex: swap.logIndex.toString(),
          eventId: swap.id,
          eventType: "swap",
          priceImpact: swap.details.priceImpact,
          slippage: swap.details.slippage,
          effectivePrice: swap.details.effectivePrice,
          minReturn: swap.details.minReturn,
          routes: swap.details.routes,
          protocols: swap.protocols,
        };
      });

      console.log(
        `Successfully fetched ${swapTransactions.length} swaps from ${chainConfig.name}`,
      );
      return swapTransactions;
    } catch (error) {
      console.error(`Error fetching swaps (attempt ${attempt}):`, error);

      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed`);
        return [];
      }

      const isTimeoutError =
        error instanceof Error &&
        (error.name === "AbortError" || error.message.includes("timeout"));

      if (isTimeoutError) {
        console.warn(`Timeout error, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return [];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; address: string }> },
) {
  try {
    const { chainId, address } = await params;
    const body = await request.json();

    const {
      limit = 50,
      protocols,
      minAmount,
      maxAmount,
      startTime,
      endTime,
    } = body;

    console.log(`[DEBUG] POST /api/transactions/${chainId}/${address}/swaps`);
    console.log(`[DEBUG] Filters:`, {
      protocols,
      minAmount,
      maxAmount,
      startTime,
      endTime,
    });

    const swaps = await fetchSwapHistory(chainId, address, limit, {
      protocols,
      minAmount,
      maxAmount,
      startTime,
      endTime,
    });

    return NextResponse.json({
      result: swaps,
      status: "1",
      message: "OK",
      meta: {
        source: "1inch_swap_history_api",
        chainId,
        limit,
        count: swaps.length,
        filters: { protocols, minAmount, maxAmount, startTime, endTime },
      },
    });
  } catch (error: unknown) {
    console.error("1inch Swap history API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch swap history from 1inch",
        details: errorMessage,
        result: [],
        meta: {
          source: "1inch_swap_history_api",
          error: true,
        },
      },
      { status: 500 },
    );
  }
}

// Also support GET for simple swap history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; address: string }> },
) {
  try {
    const { chainId, address } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    console.log(`[DEBUG] GET /api/transactions/${chainId}/${address}/swaps`);

    const swaps = await fetchSwapHistory(chainId, address, limit);

    return NextResponse.json({
      result: swaps,
      status: "1",
      message: "OK",
      meta: {
        source: "1inch_swap_history_api",
        chainId,
        limit,
        count: swaps.length,
      },
    });
  } catch (error: unknown) {
    console.error("1inch Swap history API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch swap history from 1inch",
        details: errorMessage,
        result: [],
        meta: {
          source: "1inch_swap_history_api",
          error: true,
        },
      },
      { status: 500 },
    );
  }
}
