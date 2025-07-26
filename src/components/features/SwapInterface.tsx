"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowUpDown, Settings, Zap } from "lucide-react";
import { useSwap } from "@/lib/hooks/useSwap";
import toast from "react-hot-toast";

export const SwapInterface: React.FC = () => {
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1);

  const { quote, isLoading, executeSwap } = useSwap({
    fromToken,
    toToken,
    amount,
    slippage,
  });

  const handleSwap = async () => {
    try {
      await executeSwap();
      toast.success("Swap executed successfully!");
    } catch (error) {
      toast.error("Swap failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6" gradient>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Swap Tokens</h2>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

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
                className="text-right"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="border-none bg-transparent focus:outline-none"
                >
                  <option value="">Select token</option>
                  <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                    ETH
                  </option>
                  <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                    USDC
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
                setFromToken(toToken);
                setToToken(fromToken);
              }}
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
                className="text-right bg-gray-50"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="border-none bg-transparent focus:outline-none"
                >
                  <option value="">Select token</option>
                  <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                    ETH
                  </option>
                  <option value="0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF">
                    USDC
                  </option>
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
                  1 {quote.fromToken.symbol} = {quote.toAmount}{" "}
                  {quote.toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Slippage</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Network Fee</span>
                <span>~$5.23</span>
              </div>
            </motion.div>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            loading={isLoading}
            disabled={!fromToken || !toToken || !amount}
            className="w-full"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            Swap
          </Button>
        </div>
      </Card>
    </div>
  );
};
