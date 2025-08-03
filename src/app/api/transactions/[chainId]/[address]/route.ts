import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// 1inch History API configuration - much better for DeFi transaction analysis
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

// 1inch History API Types
interface OneInchEvent {
  id: string;
  type:
    | "swap"
    | "approval"
    | "transfer"
    | "deposit"
    | "withdrawal"
    | "mint"
    | "burn";
  txHash: string;
  logIndex: number;
  blockNumber: number;
  timeStamp: number;
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
  recipient?: string;
  gasPrice?: string;
  gasUsed?: string;
  gasCost?: string;
  protocol?: {
    name: string;
    logoURI?: string;
  };
  description?: string;
  details?: {
    priceImpact?: string;
    slippage?: string;
    minReturn?: string;
    effectivePrice?: string;
  };
}

interface OneInchHistoryResponse {
  items: OneInchEvent[];
  meta: {
    hasNext: boolean;
    limit: number;
    offset: number;
  };
}

// Transformed transaction interface for our API response
interface TransformedTransaction {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  valueInEth: string;
  input: string;
  protocol: string | null;
  fromToken: {
    symbol: string;
    logoURI?: string;
    address?: string;
    name?: string;
    decimals?: number;
  };
  toToken: {
    symbol: string;
    logoURI?: string;
    address?: string;
    name?: string;
    decimals?: number;
  };
  fromAmount: string;
  toAmount: string;
  status: string;
  gasUsed: string;
  gasPrice: string;
  gasCostEth: string;
  isError: string;
  txreceipt_status: string;
  functionName: string | null;
  methodId: string | null;
  chainId?: string;
  chainName?: string;
  blockNumber?: string;
  logIndex?: string;
  eventId?: string;
  eventType?: string;
  priceImpact?: string;
  slippage?: string;
  effectivePrice?: string;
}

function generateMockTransactions(address: string, limit: number) {
  const mockTokens = [
    { symbol: "ETH", name: "Ethereum", decimals: 18, logoURI: null },
    { symbol: "USDC", name: "USD Coin", decimals: 6, logoURI: null },
    { symbol: "USDT", name: "Tether USD", decimals: 6, logoURI: null },
    { symbol: "WBTC", name: "Wrapped Bitcoin", decimals: 8, logoURI: null },
    { symbol: "DAI", name: "Dai Stablecoin", decimals: 18, logoURI: null },
    { symbol: "UNI", name: "Uniswap", decimals: 18, logoURI: null },
    { symbol: "LINK", name: "Chainlink", decimals: 18, logoURI: null },
  ];

  const mockProtocols = [
    "Uniswap V3",
    "1inch",
    "SushiSwap",
    "Curve",
    "Balancer",
  ];
  const transactionTypes: OneInchEvent["type"][] = [
    "swap",
    "transfer",
    "approval",
    "deposit",
    "withdrawal",
  ];

  return Array.from({ length: limit }, (_, i) => {
    const fromToken = mockTokens[Math.floor(Math.random() * mockTokens.length)];
    const toToken = mockTokens.filter((t) => t.symbol !== fromToken.symbol)[
      Math.floor(Math.random() * (mockTokens.length - 1))
    ];
    const txType =
      transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const protocol =
      mockProtocols[Math.floor(Math.random() * mockProtocols.length)];

    const fromAmount = (Math.random() * 1000).toFixed(6);
    const toAmount = (Math.random() * 1000).toFixed(6);

    return {
      hash: `mock_${Math.random().toString(16).substr(2, 60)}`,
      timeStamp: (Math.floor(Date.now() / 1000) - i * 3600).toString(),
      from: address,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      value: txType === "swap" ? "0" : (Math.random() * 10 * 1e18).toString(),
      valueInEth: "0",
      input: txType,
      protocol,
      fromToken: {
        symbol: fromToken.symbol,
        logoURI: fromToken.logoURI,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        name: fromToken.name,
        decimals: fromToken.decimals,
      },
      toToken: {
        symbol: toToken.symbol,
        logoURI: toToken.logoURI,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        name: toToken.name,
        decimals: toToken.decimals,
      },
      fromAmount,
      toAmount,
      status: "1",
      gasUsed: (21000 + Math.floor(Math.random() * 100000)).toString(),
      gasPrice: (Math.floor(Math.random() * 50) + 10).toString() + "000000000", // 10-60 gwei
      gasCostEth: (Math.random() * 0.01).toFixed(6),
      isError: "0",
      txreceipt_status: "1",
      functionName: `${txType}(...)`,
      methodId: `0x${Math.random().toString(16).substr(2, 8)}`,
      eventType: txType,
      priceImpact:
        txType === "swap" ? (Math.random() * 2).toFixed(4) + "%" : undefined,
      slippage:
        txType === "swap" ? (Math.random() * 1).toFixed(4) + "%" : undefined,
    };
  });
}

