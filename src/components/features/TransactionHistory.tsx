/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useChainId } from "wagmi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock } from "lucide-react";
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
  type: "swap" | "transfer" | "approve";
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  fromToken: {
    symbol: string;
    amount: string;
    logo?: string;
  };
  toToken: {
    symbol: string;
    amount: string;
    logo?: string;
  };
  status: "success" | "pending" | "failed";
  gasUsed: string;
  gasPrice: string;
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
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (address && chainId) {
      fetchTransactions();
    }
  }, [address, chainId, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await oneInchApi.getTransactionHistory(
        address!,
        chainId as ChainId,
        50,
      );

      // Process and format transactions
      const formattedTransactions: Transaction[] = response.result.map(
        (tx: any) => ({
          id: tx.hash,
          type: tx.input.includes("swap") ? "swap" : "transfer",
          hash: tx.hash,
          timestamp: parseInt(tx.timeStamp) * 1000,
          from: tx.from,
          to: tx.to,
          fromToken: {
            symbol: tx.fromToken?.symbol || "ETH",
            amount: tx.fromAmount || "0",
            logo: tx.fromToken?.logoURI,
          },
          toToken: {
            symbol: tx.toToken?.symbol || "Unknown",
            amount: tx.toAmount || "0",
            logo: tx.toToken?.logoURI,
          },
          status: tx.isError === "0" ? "success" : "failed",
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
        }),
      );

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
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesToken =
      tokenFilter === "all" ||
      tx.fromToken.symbol === tokenFilter ||
      tx.toToken.symbol === tokenFilter;

    const matchesDate =
      (!dateRange.from || tx.timestamp >= new Date(dateRange.from).getTime()) &&
      (!dateRange.to || tx.timestamp <= new Date(dateRange.to).getTime());

    return matchesSearch && matchesToken && matchesDate;
  });

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
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {filteredTransactions.length} transactions
              </h3>
              <Button variant="outline" size="sm" onClick={fetchTransactions}>
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {filteredTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTransactionIcon(tx.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium capitalize">
                            {tx.type}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              tx.status,
                            )}`}
                          >
                            {tx.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            {tx.fromToken.logo && (
                              <img
                                src={tx.fromToken.logo}
                                alt=""
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                            <span className="text-sm text-gray-600">
                              {parseFloat(tx.fromToken.amount).toFixed(4)}{" "}
                              {tx.fromToken.symbol}
                            </span>
                          </div>

                          <ArrowUpRight className="w-3 h-3 text-gray-400" />

                          <div className="flex items-center space-x-1">
                            {tx.toToken.logo && (
                              <img
                                src={tx.toToken.logo}
                                alt=""
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                            <span className="text-sm text-gray-600">
                              {parseFloat(tx.toToken.amount).toFixed(4)}{" "}
                              {tx.toToken.symbol}
                            </span>
                          </div>
                        </div>
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
                          {(
                            (parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice)) /
                            1e18
                          ).toFixed(6)}{" "}
                          ETH
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://etherscan.io/tx/${tx.hash}`,
                            "_blank",
                          )
                        }
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
                No transactions found matching your criteria
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
