"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Coins, TrendingUp, Calendar, Star } from "lucide-react";

interface YieldPool {
  id: string;
  protocol: string;
  name: string;
  apy: number;
  tvl: number;
  rewards: string[];
  deposited: number;
  earned: number;
  logo: string;
  risk: "low" | "medium" | "high";
}

export const YieldTracker: React.FC = () => {
  const [pools, setPools] = useState<YieldPool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPools([
        {
          id: "1",
          protocol: "Uniswap V3",
          name: "ETH/USDC",
          apy: 12.4,
          tvl: 2340000,
          rewards: ["UNI", "USDC"],
          deposited: 5000,
          earned: 183.5,
          logo: "/logos/uniswap.png",
          risk: "medium",
        },
        {
          id: "2",
          protocol: "Compound",
          name: "USDC Lending",
          apy: 4.2,
          tvl: 8900000,
          rewards: ["COMP"],
          deposited: 10000,
          earned: 420,
          logo: "/logos/compound.png",
          risk: "low",
        },
        {
          id: "3",
          protocol: "Aave",
          name: "ETH Lending",
          apy: 1.8,
          tvl: 15600000,
          rewards: ["AAVE"],
          deposited: 3000,
          earned: 54,
          logo: "/logos/aave.png",
          risk: "low",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const totalDeposited = pools.reduce((sum, pool) => sum + pool.deposited, 0);
  const totalEarned = pools.reduce((sum, pool) => sum + pool.earned, 0);
  const avgApy = pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length;

  return (
    <Card className="p-6" gradient>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Yield Farming</h3>
        <Button variant="outline" size="sm">
          <TrendingUp className="w-4 h-4 mr-2" />
          Discover Pools
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Deposited</p>
          <p className="text-lg font-bold">
            ${totalDeposited.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Earned</p>
          <p className="text-lg font-bold text-green-600">
            ${totalEarned.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Avg APY</p>
          <p className="text-lg font-bold text-blue-600">
            {avgApy.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Pool List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          pools.map((pool, index) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Coins className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{pool.name}</h4>
                    <p className="text-sm text-gray-600">{pool.protocol}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getRiskColor(
                      pool.risk,
                    )}`}
                  >
                    {pool.risk}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {pool.apy}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Deposited</p>
                  <p className="font-medium">
                    ${pool.deposited.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Earned</p>
                  <p className="font-medium text-green-600">
                    ${pool.earned.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rewards:</span>
                  <div className="flex space-x-1">
                    {pool.rewards.map((reward, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-gray-100 rounded"
                      >
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Withdraw
                  </Button>
                  <Button variant="primary" size="sm">
                    Deposit
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
};
