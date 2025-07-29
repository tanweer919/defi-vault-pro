/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useChainId } from "wagmi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TokenImage } from "@/components/ui/TokenImage";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Clock,
  Filter,
  Search,
  TrendingUp,
} from "lucide-react";
import oneInchApi from "@/lib/api/oneInchApi";
import { formatDistanceToNow } from "date-fns";
import { ChainId } from "@/lib/config/wagmi";

interface TransactionHistoryProps {
  searchTerm: string;
  dateRange: { from: string; to: string };
  tokenFilter: string;
}

interface Transaction {
  id: string;
  type:
    | "swap"
    | "transfer"
    | "approve"
    | "deposit"
    | "withdrawal"
    | "mint"
    | "burn";
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  fromToken: {
    symbol: string;
    amount: string;
    logo?: string;
    address?: string;
    name?: string;
    decimals?: number;
  };
  toToken: {
    symbol: string;
    amount: string;
    logo?: string;
    address?: string;
    name?: string;
    decimals?: number;
  };
  status: "success" | "pending" | "failed";
  gasUsed: string;
  gasPrice: string;
  protocol?: string;
  priceImpact?: string;
  slippage?: string;
  gasCostEth?: string;
  blockNumber?: string;
  eventType?: string;
  description?: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  searchTerm,
  dateRange,
  tokenFilter,
}) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "swaps" | "transfers">(
    "all",
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [protocolFilter, setProtocolFilter] = useState<string>("all");

  useEffect(() => {
    if (address && chainId) {
      fetchTransactions();
    }
  }, [address, chainId, viewMode]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let response;

      if (viewMode === "swaps") {
        // Use dedicated swap endpoint for better swap data
        response = await fetch(
          `/api/transactions/${chainId}/${address}/swaps`,
          {
            method: "GET",
          },
        );
      } else {
        // Use general transaction endpoint
        response = await oneInchApi.getTransactionHistory(
          address!,
          chainId as ChainId,
          50,
        );
      }

      const data = viewMode === "swaps" ? await response.json() : response;
      const result = viewMode === "swaps" ? data.result : data.result;

      // Process and format transactions with enhanced 1inch data
      const formattedTransactions: Transaction[] = result.map((tx: any) => ({
        id: tx.hash,
        type: tx.input || tx.eventType || "transfer",
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp) * 1000,
        from: tx.from,
        to: tx.to,
        fromToken: {
          symbol: tx.fromToken?.symbol || "ETH",
          amount: tx.fromAmount || "0",
          logo: tx.fromToken?.logoURI,
          address: tx.fromToken?.address,
          name: tx.fromToken?.name,
          decimals: tx.fromToken?.decimals,
        },
        toToken: {
          symbol: tx.toToken?.symbol || "Unknown",
          amount: tx.toAmount || "0",
          logo: tx.toToken?.logoURI,
          address: tx.toToken?.address,
          name: tx.toToken?.name,
          decimals: tx.toToken?.decimals,
        },
        status: tx.isError === "0" ? "success" : "failed",
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        protocol: tx.protocol,
        priceImpact: tx.priceImpact,
        slippage: tx.slippage,
        gasCostEth: tx.gasCostEth,
        blockNumber: tx.blockNumber,
        eventType: tx.eventType,
        description: tx.description || tx.functionName,
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      searchTerm === "" ||
      tx.fromToken.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toToken.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.protocol?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesToken =
      tokenFilter === "all" ||
      tx.fromToken.symbol === tokenFilter ||
      tx.toToken.symbol === tokenFilter;

    const matchesDate =
      (!dateRange.from || tx.timestamp >= new Date(dateRange.from).getTime()) &&
      (!dateRange.to || tx.timestamp <= new Date(dateRange.to).getTime());

    const matchesProtocol =
      protocolFilter === "all" || tx.protocol === protocolFilter;

    const matchesViewMode =
      viewMode === "all" ||
      (viewMode === "swaps" && tx.type === "swap") ||
      (viewMode === "transfers" && tx.type === "transfer");

    return (
      matchesSearch &&
      matchesToken &&
      matchesDate &&
      matchesProtocol &&
      matchesViewMode
    );
  });

  // Get unique protocols for filter dropdown
  const availableProtocols = Array.from(
    new Set(transactions.map((tx) => tx.protocol).filter(Boolean)),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "swap":
        return <ArrowUpRight className="w-4 h-4" />;
      case "transfer":
        return <ArrowDownLeft className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6" gradient>
      <div className="space-y-4">
        {/* Header with view mode toggles */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <span className="text-sm text-gray-500">
              ({filteredTransactions.length} found)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["all", "swaps", "transfers"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === mode
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Protocol Filter */}
            {availableProtocols.length > 0 && (
              <select
                value={protocolFilter}
                onChange={(e) => setProtocolFilter(e.target.value)}
                className="text-xs border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">All Protocols</option>
                {availableProtocols.map((protocol) => (
                  <option key={protocol} value={protocol}>
                    {protocol}
                  </option>
                ))}
              </select>
            )}

            <Button variant="outline" size="sm" onClick={fetchTransactions}>
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {filteredTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          tx.type === "swap"
                            ? "bg-blue-100"
                            : tx.type === "transfer"
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {getTransactionIcon(tx.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium capitalize">
                            {tx.type}
                          </span>
                          {tx.protocol && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                              {tx.protocol}
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              tx.status,
                            )}`}
                          >
                            {tx.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex items-center space-x-1">
                            {tx.fromToken.logo && (
                              <TokenImage
                                src={tx.fromToken.logo}
                                alt={tx.fromToken.symbol}
                                symbol={tx.fromToken.symbol}
                                size={16}
                              />
                            )}
                            <span className="text-sm text-gray-900 font-medium">
                              {parseFloat(tx.fromToken.amount).toFixed(4)}{" "}
                              {tx.fromToken.symbol}
                            </span>
                          </div>

                          <ArrowUpRight className="w-3 h-3 text-gray-400" />

                          <div className="flex items-center space-x-1">
                            {tx.toToken.logo && (
                              <TokenImage
                                src={tx.toToken.logo}
                                alt={tx.toToken.symbol}
                                symbol={tx.toToken.symbol}
                                size={16}
                              />
                            )}
                            <span className="text-sm text-gray-900 font-medium">
                              {parseFloat(tx.toToken.amount).toFixed(4)}{" "}
                              {tx.toToken.symbol}
                            </span>
                          </div>
                        </div>

                        {/* Enhanced details for swaps */}
                        {tx.type === "swap" &&
                          (tx.priceImpact || tx.slippage) && (
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              {tx.priceImpact && (
                                <span>Impact: {tx.priceImpact}</span>
                              )}
                              {tx.slippage && (
                                <span>Slippage: {tx.slippage}</span>
                              )}
                            </div>
                          )}

                        {tx.description && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {tx.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(tx.timestamp, {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          Gas:{" "}
                          {tx.gasCostEth
                            ? `${tx.gasCostEth} ETH`
                            : `${(
                                (parseFloat(tx.gasUsed) *
                                  parseFloat(tx.gasPrice)) /
                                1e18
                              ).toFixed(6)} ETH`}
                        </div>
                        {tx.blockNumber && (
                          <div className="text-xs text-gray-400">
                            Block #{tx.blockNumber}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const explorerUrl =
                            chainId === 1
                              ? `https://etherscan.io/tx/${tx.hash}`
                              : chainId === 137
                              ? `https://polygonscan.com/tx/${tx.hash}`
                              : chainId === 56
                              ? `https://bscscan.com/tx/${tx.hash}`
                              : `https://etherscan.io/tx/${tx.hash}`;
                          window.open(explorerUrl, "_blank");
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {transactions.length === 0
                  ? "No transactions found for this address"
                  : "No transactions found matching your criteria"}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
