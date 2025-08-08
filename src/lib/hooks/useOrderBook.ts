"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDemoMode } from "./useDemoMode";

export interface OrderBookEntry {
  id: string;
  price: string;
  amount: string;
  total?: string;
  maker: string;
  timestamp: string;
  fills?: number;
  orderHash?: string;
}

export interface Trade {
  id: string;
  price: string;
  amount: string;
  side: "buy" | "sell";
  timestamp: string;
  txHash: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export interface OrderBookStats {
  bestBid: string;
  bestAsk: string;
  spread: string;
  volume24h: string;
  priceChange24h: string;
  high24h: string;
  low24h: string;
}

export interface OrderBookData {
  pair: string;
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastTrades: Trade[];
  stats: OrderBookStats;
  timestamp: string;
}

interface RawOrder {
  orderHash: string;
  createDateTime: string;
  remainingMakerAmount: string;
  data: {
    makerAsset: string;
    takerAsset: string;
    makingAmount: string;
    takingAmount: string;
    maker: string;
    [key: string]: any;
  };
  makerRate: string;
  takerRate: string;
  [key: string]: any;
}

interface UseOrderBookOptions {
  chainId: number;
  baseToken: string;
  quoteToken: string;
  refreshInterval?: number;
  enabled?: boolean;
}

// Token decimals mapping - comprehensive list of popular Ethereum ERC20 tokens
const TOKEN_DECIMALS: { [address: string]: number } = {
  // Stablecoins
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6,  // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 6,  // USDT
  '0x6b175474e89094c44da98b954eedeac495271d0f': 18, // DAI
  '0x4fabb145d64652a948d72533023f6e7a623c7c53': 18, // BUSD
  '0x8e870d67f660d95d5be530380d0ec0bd388289e1': 18, // PAXG
  '0x57ab1ec28d129707052df4df418d58a2d46d5f51': 18, // USDY
  '0x0000000000085d4780b73119b644ae5ecd22b376': 18, // TUSD
  '0xa693b19d2931d498c5b318df961919bb4aee87a5': 6,  // UST (TerraClassicUSD)
  '0x1456688345527be1f37e9e627da0837d6f08c925': 18, // USDP
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 8,  // WBTC

  // Major tokens
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 18, // WETH
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 18, // UNI
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': 18, // MATIC
  '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b': 18, // CRO
  '0x514910771af9ca656af840dff83e8264ecf986ca': 18, // LINK
  '0x6982508145454ce325ddbe47a25d4ec3d2311933': 18, // PEPE
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': 18, // SHIB
  '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': 18, // SUSHI
  '0x0d8775f648430679a709e98d2b0cb6250d2887ef': 18, // BAT
  '0x4e15361fd6b4bb609fa63c81a2be19d873717870': 18, // FTX
  '0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0': 18, // LOOM

  // DeFi Tokens
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 18, // AAVE
  '0xc00e94cb662c3520282e6f5717214004a7f26888': 18, // COMP
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 18, // MKR
  '0x1985365e9f78359a9b6ad760e32412f4a445e862': 18, // REP
  '0x408e41876cccdc0f92210600ef50372656052a38': 18, // REN
  '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': 18, // SNX
  '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': 18, // YFI
  '0xd533a949740bb3306d119cc777fa900ba034cd52': 18, // CRV
  '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671': 18, // NMR

  // Exchange Tokens
  '0xb8c77482e45f1f44de1745f52c74426c631bdd52': 18, // BNB
  '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9': 18, // FTT
  '0x4156d3342d5c385a87d264f90653733592000581': 18, // SALT
  '0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27': 18, // ZIL
  '0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3': 18, // LEO

  // Meme/Community Tokens
  '0xa2b4c0af19cc16a6cfacce81f192b024d625817d': 18, // KISHU
  '0x3597bfd533a99c9aa083587b074434e61eb0a258': 18, // DENT
  '0xf5d669627376ebd411e34b98f19c868c8aba5ada': 18, // AXIE
  '0x4ceda7906a5ed2179785cd3a40a69ee8bc99c466': 8,  // AEUR

  // Layer 2 and Scaling
  '0x3c3a81e81dc49a522a592e7622a7e711c06bf354': 18, // MNT (Mantle)
  '0x0ab87046fbb341d058f17cbc4c1133f25a20a52f': 18, // gOHM
  '0x92d6c1e31e14520e676a687f0a93788b716beff5': 18, // DYDX

  // Other Popular Tokens
  '0x853d955acef822db058eb8505911ed77f175b99e': 18, // FRAX
  '0x6c3ea9036406852006290770bedfcaba0e23a0e8': 6,  // PYUSD
  '0x4d224452801aced8b2f0aebe155379bb5d594381': 18, // APE
  '0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5': 18, // BIT
  '0xa1faa113cbe53436df28ff0aee54275c13b40975': 18, // AMPL
  '0x967da4048cd07ab37855c090aaf366e4ce1b9f48': 8,  // COTI
};

function getTokenDecimals(tokenAddress: string): number {
  return TOKEN_DECIMALS[tokenAddress.toLowerCase()] || 18;
}

function formatTokenAmount(amount: string, decimals: number): number {
  return parseFloat(amount) / Math.pow(10, decimals);
}

function processRawOrders(
  orders: RawOrder[],
  baseTokenAddress: string,
  quoteTokenAddress: string,
): { asks: OrderBookEntry[]; bids: OrderBookEntry[] } {
  const asks: OrderBookEntry[] = [];
  const bids: OrderBookEntry[] = [];

  const baseDecimals = getTokenDecimals(baseTokenAddress);
  const quoteDecimals = getTokenDecimals(quoteTokenAddress);

  orders.forEach((order) => {
    const { makerAsset, takerAsset, makingAmount, takingAmount, maker } =
      order.data;

    // Normalize addresses for comparison
    const normalizedMakerAsset = makerAsset.toLowerCase();
    const normalizedTakerAsset = takerAsset.toLowerCase();
    const normalizedBaseToken = baseTokenAddress.toLowerCase();
    const normalizedQuoteToken = quoteTokenAddress.toLowerCase();

    const makerAmount = formatTokenAmount(
      makingAmount,
      normalizedMakerAsset === normalizedBaseToken
        ? baseDecimals
        : quoteDecimals,
    );
    const takerAmount = formatTokenAmount(
      takingAmount,
      normalizedTakerAsset === normalizedBaseToken
        ? baseDecimals
        : quoteDecimals,
    );

    let price: number;
    let amount: number;
    let isAsk: boolean;

    if (
      normalizedMakerAsset === normalizedBaseToken &&
      normalizedTakerAsset === normalizedQuoteToken
    ) {
      // Maker is selling base token for quote token (ASK)
      price = takerAmount / makerAmount; // quote per base
      amount = makerAmount; // base token amount
      isAsk = true;
    } else if (
      normalizedMakerAsset === normalizedQuoteToken &&
      normalizedTakerAsset === normalizedBaseToken
    ) {
      // Maker is selling quote token for base token (BID)
      price = makerAmount / takerAmount; // quote per base
      amount = takerAmount; // base token amount
      isAsk = false;
    } else {
      // Skip orders that don't match our token pair
      return;
    }

    const total = price * amount;
    const entry: OrderBookEntry = {
      id: order.orderHash,
      price: price.toFixed(6),
      amount: amount.toFixed(6),
      total: total.toFixed(6),
      maker: maker,
      timestamp: order.createDateTime,
      orderHash: order.orderHash,
    };

    if (isAsk) {
      asks.push(entry);
    } else {
      bids.push(entry);
    }
  });

  // Sort asks by price (ascending - lowest first)
  asks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  // Sort bids by price (descending - highest first)
  bids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

  return { asks, bids };
}

export function useOrderBook({
  chainId,
  baseToken,
  quoteToken,
  refreshInterval = 5000,
  enabled = true,
}: UseOrderBookOptions) {
  const [data, setData] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isDemoMode } = useDemoMode();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchOrderBook = useCallback(async () => {
    if (!enabled || !baseToken || !quoteToken) {
      return;
    }

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const params = new URLSearchParams({
        baseToken,
        quoteToken,
        demo: isDemoMode.toString(),
      });

      const response = await fetch(
        `/api/limit-orders/${chainId}/orderbook?${params}`,
        {
          signal: abortControllerRef.current.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const orderBookData = await response.json();

      // Check if the response contains raw orders that need processing
      let processedAsks: OrderBookEntry[];
      let processedBids: OrderBookEntry[];

      if (orderBookData.orders || Array.isArray(orderBookData)) {
        // Raw orders format - process them
        const orders: RawOrder[] = orderBookData.orders || orderBookData;
        const processed = processRawOrders(orders, baseToken, quoteToken);
        processedAsks = processed.asks;
        processedBids = processed.bids;
      } else if (orderBookData.asks && orderBookData.bids) {
        // Already processed format - just calculate totals
        processedAsks = orderBookData.asks.map((ask: OrderBookEntry) => ({
          ...ask,
          total: (parseFloat(ask.price) * parseFloat(ask.amount)).toFixed(6),
        }));

        processedBids = orderBookData.bids.map((bid: OrderBookEntry) => ({
          ...bid,
          total: (parseFloat(bid.price) * parseFloat(bid.amount)).toFixed(6),
        }));
      } else {
        throw new Error("Invalid order book data format");
      }

      setData({
        ...orderBookData,
        asks: processedAsks,
        bids: processedBids,
      });
      setError(null);
      setIsConnected(true);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Request was cancelled
      }

      console.error("Error fetching order book:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch order book",
      );
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [chainId, baseToken, quoteToken, enabled, isDemoMode]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      setLoading(true);
      fetchOrderBook();
    }
  }, [fetchOrderBook, enabled]);

  // Set up interval for real-time updates
  useEffect(() => {
    if (!enabled || !refreshInterval) {
      return;
    }

    intervalRef.current = setInterval(fetchOrderBook, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchOrderBook, refreshInterval, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchOrderBook();
  }, [fetchOrderBook]);

  return {
    data,
    loading,
    error,
    isConnected,
    refresh,
  };
}
