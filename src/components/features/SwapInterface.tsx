"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowUpDown,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useSwap } from "@/lib/hooks/useSwap";
import { useTokens } from "@/lib/hooks/useTokens";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import toast from "react-hot-toast";

export const SwapInterface: React.FC = () => {
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [swapStatus, setSwapStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const { isConnected, chainId } = useWalletState();
  const { isDemoMode } = useDemoMode();
  const { tokens: availableTokens, isLoading: tokensLoading } = useTokens();
  const tokens = availableTokens as Array<{
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  }>;

  // Ensure we always have tokens to display
  const displayTokens =
    tokens.length > 0
      ? tokens
      : [
          {
            address: "0x0000000000000000000000000000000000000000",
            symbol: "ETH",
            name: "Ethereum",
            decimals: 18,
          },
          {
            address: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
          },
          {
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            symbol: "USDT",
            name: "Tether USD",
            decimals: 6,
          },
        ];

  const { quote, isLoading, executeSwap, isSwapping, swapError, swapResult } =
    useSwap({
      fromToken,
      toToken,
      amount,
      slippage,
    });

  // Handle swap result
  useEffect(() => {
    if (swapResult) {
      setSwapStatus("success");
      toast.success(
        `Swap successful! Transaction: ${swapResult.hash.slice(0, 10)}...`,
      );
      setAmount("");
      // Reset status after 3 seconds
      setTimeout(() => setSwapStatus("idle"), 3000);
    }
  }, [swapResult]);

  // Handle swap error
  useEffect(() => {
    if (swapError) {
      setSwapStatus("error");
      toast.error(`Swap failed: ${swapError.message}`);
      // Reset status after 3 seconds
      setTimeout(() => setSwapStatus("idle"), 3000);
    }
  }, [swapError]);

  const handleSwap = async () => {
    if (!isConnected && !isDemoMode) {
      toast.error("Please connect your wallet or enable demo mode");
      return;
    }

    if (!fromToken || !toToken || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    if (fromToken === toToken) {
      toast.error("Cannot swap the same token");
      return;
    }

    try {
      setSwapStatus("pending");

      if (isDemoMode) {
        // Simulate swap in demo mode
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success("Demo swap executed successfully!");
        setAmount("");
        setSwapStatus("success");
        setTimeout(() => setSwapStatus("idle"), 3000);
      } else {
        await executeSwap();
      }
    } catch (error) {
      console.error("Swap error:", error);
      setSwapStatus("error");
      toast.error("Swap failed. Please try again.");
      setTimeout(() => setSwapStatus("idle"), 3000);
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const isSwapDisabled =
    !fromToken ||
    !toToken ||
    !amount ||
    isLoading ||
    isSwapping ||
    swapStatus === "pending";

  const getSwapButtonText = () => {
    if (swapStatus === "pending") return "Swapping...";
    if (swapStatus === "success") return "Swap Successful!";
    if (swapStatus === "error") return "Swap Failed";
    if (isDemoMode) return "Demo Swap";
    return "Swap";
  };

  const getSwapButtonIcon = () => {
    if (swapStatus === "success")
      return <CheckCircle className="w-4 h-4 mr-2" />;
    if (swapStatus === "error") return <XCircle className="w-4 h-4 mr-2" />;
    return <Zap className="w-4 h-4 mr-2" />;
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6" gradient>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Swap Tokens</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-gray-50 rounded-lg"
          >
            <h3 className="text-sm font-medium mb-2">Swap Settings</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-600">
                Slippage Tolerance (%)
              </label>
              <div className="flex space-x-2">
                {[0.5, 1, 2, 3].map((val) => (
                  <Button
                    key={val}
                    variant={slippage === val ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSlippage(val)}
                  >
                    {val}%
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Connection Status */}
        {!isConnected && !isDemoMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Connect your wallet or enable demo mode to swap tokens
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">From</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right pr-3 pl-28"
                disabled={isSwapping}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="border-none bg-transparent focus:outline-none text-sm font-medium w-20"
                  disabled={isSwapping || tokensLoading}
                >
                  <option value="">
                    {tokensLoading ? "Loading..." : "Select"}
                  </option>
                  {displayTokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Swap Direction */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ rotate: 180 }}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              onClick={swapTokens}
              disabled={isSwapping}
            >
              <ArrowUpDown className="w-4 h-4" />
            </motion.button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">To</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.0"
                value={quote?.toAmount || ""}
                readOnly
                className="text-right bg-gray-50 pr-3 pl-28"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="border-none bg-transparent focus:outline-none text-sm font-medium w-20"
                  disabled={isSwapping || tokensLoading}
                >
                  <option value="">
                    {tokensLoading ? "Loading..." : "Select"}
                  </option>
                  {displayTokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Swap Details */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gray-50 rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span>Rate</span>
                <span>
                  1 {displayTokens.find((t) => t.address === fromToken)?.symbol}{" "}
                  = {quote.toAmount}{" "}
                  {displayTokens.find((t) => t.address === toToken)?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Slippage</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price Impact</span>
                <span>{quote.priceImpact?.toFixed(2) || "0.00"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Gas</span>
                <span>{quote.estimatedGas || "~150,000"}</span>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {swapError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                {swapError.message || "An error occurred during the swap"}
              </p>
            </div>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            loading={isLoading || isSwapping}
            disabled={isSwapDisabled}
            className="w-full"
            size="lg"
            variant={swapStatus === "error" ? "danger" : "primary"}
          >
            {getSwapButtonIcon()}
            {getSwapButtonText()}
          </Button>
        </div>
      </Card>
    </div>
  );
};
