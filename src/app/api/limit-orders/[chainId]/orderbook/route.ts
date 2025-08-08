import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";

// Load and cache active token pairs
let activePairsCache: { makerAsset: string; takerAsset: string }[] | null =
  null;

function loadActivePairs() {
  if (activePairsCache) return activePairsCache;

  try {
    const filePath = path.join(process.cwd(), "active-pairs.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    activePairsCache = data.items || [];
    return activePairsCache;
  } catch (error) {
    console.error("Failed to load active pairs:", error);
    return [];
  }
}

function isValidTokenPair(baseToken: string, quoteToken: string): boolean {
  const pairs = loadActivePairs();
  const base = baseToken.toLowerCase();
  const quote = quoteToken.toLowerCase();

  return pairs.some(
    (pair) =>
      (pair.makerAsset.toLowerCase() === base &&
        pair.takerAsset.toLowerCase() === quote) ||
      (pair.makerAsset.toLowerCase() === quote &&
        pair.takerAsset.toLowerCase() === base),
  );
}

function getPopularTokenPairs(): {
  baseToken: string;
  quoteToken: string;
  symbol: string;
}[] {
  const pairs = loadActivePairs();

  const popularPairs: {
    baseToken: string;
    quoteToken: string;
    symbol: string;
  }[] = [];

  pairs.slice(0, 10).forEach((pair) => {
    const baseSymbol = getTokenSymbol(pair.makerAsset);
    const quoteSymbol = getTokenSymbol(pair.takerAsset);
    if (baseSymbol !== "TOKEN" && quoteSymbol !== "TOKEN") {
      popularPairs.push({
        baseToken: pair.makerAsset,
        quoteToken: pair.takerAsset,
        symbol: `${baseSymbol}/${quoteSymbol}`,
      });
    }
  });

  return popularPairs;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);

    const baseToken = searchParams.get("baseToken");
    const quoteToken = searchParams.get("quoteToken");
    const demo = searchParams.get("demo") === "true";

    if (!baseToken || !quoteToken) {
      return NextResponse.json(
        { error: "Missing required parameters: baseToken, quoteToken" },
        { status: 400 },
      );
    }

    if (demo) {
      // Return mock orderbook for demo mode with enhanced animations
      const basePrice = 3000;
      const now = Date.now();

      // Generate more realistic order book data
      const generateOrders = (side: "bid" | "ask", count: number) => {
        return Array.from({ length: count }, (_, i) => {
          const priceMultiplier =
            side === "bid" ? 0.999 - i * 0.0003 : 1.001 + i * 0.0003;
          const price = basePrice * priceMultiplier;
          const amount = Math.random() * 5 + 0.1;

          return {
            id: `${side}_${i}_${Date.now()}`,
            price: price.toFixed(6),
            amount: amount.toFixed(4),
            total: (price * amount).toFixed(6),
            maker: "0x" + Math.random().toString(16).substr(2, 40),
            timestamp: new Date(now - Math.random() * 3600000).toISOString(),
            fills: Math.floor(Math.random() * 8),
          };
        });
      };

      const bids = generateOrders("bid", 25);
      const asks = generateOrders("ask", 25);

      // Generate recent trades
      const lastTrades = Array.from({ length: 15 }, (_, i) => ({
        id: `trade_${i}_${Date.now()}`,
        price: (basePrice + (Math.random() - 0.5) * 20).toFixed(6),
        amount: (Math.random() * 2 + 0.01).toFixed(4),
        side: Math.random() > 0.5 ? "buy" : ("sell" as "buy" | "sell"),
        timestamp: new Date(now - i * 45000).toISOString(),
        txHash: "0x" + Math.random().toString(16).substr(2, 64),
      }));

      // Calculate stats
      const bestBid = Math.max(...bids.map((b) => parseFloat(b.price)));
      const bestAsk = Math.min(...asks.map((a) => parseFloat(a.price)));
      const spread = ((bestAsk - bestBid) / bestBid) * 100;

      return NextResponse.json({
        pair: `${baseToken}/${quoteToken}`,
        baseToken: {
          address: baseToken,
          symbol: getTokenSymbol(baseToken),
          decimals: 18,
        },
        quoteToken: {
          address: quoteToken,
          symbol: getTokenSymbol(quoteToken),
          decimals: getTokenDecimals(quoteToken),
        },
        bids: bids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)),
        asks: asks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
        lastTrades: lastTrades.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
        stats: {
          bestBid: bestBid.toFixed(6),
          bestAsk: bestAsk.toFixed(6),
          spread: spread.toFixed(3) + "%",
          volume24h: (Math.random() * 50000 + 10000).toFixed(2),
          priceChange24h: ((Math.random() - 0.5) * 15).toFixed(2) + "%",
          high24h: (basePrice * (1.02 + Math.random() * 0.03)).toFixed(2),
          low24h: (basePrice * (0.95 + Math.random() * 0.03)).toFixed(2),
        },
        timestamp: new Date().toISOString(),
      });
    }

    // For production, we'll use the actual 1inch Limit Orders API
    // The 1inch API doesn't have a traditional "orderbook" endpoint,
    // so we'll fetch all active orders and organize them
    try {
      const ordersUrl = `https://api.1inch.dev/orderbook/v4.0/${chainId}/all`;
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "100",
        statuses: "1", // Only valid orders
        sortBy: "takerRate",
      });

      // Add token filters if we want to filter by specific pair
      if (baseToken && quoteToken) {
        queryParams.append("makerAsset", baseToken);
        queryParams.append("takerAsset", quoteToken);
      }

      const response = await axios.get(`${ordersUrl}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const orderBookData = response.data;

      return NextResponse.json(orderBookData);
    } catch (apiError) {
      console.error("1inch API error:", apiError);
      // Fall back to demo data if API fails
      throw apiError; // Re-throw to trigger the outer catch
    }
  } catch (error) {
    console.error("Error getting orderbook:", error);
    return NextResponse.json(
      { error: "Failed to get orderbook" },
      { status: 500 },
    );
  }
}

// Helper functions
function getTokenSymbol(address: string): string {
  const knownTokens: Record<string, string> = {
    // Real token addresses from active-pairs.json
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH", // Wrapped Ethereum
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC", // USD Coin
    "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT", // Tether USD
    "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI", // Dai Stablecoin
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "UNI", // Uniswap
    "0x0000000000085d4780b73119b644ae5ecd22b376": "TrueUSD", // TrueUSD
    "0x000000000000d0151e748d25b766e77efe2a6c83": "HAM", // HAM token
    "0x0000000000300dd8b0230efcfef136ecdf6abcde": "PLEB", // PLEB token
  };

  return knownTokens[address.toLowerCase()] || "TOKEN";
}

function getTokenDecimals(address: string): number {
  const knownDecimals: Record<string, number> = {
    // Real token addresses with their decimals
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": 18, // WETH
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 6, // USDC
    "0xdac17f958d2ee523a2206206994597c13d831ec7": 6, // USDT
    "0x6b175474e89094c44da98b954eedeac495271d0f": 18, // DAI
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": 18, // UNI
    "0x0000000000085d4780b73119b644ae5ecd22b376": 18, // TrueUSD
    "0x000000000000d0151e748d25b766e77efe2a6c83": 18, // HAM
    "0x0000000000300dd8b0230efcfef136ecdf6abcde": 18, // PLEB
  };

  return knownDecimals[address.toLowerCase()] || 18;
}

function transformOrdersToOrderbook(
  ordersData: unknown,
  baseToken: string,
  quoteToken: string,
) {
  // This function would transform the 1inch orders API response
  // into our orderbook format. Since the actual API structure
  // would depend on the real response, this is a placeholder.

  return {
    pair: `${getTokenSymbol(baseToken)}/${getTokenSymbol(quoteToken)}`,
    baseToken: {
      address: baseToken.toLowerCase(),
      symbol: getTokenSymbol(baseToken),
      decimals: getTokenDecimals(baseToken),
    },
    quoteToken: {
      address: quoteToken.toLowerCase(),
      symbol: getTokenSymbol(quoteToken),
      decimals: getTokenDecimals(quoteToken),
    },
    bids: [],
    asks: [],
    lastTrades: [],
    stats: {
      bestBid: "0",
      bestAsk: "0",
      spread: "0%",
      volume24h: "0",
      priceChange24h: "0%",
      high24h: "0",
      low24h: "0",
    },
    timestamp: new Date().toISOString(),
  };
}