async function fetchOneInchHistory(
  chainId: string,
  address: string,
  limit: number,
  eventType?: "swaps" | "all",
): Promise<TransformedTransaction[]> {
  console.log(
    `[DEBUG] Starting fetchOneInchHistory for chain ${chainId}, address ${address}`,
  );
  console.log(`[DEBUG] API Key present: ${!!ONEINCH_CONFIG.apiKey}`);
  console.log(`[DEBUG] Event type: ${eventType || "all"}`);

  const chainConfig =
    ONEINCH_CONFIG.supportedChains[
      chainId as keyof typeof ONEINCH_CONFIG.supportedChains
    ];

  if (!chainConfig) {
    console.error(`[DEBUG] Unsupported chain ID: ${chainId}`);
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  if (!ONEINCH_CONFIG.apiKey) {
    console.error(`[DEBUG] No 1inch API key configured`);
    return [];
  }

  // Retry configuration
  const maxRetries = 3;
  const baseTimeout = 15000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Determine API endpoint based on event type
      let endpoint: string;
      let method = "GET";
      let body: Record<string, unknown> | null = null;

      if (eventType === "swaps") {
        // Use swap-specific endpoint
        endpoint = `${ONEINCH_CONFIG.baseURL}/history/${address}/events/swaps`;
        method = "POST";
        body = {
          chainId: parseInt(chainId),
          limit,
        };
      } else {
        // Use general events endpoint
        endpoint = `${ONEINCH_CONFIG.baseURL}/history/${address}/events`;
        method = "GET";
      }

      console.log(
        `Fetching 1inch history from ${chainConfig.name} for address: ${address} (attempt ${attempt}/${maxRetries})`,
      );
      console.log(`Endpoint: ${endpoint}`);

      const timeoutMs = baseTimeout * attempt;

      let response;
      if (method === "GET") {
        const url = new URL(endpoint);
        url.searchParams.set("chainId", chainId);
        url.searchParams.set("limit", limit.toString());
        response = await axios.get(url.toString(), {
          headers: {
            Authorization: `Bearer ${ONEINCH_CONFIG.apiKey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          timeout: timeoutMs,
        });
      } else {
        response = await axios.post(endpoint, body, {
          headers: {
            Authorization: `Bearer ${ONEINCH_CONFIG.apiKey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          timeout: timeoutMs,
        });
      }

      console.log(
        `1inch API response status: ${response.status} (${chainConfig.name})`,
      );

      const data: OneInchHistoryResponse = response.data;

      if (!data.items) {
        console.warn(`1inch API returned no items for ${chainConfig.name}`);
        return [];
      }

      // Transform 1inch events to our format
      const transactions = data.items.map((event: OneInchEvent) => {
        const gasCostEth = event.gasCost
          ? (parseFloat(event.gasCost) / 1e18).toFixed(6)
          : "0";

        return {
          hash: event.txHash,
          timeStamp: event.timeStamp.toString(),
          from: event.sender,
          to: event.recipient || event.toToken.address,
          value: event.fromToken.amount,
          valueInEth:
            event.fromToken.symbol === "ETH"
              ? (
                  parseFloat(event.fromToken.amount) /
                  Math.pow(10, event.fromToken.decimals)
                ).toFixed(6)
              : "0",
          input: event.type,
          protocol: event.protocol?.name || null,
          fromToken: {
            symbol: event.fromToken.symbol,
            logoURI: event.fromToken.logoURI,
            address: event.fromToken.address,
            name: event.fromToken.name,
            decimals: event.fromToken.decimals,
          },
          toToken: {
            symbol: event.toToken.symbol,
            logoURI: event.toToken.logoURI,
            address: event.toToken.address,
            name: event.toToken.name,
            decimals: event.toToken.decimals,
          },
          fromAmount: (
            parseFloat(event.fromToken.amount) /
            Math.pow(10, event.fromToken.decimals)
          ).toFixed(6),
          toAmount: (
            parseFloat(event.toToken.amount) /
            Math.pow(10, event.toToken.decimals)
          ).toFixed(6),
          status: "1", // 1inch only returns successful events
          gasUsed: event.gasUsed || "0",
          gasPrice: event.gasPrice || "0",
          gasCostEth,
          isError: "0",
          txreceipt_status: "1",
          functionName: event.description || null,
          methodId: null,
          chainId,
          chainName: chainConfig.name,
          blockNumber: event.blockNumber.toString(),
          logIndex: event.logIndex.toString(),
          eventId: event.id,
          eventType: event.type,
          priceImpact: event.details?.priceImpact,
          slippage: event.details?.slippage,
          effectivePrice: event.details?.effectivePrice,
        };
      });

      console.log(
        `Successfully fetched ${transactions.length} events from 1inch ${chainConfig.name}`,
      );
      return transactions;
    } catch (error) {
      console.error(
        `Error fetching 1inch history from ${chainConfig.name} (attempt ${attempt}):`,
        error,
      );

      const isTimeoutError =
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message.includes("timeout") ||
          error.message.includes("ETIMEDOUT"));

      if (isTimeoutError && attempt < maxRetries) {
        console.warn(
          `Timeout error on attempt ${attempt}/${maxRetries}, retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      if (attempt === maxRetries) {
        console.error(
          `All ${maxRetries} attempts failed for ${chainConfig.name}`,
        );
        return [];
      }
    }
  }

  console.warn(
    `Unexpected fallback for ${chainConfig.name}, returning empty array`,
  );
  return [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; address: string }> },
) {
  try {
    const { chainId, address } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const demoMode = searchParams.get("demo") === "true";
    const eventType = searchParams.get("type") as "swaps" | "all" | undefined;

    console.log(`[DEBUG] GET /api/transactions/${chainId}/${address}`);
    console.log(
      `[DEBUG] Query params - limit: ${limit}, demo: ${demoMode}, type: ${eventType}`,
    );
    console.log(
      `[DEBUG] Environment API Key: ${
        process.env.ONEINCH_API_KEY ? "Present" : "Missing"
      }`,
    );

    // Always return mock data for demo mode
    if (demoMode) {
      console.log(`[DEBUG] Demo mode enabled, returning mock data`);
      const mockTransactions = generateMockTransactions(address, limit);
      return NextResponse.json({
        result: mockTransactions,
        status: "1",
        message: "OK (Demo Mode)",
      });
    }

    console.log(
      `[DEBUG] Demo mode disabled, fetching real transactions from 1inch`,
    );
    // Fetch real transactions from 1inch History API
    const transactions = await fetchOneInchHistory(
      chainId,
      address,
      limit,
      eventType,
    );

    console.log(`[DEBUG] Returning ${transactions.length} transactions`);
    return NextResponse.json({
      result: transactions,
      status: "1",
      message: "OK",
      meta: {
        source: "1inch_history_api",
        eventType: eventType || "all",
        chainId,
        limit,
        count: transactions.length,
      },
    });
  } catch (error: unknown) {
    console.error("1inch Transaction history API error:", error);

    // Provide more user-friendly error handling
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch transaction history from 1inch",
        details: errorMessage,
        result: [], // Empty array as fallback
        meta: {
          source: "1inch_history_api",
          error: true,
        },
      },
      { status: 500 },
    );
  }
}
