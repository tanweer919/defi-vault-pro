/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAccount, useChainId } from "wagmi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  ArrowUpDown,
  Zap,
} from "lucide-react";
import { useTransactionHistory } from "@/lib/hooks/useTransactionHistory";

interface ProtocolStats {
  name: string;
  swapCount: number;
  totalVolume: number;
  avgPriceImpact: number;
  avgSlippage: number;
}

interface TokenStats {
  symbol: string;
  buyCount: number;
  sellCount: number;
  totalBuyVolume: number;
  totalSellVolume: number;
  netVolume: number;
}

export const DeFiAnalytics: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { transactions, loading, error, fetchSwapHistory, refreshData } =
    useTransactionHistory();

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d",
  );
  const [protocolStats, setProtocolStats] = useState<ProtocolStats[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalSwaps: 0,
    totalVolume: 0,
    avgPriceImpact: 0,
    avgSlippage: 0,
    gasPaid: 0,
    uniqueTokens: 0,
  });

  const loadAnalyticsData = useCallback(async () => {
    try {
      const filters: any = {
        limit: 500,
        eventTypes: ["swap"],
      };

      // Set time range filter
      if (timeRange !== "all") {
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const startTime = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
        filters.startTime = startTime;
      }

      await fetchSwapHistory(filters);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    }
  }, [timeRange, fetchSwapHistory]);

  useEffect(() => {
    if (address && chainId) {
      loadAnalyticsData();
    }
  }, [address, chainId, timeRange, loadAnalyticsData]);

  useEffect(() => {
    if (transactions.length > 0) {
      calculateAnalytics();
    }
  }, [transactions, calculateAnalytics]);

  const calculateAnalytics = useCallback(() => {
    const swaps = transactions.filter((tx) => tx.type === "swap");

    // Calculate protocol statistics
    const protocolMap = new Map<
      string,
      {
        swapCount: number;
        totalVolume: number;
        priceImpacts: number[];
        slippages: number[];
      }
    >();

    // Calculate token statistics
    const tokenMap = new Map<
      string,
      {
        buyCount: number;
        sellCount: number;
        totalBuyVolume: number;
        totalSellVolume: number;
      }
    >();

    let totalVolume = 0;
    let totalGasPaid = 0;
    const priceImpacts: number[] = [];
    const slippages: number[] = [];
    const uniqueTokens = new Set<string>();

    swaps.forEach((swap) => {
      const protocol = swap.protocol || "Unknown";
      const fromToken = swap.fromToken.symbol;
      const toToken = swap.toToken.symbol;

      uniqueTokens.add(fromToken);
      uniqueTokens.add(toToken);

      // Estimate volume (using from token amount as proxy)
      const volume = parseFloat(swap.fromToken.amount) || 0;
      totalVolume += volume;

      // Calculate gas cost
      if (swap.gasCostEth) {
        totalGasPaid += parseFloat(swap.gasCostEth);
      } else if (swap.gasUsed && swap.gasPrice) {
        const gasCost =
          (parseFloat(swap.gasUsed) * parseFloat(swap.gasPrice)) / 1e18;
        totalGasPaid += gasCost;
      }

      // Track price impact and slippage
      if (swap.priceImpact) {
        const impact = parseFloat(swap.priceImpact.replace("%", ""));
        if (!isNaN(impact)) priceImpacts.push(impact);
      }
      if (swap.slippage) {
        const slip = parseFloat(swap.slippage.replace("%", ""));
        if (!isNaN(slip)) slippages.push(slip);
      }

      // Protocol statistics
      if (!protocolMap.has(protocol)) {
        protocolMap.set(protocol, {
          swapCount: 0,
          totalVolume: 0,
          priceImpacts: [],
          slippages: [],
        });
      }
      const protocolData = protocolMap.get(protocol)!;
      protocolData.swapCount++;
      protocolData.totalVolume += volume;
      if (swap.priceImpact) {
        const impact = parseFloat(swap.priceImpact.replace("%", ""));
        if (!isNaN(impact)) protocolData.priceImpacts.push(impact);
      }
      if (swap.slippage) {
        const slip = parseFloat(swap.slippage.replace("%", ""));
        if (!isNaN(slip)) protocolData.slippages.push(slip);
      }

      // Token statistics (simplified - treating from token as sell, to token as buy)
      if (!tokenMap.has(fromToken)) {
        tokenMap.set(fromToken, {
          buyCount: 0,
          sellCount: 0,
          totalBuyVolume: 0,
          totalSellVolume: 0,
        });
      }
      if (!tokenMap.has(toToken)) {
        tokenMap.set(toToken, {
          buyCount: 0,
          sellCount: 0,
          totalBuyVolume: 0,
          totalSellVolume: 0,
        });
      }

      tokenMap.get(fromToken)!.sellCount++;
      tokenMap.get(fromToken)!.totalSellVolume += volume;
      tokenMap.get(toToken)!.buyCount++;
      tokenMap.get(toToken)!.totalBuyVolume +=
        parseFloat(swap.toToken.amount) || 0;
    });

    // Convert to arrays and sort
    const protocolStatsArray: ProtocolStats[] = Array.from(
      protocolMap.entries(),
    )
      .map(([name, data]) => ({
        name,
        swapCount: data.swapCount,
        totalVolume: data.totalVolume,
        avgPriceImpact:
          data.priceImpacts.length > 0
            ? data.priceImpacts.reduce((a, b) => a + b, 0) /
              data.priceImpacts.length
            : 0,
        avgSlippage:
          data.slippages.length > 0
            ? data.slippages.reduce((a, b) => a + b, 0) / data.slippages.length
            : 0,
      }))
      .sort((a, b) => b.swapCount - a.swapCount);

    const tokenStatsArray: TokenStats[] = Array.from(tokenMap.entries())
      .map(([symbol, data]) => ({
        symbol,
        buyCount: data.buyCount,
        sellCount: data.sellCount,
        totalBuyVolume: data.totalBuyVolume,
        totalSellVolume: data.totalSellVolume,
        netVolume: data.totalBuyVolume - data.totalSellVolume,
      }))
      .sort((a, b) => b.buyCount + b.sellCount - (a.buyCount + a.sellCount));

    setProtocolStats(protocolStatsArray);
    setTokenStats(tokenStatsArray.slice(0, 10)); // Top 10 tokens
    setTotalStats({
      totalSwaps: swaps.length,
      totalVolume,
      avgPriceImpact:
        priceImpacts.length > 0
          ? priceImpacts.reduce((a, b) => a + b, 0) / priceImpacts.length
          : 0,
      avgSlippage:
        slippages.length > 0
          ? slippages.reduce((a, b) => a + b, 0) / slippages.length
          : 0,
      gasPaid: totalGasPaid,
      uniqueTokens: uniqueTokens.size,
    });
  }, [transactions]);

  if (!address) {
    return (
      <Card className="p-6" gradient>
        <div className="text-center py-8 text-gray-500">
          Connect your wallet to view DeFi analytics
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">DeFi Analytics</h2>
          <p className="text-gray-600">
            Insights from your 1inch transaction history
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["7d", "30d", "90d", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {range === "all" ? "All" : range.toUpperCase()}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={refreshData}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">Error loading analytics: {error}</p>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6" gradient>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Swaps
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalStats.totalSwaps}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ArrowUpDown className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6" gradient>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Gas Paid
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalStats.gasPaid.toFixed(4)} ETH
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6" gradient>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Price Impact
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalStats.avgPriceImpact.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6" gradient>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Unique Tokens
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalStats.uniqueTokens}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <PieChart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Protocol Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6" gradient>
                <h3 className="text-lg font-semibold mb-4">Protocol Usage</h3>
                <div className="space-y-3">
                  {protocolStats.slice(0, 5).map((protocol, index) => (
                    <div
                      key={protocol.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{protocol.name}</p>
                          <p className="text-xs text-gray-500">
                            {protocol.swapCount} swaps
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {protocol.avgPriceImpact.toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500">avg impact</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Token Analysis */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6" gradient>
                <h3 className="text-lg font-semibold mb-4">
                  Top Tokens Traded
                </h3>
                <div className="space-y-3">
                  {tokenStats.slice(0, 5).map((token, index) => (
                    <div
                      key={token.symbol}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-xs text-gray-500">
                            {token.buyCount + token.sellCount} trades
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-sm text-green-600">
                            {token.buyCount}
                          </span>
                          <TrendingDown className="w-3 h-3 text-red-500" />
                          <span className="text-sm text-red-600">
                            {token.sellCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};
