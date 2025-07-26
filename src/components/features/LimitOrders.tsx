"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowUpDown, Settings, Target } from "lucide-react";
import { useLimitOrders } from "@/lib/hooks/useLimitOrders";
import toast from "react-hot-toast";

export const LimitOrderInterface: React.FC = () => {
  const [sellToken, setSellToken] = useState("");
  const [buyToken, setBuyToken] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [expiry, setExpiry] = useState("");

  const { createLimitOrder, isLoading } = useLimitOrders();

  const handleCreateOrder = async () => {
    try {
      await createLimitOrder({
        sellToken,
        buyToken,
        sellAmount,
        buyAmount,
        expiry: new Date(expiry).getTime() / 1000,
      });
      toast.success("Limit order created successfully!");
      // Reset form
      setSellAmount("");
      setBuyAmount("");
    } catch (error) {
      toast.error("Failed to create limit order");
    }
  };

  return (
    <Card className="p-6" gradient>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Create Limit Order</h3>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

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
              className="text-right"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <select
                value={sellToken}
                onChange={(e) => setSellToken(e.target.value)}
                className="border-none bg-transparent focus:outline-none"
              >
                <option value="">Select token</option>
                <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                  ETH
                </option>
                <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                  USDC
                </option>
                <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                  WBTC
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ rotate: 180 }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              setSellToken(buyToken);
              setBuyToken(sellToken);
              setSellAmount(buyAmount);
              setBuyAmount(sellAmount);
            }}
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
              className="text-right"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <select
                value={buyToken}
                onChange={(e) => setBuyToken(e.target.value)}
                className="border-none bg-transparent focus:outline-none"
              >
                <option value="">Select token</option>
                <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                  ETH
                </option>
                <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                  USDC
                </option>
                <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                  WBTC
                </option>
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
        {sellAmount && buyAmount && (
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
                {sellToken}/{buyToken}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span>
                {buyAmount} {buyToken}
              </span>
            </div>
          </motion.div>
        )}

        {/* Create Order Button */}
        <Button
          onClick={handleCreateOrder}
          loading={isLoading}
          disabled={
            !sellToken || !buyToken || !sellAmount || !buyAmount || !expiry
          }
          className="w-full"
          size="lg"
        >
          <Target className="w-4 h-4 mr-2" />
          Create Limit Order
        </Button>
      </div>
    </Card>
  );
};
