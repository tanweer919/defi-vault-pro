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

interface UseOrderBookOptions {
  chainId: number;
  baseToken: string;
  quoteToken: string;
  refreshInterval?: number;
  enabled?: boolean;
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

      // Calculate totals for order book entries
      const processedAsks = orderBookData.asks.map((ask: OrderBookEntry) => ({
        ...ask,
        total: (parseFloat(ask.price) * parseFloat(ask.amount)).toFixed(6),
      }));

      const processedBids = orderBookData.bids.map((bid: OrderBookEntry) => ({
        ...bid,
        total: (parseFloat(bid.price) * parseFloat(bid.amount)).toFixed(6),
      }));

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
