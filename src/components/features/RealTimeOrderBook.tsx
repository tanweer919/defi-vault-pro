"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useOrderBook, OrderBookEntry, Trade } from "@/lib/hooks/useOrderBook";
import { useTokenPairs, TokenPair } from "@/lib/hooks/useTokenPairs";
import { PairSelector } from "@/components/features/PairSelector";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
  Signal,
  Settings2,
} from "lucide-react";
import { formatPreciseNumber } from "@/lib/utils/utils";

interface OrderBookProps {
  chainId: number;
  baseToken?: string;
  quoteToken?: string;
  className?: string;
  onPairChange?: (baseToken: string, quoteToken: string) => void;
}

interface OrderBookRowProps {
  entry: OrderBookEntry;
  type: "bid" | "ask";
  maxAmount: number;
  onRowClick?: (entry: OrderBookEntry) => void;
  index: number;
}

function OrderBookRow({
  entry,
  type,
  maxAmount,
  onRowClick,
  index,
}: OrderBookRowProps) {
  const fillPercentage = (parseFloat(entry.amount) / maxAmount) * 100;
  const isBid = type === "bid";

  return (
    <motion.div
      initial={{ opacity: 0, x: isBid ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isBid ? -20 : 20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.02,
        ease: "easeOut",
      }}
      className={`
        relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 
        transition-colors duration-200 rounded px-2 py-1 group
      `}
      onClick={() => onRowClick?.(entry)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Background fill visualization */}
      <motion.div
        className={`
          absolute inset-0 rounded
          ${
            isBid
              ? "bg-green-100 dark:bg-green-900/20"
              : "bg-red-100 dark:bg-red-900/20"
          }
        `}
        initial={{ width: 0 }}
        animate={{ width: `${fillPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          right: isBid ? "auto" : 0,
          left: isBid ? 0 : "auto",
        }}
      />

      <div className="relative z-10 grid grid-cols-3 gap-2 text-sm">
        <span
          className={`font-medium ${
            isBid
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatPreciseNumber(parseFloat(entry.price), 6)}
        </span>
        <span className="text-gray-700 dark:text-gray-300">
          {formatPreciseNumber(parseFloat(entry.amount), 4)}
        </span>
        <span className="text-gray-600 dark:text-gray-400 text-right">
          {formatPreciseNumber(parseFloat(entry.total || "0"), 2)}
        </span>
      </div>

      {/* Hover tooltip */}
      <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
        Maker: {entry.maker.slice(0, 6)}...{entry.maker.slice(-4)}
        {entry.fills !== undefined && <div>Fills: {entry.fills}</div>}
      </div>
    </motion.div>
  );
}

function TradeRow({ trade, index }: { trade: Trade; index: number }) {
  const isBuy = trade.side === "buy";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      className="grid grid-cols-4 gap-1 text-xs py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1"
    >
      <span
        className={`font-medium ${
          isBuy
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {formatPreciseNumber(parseFloat(trade.price), 4)}
      </span>
      <span className="text-gray-700 dark:text-gray-300">
        {formatPreciseNumber(parseFloat(trade.amount), 4)}
      </span>
      <span className="text-gray-600 dark:text-gray-400">
        {new Date(trade.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
      <div className="flex justify-end">
        {isBuy ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
      </div>
    </motion.div>
  );
}

export function RealTimeOrderBook({
  chainId,
  baseToken: initialBaseToken,
  quoteToken: initialQuoteToken,
  className = "",
  onPairChange,
}: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<"book" | "trades">("book");
  const [maxDisplayEntries, setMaxDisplayEntries] = useState(10);
  const [selectedBaseToken, setSelectedBaseToken] = useState(initialBaseToken);
  const [selectedQuoteToken, setSelectedQuoteToken] =
    useState(initialQuoteToken);

  // Load available token pairs
  const { pairs, loading: pairsLoading } = useTokenPairs(chainId);

  // Currently selected pair for display
  const selectedPair = useMemo(() => {
    if (!selectedBaseToken || !selectedQuoteToken) return null;
    return (
      pairs.find(
        (pair) =>
          pair.baseToken.toLowerCase() === selectedBaseToken.toLowerCase() &&
          pair.quoteToken.toLowerCase() === selectedQuoteToken.toLowerCase(),
      ) || {
        baseToken: selectedBaseToken,
        quoteToken: selectedQuoteToken,
        symbol: `${selectedBaseToken.slice(0, 6)}.../${selectedQuoteToken.slice(
          0,
          6,
        )}...`,
      }
    );
  }, [selectedBaseToken, selectedQuoteToken, pairs]);

  const handlePairSelect = useCallback(
    (pair: TokenPair) => {
      setSelectedBaseToken(pair.baseToken);
      setSelectedQuoteToken(pair.quoteToken);
      onPairChange?.(pair.baseToken, pair.quoteToken);
    },
    [onPairChange],
  );

  const { data, loading, error, isConnected, refresh } = useOrderBook({
    chainId,
    baseToken: selectedBaseToken || "",
    quoteToken: selectedQuoteToken || "",
    refreshInterval: 3000,
    enabled: Boolean(selectedBaseToken && selectedQuoteToken),
  });

  // Calculate max amounts for visualization
  const maxBidAmount = useMemo(() => {
    if (!data?.bids.length) return 1;
    return Math.max(...data.bids.map((bid) => parseFloat(bid.amount)));
  }, [data?.bids]);

  const maxAskAmount = useMemo(() => {
    if (!data?.asks.length) return 1;
    return Math.max(...data.asks.map((ask) => parseFloat(ask.amount)));
  }, [data?.asks]);

  const maxAmount = Math.max(maxBidAmount, maxAskAmount);

  // Get current spread
  const spread = useMemo(() => {
    if (!data?.bids.length || !data?.asks.length) return null;
    const bestBid = parseFloat(data.bids[0]?.price || "0");
    const bestAsk = parseFloat(data.asks[0]?.price || "0");
    const spreadValue = bestAsk - bestBid;
    const spreadPercent = (spreadValue / bestBid) * 100;
    return { value: spreadValue, percent: spreadPercent };
  }, [data]);

  // Handle row click - could be used to fill order forms
  const handleRowClick = (entry: OrderBookEntry) => {
    console.log("Order book entry clicked:", entry);
    // This could dispatch an event or call a callback to fill order forms
  };

  if (loading && !data) {
    return (
      <Card className={`p-6 ${className}`} gradient>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`} gradient>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Connection Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!selectedBaseToken || !selectedQuoteToken) {
    return (
      <Card className={`${className}`} gradient>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Book
            </h3>
            <PairSelector
              pairs={pairs}
              selectedPair={selectedPair}
              onPairSelect={handlePairSelect}
              loading={pairsLoading}
            />
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Settings2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Select a trading pair to view the order book
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Choose from {pairs.length} available pairs
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={`p-6 ${className}`} gradient>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600 dark:text-gray-400">
            No order book data available
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className}`} gradient>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Book
            </h3>
            <motion.div
              animate={{
                scale: isConnected ? [1, 1.2, 1] : 1,
                opacity: isConnected ? 1 : 0.5,
              }}
              transition={{
                duration: isConnected ? 1.5 : 0.3,
                repeat: isConnected ? Infinity : 0,
                repeatDelay: 2,
              }}
            >
              <Signal
                className={`w-4 h-4 ${
                  isConnected ? "text-green-500" : "text-gray-400"
                }`}
              />
            </motion.div>
          </div>

          <div className="flex items-center space-x-3">
            <PairSelector
              pairs={pairs}
              selectedPair={selectedPair}
              onPairSelect={handlePairSelect}
              loading={pairsLoading}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === "book"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab("book")}
              >
                Book
              </button>
              <button
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === "trades"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab("trades")}
              >
                Trades
              </button>
            </div>
          </div>
        </div>

        {/* Pair and Stats */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {selectedPair?.symbol || data.pair}
          </span>
          {spread && (
            <span className="text-gray-600 dark:text-gray-400">
              Spread: {formatPreciseNumber(spread.percent, 3)}%
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === "book" ? (
            <motion.div
              key="orderbook"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Headers */}
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 px-2">
                <span>Price</span>
                <span>Amount</span>
                <span className="text-right">Total</span>
              </div>

              {/* Asks (Sell Orders) */}
              <div className="space-y-1 mb-4">
                <AnimatePresence>
                  {data.asks
                    .slice(0, maxDisplayEntries)
                    .reverse()
                    .map((ask, index) => (
                      <OrderBookRow
                        key={`ask-${ask.id}`}
                        entry={ask}
                        type="ask"
                        maxAmount={maxAmount}
                        onRowClick={handleRowClick}
                        index={index}
                      />
                    ))}
                </AnimatePresence>
              </div>

              {/* Current Price/Spread */}
              <motion.div
                className="py-3 border-t border-b border-gray-200 dark:border-gray-700 text-center"
                animate={{
                  backgroundColor: ["transparent", "#f3f4f6", "transparent"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-lg">
                    $
                    {formatPreciseNumber(
                      (parseFloat(data.stats.bestBid) +
                        parseFloat(data.stats.bestAsk)) /
                        2,
                      2,
                    )}
                  </span>
                  <span
                    className={`text-sm ${
                      data.stats.priceChange24h.startsWith("-")
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {data.stats.priceChange24h}
                  </span>
                </div>
              </motion.div>

              {/* Bids (Buy Orders) */}
              <div className="space-y-1 mt-4">
                <AnimatePresence>
                  {data.bids.slice(0, maxDisplayEntries).map((bid, index) => (
                    <OrderBookRow
                      key={`bid-${bid.id}`}
                      entry={bid}
                      type="bid"
                      maxAmount={maxAmount}
                      onRowClick={handleRowClick}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Show more button */}
              {(data.asks.length > maxDisplayEntries ||
                data.bids.length > maxDisplayEntries) && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setMaxDisplayEntries((prev) => (prev === 10 ? 20 : 10))
                    }
                  >
                    {maxDisplayEntries === 10 ? "Show More" : "Show Less"}
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="trades"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Headers */}
              <div className="grid grid-cols-4 gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">
                <span>Price</span>
                <span>Amount</span>
                <span>Time</span>
                <span className="text-right">Side</span>
              </div>

              {/* Recent Trades */}
              <div className="space-y-1 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {data.lastTrades.map((trade, index) => (
                    <TradeRow
                      key={`trade-${trade.id}`}
                      trade={trade}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500 dark:text-gray-400">
              Volume 24h:
            </span>
            <span className="ml-1 font-medium">${data.stats.volume24h}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">High/Low:</span>
            <span className="ml-1 font-medium">
              ${data.stats.high24h} / ${data.stats.low24h}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
