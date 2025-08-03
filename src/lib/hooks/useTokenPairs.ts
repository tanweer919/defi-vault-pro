"use client";

import { useState, useEffect } from "react";

export interface TokenPair {
  baseToken: string;
  quoteToken: string;
  symbol: string;
}

export interface TokenPairsResponse {
  pairs: TokenPair[];
  error?: string;
}

/**
 * Hook to fetch valid token pairs from active-pairs.json
 * Uses real crypto trading pairs from the 1inch limit order protocol
 */
export function useTokenPairs(chainId?: number) {
  const [pairs, setPairs] = useState<TokenPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPairs = async () => {
    if (!chainId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch token pairs from our new API endpoint
      const response = await fetch(`/api/token-pairs/${chainId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch token pairs: ${response.statusText}`);
      }

      const data = await response.json();
      setPairs(data.pairs || []);
    } catch (err) {
      console.error("Error fetching token pairs:", err);
      setError(err instanceof Error ? err.message : "Unknown error");

      // Fallback to popular pairs from active-pairs.json structure
      setPairs([
        {
          baseToken: "0x0000000000085d4780b73119b644ae5ecd22b376",
          quoteToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          symbol: "TrueUSD/USDC",
        },
        {
          baseToken: "0x0000000000085d4780b73119b644ae5ecd22b376",
          quoteToken: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          symbol: "TrueUSD/USDT",
        },
        {
          baseToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          quoteToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          symbol: "USDC/WETH",
        },
        {
          baseToken: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          quoteToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          symbol: "USDT/WETH",
        },
        {
          baseToken: "0x000000000000d0151e748d25b766e77efe2a6c83",
          quoteToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          symbol: "HAM/USDC",
        },
        {
          baseToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
          quoteToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          symbol: "DAI/WETH",
        },
        {
          baseToken: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
          quoteToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          symbol: "UNI/USDC",
        },
        {
          baseToken: "0x0000000000300dd8b0230efcfef136ecdf6abcde",
          quoteToken: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          symbol: "PLEB/USDT",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chainId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch token pairs from our new API endpoint
        const response = await fetch(`/api/token-pairs/${chainId}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch token pairs: ${response.statusText}`,
          );
        }

        const data = await response.json();
        setPairs(data.pairs || []);
      } catch (err) {
        console.error("Error fetching token pairs:", err);
        setError(err instanceof Error ? err.message : "Unknown error");

        // Fallback to popular pairs from active-pairs.json structure
        setPairs([
          {
            baseToken: "0x0000000000085d4780b73119b644ae5ecd22b376",
            quoteToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "TrueUSD/USDC",
          },
          {
            baseToken: "0x0000000000085d4780b73119b644ae5ecd22b376",
            quoteToken: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "TrueUSD/USDT",
          },
          {
            baseToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            quoteToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "USDC/WETH",
          },
          {
            baseToken: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            quoteToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "USDT/WETH",
          },
          {
            baseToken: "0x000000000000d0151e748d25b766e77efe2a6c83",
            quoteToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "HAM/USDC",
          },
          {
            baseToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
            quoteToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "DAI/WETH",
          },
          {
            baseToken: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            quoteToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "UNI/USDC",
          },
          {
            baseToken: "0x0000000000300dd8b0230efcfef136ecdf6abcde",
            quoteToken: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "PLEB/USDT",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chainId]);

  return {
    pairs,
    loading,
    error,
    refetch: fetchPairs,
  };
}
