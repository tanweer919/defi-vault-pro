"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowUpDown, Settings, Target, AlertCircle } from "lucide-react";
import { useLimitOrders } from "@/lib/hooks/useLimitOrders";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import toast from "react-hot-toast";

// Common tokens with proper addresses (same as SwapInterface)
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

export const LimitOrderInterface: React.FC = () => {
  const [sellToken, setSellToken] = useState("");
  const [buyToken, setBuyToken] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [expiry, setExpiry] = useState("");

  const { isConnected, chainId } = useWalletState();
  const { isDemoMode } = useDemoMode();
  const { createLimitOrder, isLoading } = useLimitOrders();

  const availableTokens = TOKENS[chainId as keyof typeof TOKENS] || TOKENS[1];

  const handleCreateOrder = async () => {
    if (!isConnected && !isDemoMode) {
      toast.error("Please connect your wallet or enable demo mode");
      return;
    }

    if (!sellToken || !buyToken || !sellAmount || !buyAmount || !expiry) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (isDemoMode) {
        // Simulate order creation in demo mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Demo limit order created successfully!");
      } else {
        await createLimitOrder({
          sellToken,
          buyToken,
          sellAmount,
          buyAmount,
          expiry: new Date(expiry).getTime() / 1000,
        });
        toast.success("Limit order created successfully!");
      }

      // Reset form
      setSellAmount("");
      setBuyAmount("");
      setExpiry("");
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Failed to create limit order");
    }
  };

  const swapTokens = () => {
    const tempToken = sellToken;
    const tempAmount = sellAmount;
    setSellToken(buyToken);
    setBuyToken(tempToken);
    setSellAmount(buyAmount);
    setBuyAmount(tempAmount);
  };

  const isOrderDisabled =
    !sellToken ||
    !buyToken ||
    !sellAmount ||
    !buyAmount ||
    !expiry ||
    isLoading;

  return (
    <Card className="p-6" gradient>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Create Limit Order</h3>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Connection Status */}
      {!isConnected && !isDemoMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Connect your wallet or enable demo mode to create limit orders
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Order Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={orderType === "buy" ? "primary" : "ghost"}
            onClick={() => setOrderType("buy")}
            className="flex-1"
          >
            Buy
          </Button>
          <Button
            variant={orderType === "sell" ? "primary" : "ghost"}
            onClick={() => setOrderType("sell")}
            className="flex-1"
          >
            Sell
          </Button>
        </div>

        {/* Sell Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {orderType === "buy" ? "Pay with" : "Sell"}
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.0"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="text-right pr-3 pl-28"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <select
                value={sellToken}
                onChange={(e) => setSellToken(e.target.value)}
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

        {/* Buy Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {orderType === "buy" ? "Receive" : "For"}
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.0"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="text-right pr-3 pl-28"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <select
                value={buyToken}
                onChange={(e) => setBuyToken(e.target.value)}
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

        {/* Expiry */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <Input
            type="datetime-local"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Order Summary */}
        {sellAmount && buyAmount && sellToken && buyToken && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-gray-50 rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span>Order Type</span>
              <span className="capitalize">{orderType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Price</span>
              <span>
                {(parseFloat(sellAmount) / parseFloat(buyAmount)).toFixed(6)}{" "}
                {availableTokens.find((t) => t.address === sellToken)?.symbol}/
                {availableTokens.find((t) => t.address === buyToken)?.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span>
                {buyAmount}{" "}
                {availableTokens.find((t) => t.address === buyToken)?.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Expires</span>
              <span>
                {expiry ? new Date(expiry).toLocaleDateString() : "Not set"}
              </span>
            </div>
            {isDemoMode && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Mode</span>
                <span>Demo</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Create Order Button */}
        <Button
          onClick={handleCreateOrder}
          loading={isLoading}
          disabled={isOrderDisabled}
          className="w-full"
          size="lg"
        >
          <Target className="w-4 h-4 mr-2" />
          {isDemoMode ? "Create Demo Order" : "Create Limit Order"}
        </Button>
      </div>
    </Card>
  );
};
