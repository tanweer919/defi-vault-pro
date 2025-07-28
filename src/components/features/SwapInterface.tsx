"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowUpDown, Settings, Zap, AlertCircle } from "lucide-react";
import { useSwap } from "@/lib/hooks/useSwap";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import toast from "react-hot-toast";

// Common tokens with proper addresses
const TOKENS = {
  1: [
    // Ethereum
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      name: "Ethereum",
    },
    {
      address: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
      symbol: "USDC",
      name: "USD Coin",
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      name: "Tether USD",
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
    },
    {
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
    },
  ],
  137: [
    // Polygon
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "MATIC",
      name: "Polygon",
    },
    {
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      symbol: "USDC",
      name: "USD Coin",
    },
    {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      symbol: "USDT",
      name: "Tether USD",
    },
  ],
};

export const SwapInterface: React.FC = () => {
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const { isConnected, chainId } = useWalletState();
  const { isDemoMode } = useDemoMode();

  const { quote, isLoading, executeSwap, isSwapping, swapError } = useSwap({
    fromToken,
    toToken,
    amount,
    slippage,
  });

  const availableTokens = TOKENS[chainId as keyof typeof TOKENS] || TOKENS[1];

  const handleSwap = async () => {
    if (!isConnected && !isDemoMode) {
      toast.error("Please connect your wallet or enable demo mode");
      return;
    }

    if (!fromToken || !toToken || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (isDemoMode) {
        // Simulate swap in demo mode
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success("Demo swap executed successfully!");
        setAmount("");
      } else {
        await executeSwap();
        toast.success("Swap executed successfully!");
        setAmount("");
      }
    } catch (error) {
      toast.error("Swap failed. Please try again.");
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const isSwapDisabled =
    !fromToken || !toToken || !amount || isLoading || isSwapping;

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
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="border-none bg-transparent focus:outline-none text-sm font-medium w-20"
                >
                  <option value="">Select</option>
                  {availableTokens.map((token) => (
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
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              onClick={swapTokens}
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
                >
                  <option value="">Select</option>
                  {availableTokens.map((token) => (
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
                  1{" "}
                  {availableTokens.find((t) => t.address === fromToken)?.symbol}{" "}
                  = {quote.toAmount}{" "}
                  {availableTokens.find((t) => t.address === toToken)?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Slippage</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Network Fee</span>
                <span>{isDemoMode ? "~$0.50 (Demo)" : "~$5.23"}</span>
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
          >
            <Zap className="w-4 h-4 mr-2" />
            {isDemoMode ? "Demo Swap" : "Swap"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
