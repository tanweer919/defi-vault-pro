"use client";

import "@/styles/order-book.css";
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useOrderBook, OrderBookEntry, Trade } from "@/lib/hooks/useOrderBook";
import { formatPreciseNumber } from "@/lib/utils/utils";

interface OrderBookProps {
  chainId: number;
  baseToken?: string;
  quoteToken?: string;
  className?: string;
  onPairChange?: (base: string, quote: string) => void;
}

// Loading Skeleton Component
const OrderBookSkeleton = () => {
  return (
    <div className="orderbook-skeleton">
      {/* Header Skeleton */}
      <div className="orderbook-header">
        <div className="orderbook-pair-selector">
          <div className="skeleton-pair-selector" />
        </div>
        <div className="orderbook-tabs">
          <div className="skeleton-tab" />
          <div className="skeleton-tab" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="orderbook-content">
        {/* Column Headers */}
        <div className="orderbook-column-headers">
          <span>Price</span>
          <span>Amount</span>
          <span>Total</span>
        </div>

        {/* Asks Skeleton */}
        <div className="orderbook-asks">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`ask-skeleton-${i}`} className="orderbook-row skeleton">
              <div className="skeleton-depth-bar" />
              <span className="skeleton-text price" />
              <span className="skeleton-text amount" />
              <span className="skeleton-text total" />
            </div>
          ))}
        </div>

        {/* Spread Skeleton */}
        <div className="orderbook-spread">
          <div className="spread-info">
            <span className="skeleton-text spread-price" />
            <span className="skeleton-text spread-value" />
          </div>
        </div>

        {/* Bids Skeleton */}
        <div className="orderbook-bids">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`bid-skeleton-${i}`} className="orderbook-row skeleton">
              <div className="skeleton-depth-bar" />
              <span className="skeleton-text price" />
              <span className="skeleton-text amount" />
              <span className="skeleton-text total" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function RealTimeOrderBook({
  chainId,
  baseToken = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH (base)
  quoteToken = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC (quote)
  className = "",
  onPairChange,
}: OrderBookProps) {
  const [tab, setTab] = useState<"book" | "trades">("book");
  const [maxEntries, setMaxEntries] = useState(12);

  const { data, loading, error, refresh } = useOrderBook({
    chainId,
    baseToken: baseToken || "",
    quoteToken: quoteToken || "",
    refreshInterval: 5000,
    enabled: Boolean(baseToken && quoteToken),
  });

  const { asks, bids, spread, midPrice, baseSymbol, quoteSymbol } =
    useMemo(() => {
      if (!data) {
        return {
          asks: [],
          bids: [],
          spread: 0,
          midPrice: 0,
          baseSymbol: "BASE",
          quoteSymbol: "QUOTE",
        };
      }

      // Use the processed data from the hook
      const processedAsks = data.asks.slice(0, maxEntries);
      const processedBids = data.bids.slice(0, maxEntries);

      // Calculate spread and mid price
      const bestAsk =
        processedAsks.length > 0 ? parseFloat(processedAsks[0].price) : 0;
      const bestBid =
        processedBids.length > 0 ? parseFloat(processedBids[0].price) : 0;
      const calculatedSpread =
        bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
      const calculatedMidPrice =
        bestAsk > 0 && bestBid > 0 ? (bestAsk + bestBid) / 2 : 0;

      // Get token symbols from data
      const baseSymbol = data.baseToken?.symbol || "BASE";
      const quoteSymbol = data.quoteToken?.symbol || "QUOTE";

      return {
        asks: processedAsks,
        bids: processedBids,
        spread: calculatedSpread,
        midPrice: calculatedMidPrice,
        baseSymbol,
        quoteSymbol,
      };
    }, [data, maxEntries]);

  const getDepthPercentage = (total: string, maxTotal: number) => {
    const totalValue = parseFloat(total || "0");
    return maxTotal > 0 ? (totalValue / maxTotal) * 100 : 0;
  };

  const maxTotal = useMemo(() => {
    const allEntries = [...asks, ...bids];
    return Math.max(
      ...allEntries.map((entry) => parseFloat(entry.total || "0")),
      0,
    );
  }, [asks, bids]);

  if (loading) {
    return (
      <Card className={`${className} orderbook-card`}>
        <OrderBookSkeleton />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} orderbook-card`}>
        <div className="orderbook-error">
          <div className="error-icon">⚠️</div>
          <p>Failed to load order book</p>
          <span>{error}</span>
          <button className="retry-button" onClick={refresh}>
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (!data || (asks.length === 0 && bids.length === 0)) {
    return (
      <Card className={`${className} orderbook-card`}>
        <div className="orderbook-empty">
          <div className="empty-icon">📊</div>
          <p>No order book data available</p>
          <span>Waiting for market orders...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className} orderbook-card`}>
      {/* Header */}
      <div className="orderbook-header">
        <div className="orderbook-title">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Order Book
          </h3>
          <p className="text-sm text-gray-500">
            {baseSymbol} / {quoteSymbol}
          </p>
        </div>

        <div className="orderbook-tabs">
          <button
            className={`orderbook-tab ${tab === "book" ? "active" : ""}`}
            onClick={() => setTab("book")}
          >
            Book
          </button>
          <button
            className={`orderbook-tab ${tab === "trades" ? "active" : ""}`}
            onClick={() => setTab("trades")}
          >
            Trades
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="orderbook-content">
        {tab === "book" ? (
          <>
            {/* Column Headers */}
            <div className="orderbook-column-headers">
              <span>Price ({quoteSymbol})</span>
              <span>Amount ({baseSymbol})</span>
              <span>Total ({quoteSymbol})</span>
            </div>

            {/* Asks (Sell Orders) */}
            <div className="orderbook-asks">
              {asks.map((ask) => (
                <div key={ask.id} className="orderbook-row ask">
                  <div
                    className="orderbook-depth-bar ask"
                    style={{
                      width: `${getDepthPercentage(ask.total, maxTotal)}%`,
                    }}
                  />
                  <span className="price ask">
                    {formatPreciseNumber(parseFloat(ask.price), 6)}
                  </span>
                  <span className="amount">
                    {formatPreciseNumber(parseFloat(ask.amount), 4)}
                  </span>
                  <span className="total">
                    {formatPreciseNumber(parseFloat(ask.total || "0"), 2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Spread */}
            <div className="orderbook-spread">
              <div className="spread-info">
                {midPrice > 0 && (
                  <>
                    <span className="spread-price">
                      {formatPreciseNumber(midPrice, 6)}
                    </span>
                    <span className="spread-value">
                      ↕ {formatPreciseNumber(spread, 6)}
                    </span>
                  </>
                )}
                {midPrice === 0 && (
                  <span className="spread-price">No spread data</span>
                )}
              </div>
            </div>

            {/* Bids (Buy Orders) */}
            <div className="orderbook-bids">
              {bids.map((bid) => (
                <div key={bid.id} className="orderbook-row bid">
                  <div
                    className="orderbook-depth-bar bid"
                    style={{
                      width: `${getDepthPercentage(bid.total, maxTotal)}%`,
                    }}
                  />
                  <span className="price bid">
                    {formatPreciseNumber(parseFloat(bid.price), 6)}
                  </span>
                  <span className="amount">
                    {formatPreciseNumber(parseFloat(bid.amount), 4)}
                  </span>
                  <span className="total">
                    {formatPreciseNumber(parseFloat(bid.total || "0"), 2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {data &&
              (data.asks.length > maxEntries ||
                data.bids.length > maxEntries) && (
                <div className="orderbook-controls">
                  <button
                    className="orderbook-show-more"
                    onClick={() =>
                      setMaxEntries((prev) => (prev === 12 ? 24 : 12))
                    }
                  >
                    {maxEntries === 12 ? "Show More" : "Show Less"}
                  </button>
                </div>
              )}
          </>
        ) : (
          <>
            {/* Trades Column Headers */}
            <div className="orderbook-column-headers">
              <span>Price ({quoteSymbol})</span>
              <span>Amount ({baseSymbol})</span>
              <span>Side</span>
              <span>Time</span>
            </div>

            {/* Recent Trades */}
            <div className="orderbook-trades">
              {data.lastTrades &&
                data.lastTrades.slice(0, 20).map((trade) => (
                  <div key={trade.id} className="orderbook-row trade">
                    <span className={`price ${trade.side}`}>
                      {formatPreciseNumber(parseFloat(trade.price), 6)}
                    </span>
                    <span className="amount">
                      {formatPreciseNumber(parseFloat(trade.amount), 4)}
                    </span>
                    <span className={`side ${trade.side}`}>
                      {trade.side.toUpperCase()}
                    </span>
                    <span className="time">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              {(!data.lastTrades || data.lastTrades.length === 0) && (
                <div className="orderbook-row trade">
                  <span className="no-trades">No recent trades</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Stats Footer */}
      {data.stats && (
        <div className="orderbook-stats">
          <div className="stat">
            <span className="stat-label">24h Volume</span>
            <span className="stat-value">
              {formatPreciseNumber(parseFloat(data.stats.volume24h || "0"), 2)}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">24h Change</span>
            <span
              className={`stat-value ${
                parseFloat(data.stats.priceChange24h || "0") >= 0
                  ? "positive"
                  : "negative"
              }`}
            >
              {parseFloat(data.stats.priceChange24h || "0") >= 0 ? "+" : ""}
              {formatPreciseNumber(
                parseFloat(data.stats.priceChange24h || "0"),
                2,
              )}
              %
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">24h High</span>
            <span className="stat-value">
              {formatPreciseNumber(parseFloat(data.stats.high24h || "0"), 6)}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">24h Low</span>
            <span className="stat-value">
              {formatPreciseNumber(parseFloat(data.stats.low24h || "0"), 6)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
