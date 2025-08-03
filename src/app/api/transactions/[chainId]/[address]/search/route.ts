import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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

interface SearchFilters {
  chainId: number;
  eventTypes?: string[];
  protocols?: string[];
  tokens?: string[];
  minAmount?: string;
  maxAmount?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

interface SearchEventItem {
  id: string;
  txHash: string;
  timeStamp: number;
  type: string;
  sender: string;
  recipient?: string;
  gasCost?: string;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  logIndex?: number;
  description?: string;
  protocol?: { name: string };
  fromToken?: {
    symbol: string;
    amount: string;
    decimals: number;
    address: string;
    name: string;
    logoURI?: string;
  };
  toToken?: {
    symbol: string;
    amount: string;
    decimals: number;
    address: string;
    name: string;
    logoURI?: string;
  };
  details?: {
    priceImpact?: string;
    slippage?: string;
    effectivePrice?: string;
  };
  relevanceScore?: number;
  matchedFields?: string[];
}

async function searchTransactionHistory(
  address: string,
  filters: SearchFilters,
) {
  console.log(`[DEBUG] Searching transaction history for address ${address}`);
  console.log(`[DEBUG] Filters:`, filters);

  const chainConfig =
    ONEINCH_CONFIG.supportedChains[
      filters.chainId.toString() as keyof typeof ONEINCH_CONFIG.supportedChains
    ];

  if (!chainConfig) {
    throw new Error(`Unsupported chain ID: ${filters.chainId}`);
  }

  if (!ONEINCH_CONFIG.apiKey) {
    console.error(`[DEBUG] No 1inch API key configured`);
    return { items: [], meta: { hasNext: false, limit: 0, offset: 0 } };
  }

  const maxRetries = 3;
  const baseTimeout = 20000; // Longer timeout for search

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const endpoint = `${ONEINCH_CONFIG.baseURL}/history/${address}/search/events`;

      const requestBody = {
        ...filters,
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      };

      const timeoutMs = baseTimeout * attempt;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await axios.get(endpoint, {
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

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;

      if (!data.items) {
        console.warn(
          `1inch Search API returned no items for ${chainConfig.name}`,
        );
        return { items: [], meta: { hasNext: false, limit: 0, offset: 0 } };
      }

      // Transform search results with enhanced details
      const searchResults = data.items.map((event: SearchEventItem) => {
        const gasCostEth = event.gasCost
          ? (parseFloat(event.gasCost) / 1e18).toFixed(6)
          : "0";

        const fromAmountFormatted = event.fromToken
          ? (
              parseFloat(event.fromToken.amount) /
              Math.pow(10, event.fromToken.decimals)
            ).toFixed(6)
          : "0";

        const toAmountFormatted = event.toToken
          ? (
              parseFloat(event.toToken.amount) /
              Math.pow(10, event.toToken.decimals)
            ).toFixed(6)
          : "0";

        return {
          hash: event.txHash,
          timeStamp: event.timeStamp.toString(),
          from: event.sender,
          to: event.recipient || event.toToken?.address || "",
          value:
            event.type === "transfer" && event.fromToken?.symbol === "ETH"
              ? event.fromToken.amount
              : "0",
          valueInEth:
            event.fromToken?.symbol === "ETH" ? fromAmountFormatted : "0",
          input: event.type,
          protocol: event.protocol?.name || null,
          fromToken: event.fromToken
            ? {
                symbol: event.fromToken.symbol,
                logoURI: event.fromToken.logoURI,
                address: event.fromToken.address,
                name: event.fromToken.name,
                decimals: event.fromToken.decimals,
              }
            : null,
          toToken: event.toToken
            ? {
                symbol: event.toToken.symbol,
                logoURI: event.toToken.logoURI,
                address: event.toToken.address,
                name: event.toToken.name,
                decimals: event.toToken.decimals,
              }
            : null,
          fromAmount: fromAmountFormatted,
          toAmount: toAmountFormatted,
          status: "1",
          gasUsed: event.gasUsed || "0",
          gasPrice: event.gasPrice || "0",
          gasCostEth,
          isError: "0",
          txreceipt_status: "1",
          functionName: event.description || event.type,
          methodId: null,
          chainId: filters.chainId.toString(),
          chainName: chainConfig.name,
          blockNumber: event.blockNumber?.toString(),
          logIndex: event.logIndex?.toString(),
          eventId: event.id,
          eventType: event.type,
          priceImpact: event.details?.priceImpact,
          slippage: event.details?.slippage,
          effectivePrice: event.details?.effectivePrice,
          description: event.description,
          // Additional search-specific fields
          relevanceScore: event.relevanceScore,
          matchedFields: event.matchedFields,
        };
      });

      console.log(
        `Successfully searched ${searchResults.length} events from ${chainConfig.name}`,
      );

      return {
        items: searchResults,
        meta: data.meta || {
          hasNext: false,
          limit: filters.limit || 100,
          offset: filters.offset || 0,
        },
      };
    } catch (error) {
      console.error(`Error searching events (attempt ${attempt}):`, error);

      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed`);
        return { items: [], meta: { hasNext: false, limit: 0, offset: 0 } };
      }

      const isTimeoutError =
        error instanceof Error &&
        (error.name === "AbortError" || error.message.includes("timeout"));

      if (isTimeoutError) {
        console.warn(`Timeout error, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }

  return { items: [], meta: { hasNext: false, limit: 0, offset: 0 } };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; address: string }> },
) {
  try {
    const { chainId, address } = await params;
    const body = await request.json();

    const filters: SearchFilters = {
      chainId: parseInt(chainId),
      ...body,
    };

    console.log(`[DEBUG] POST /api/transactions/${chainId}/${address}/search`);

    const searchResults = await searchTransactionHistory(address, filters);

    return NextResponse.json({
      result: searchResults.items,
      status: "1",
      message: "OK",
      meta: {
        source: "1inch_search_history_api",
        chainId,
        count: searchResults.items.length,
        hasNext: searchResults.meta.hasNext,
        limit: searchResults.meta.limit,
        offset: searchResults.meta.offset,
        filters,
      },
    });
  } catch (error: unknown) {
    console.error("1inch Search history API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to search transaction history with 1inch",
        details: errorMessage,
        result: [],
        meta: {
          source: "1inch_search_history_api",
          error: true,
        },
      },
      { status: 500 },
    );
  }
}
