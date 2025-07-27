"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PortfolioData } from "@/lib/types";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import {
  Coins,
  TrendingUp,
  Calendar,
  Star,
  Wallet,
  AlertCircle,
} from "lucide-react";

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

interface YieldTrackerProps {
  portfolioData?: PortfolioData;
}

export const YieldTracker: React.FC<YieldTrackerProps> = ({
  portfolioData,
}) => {
  const [pools, setPools] = useState<YieldPool[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useWalletState();
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    if (!portfolioData?.totalValue || portfolioData.totalValue === 0) {
      setPools([]);
      setLoading(false);
      return;
    }

    // Simulate API call with real portfolio data
    setTimeout(() => {
      setPools([
        {
          id: "1",
          protocol: "Uniswap V3",
          name: "ETH/USDC",
          apy: 12.4,
          tvl: 2340000,
          rewards: ["UNI", "USDC"],
          deposited: portfolioData.totalValue * 0.3, // 30% of portfolio
          earned: portfolioData.totalValue * 0.01, // 1% earned
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
          deposited: portfolioData.totalValue * 0.5, // 50% of portfolio
          earned: portfolioData.totalValue * 0.005, // 0.5% earned
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
          deposited: portfolioData.totalValue * 0.2, // 20% of portfolio
          earned: portfolioData.totalValue * 0.002, // 0.2% earned
          logo: "/logos/aave.png",
          risk: "low",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [portfolioData]);

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

  // Show wallet connection prompt if not connected AND not in demo mode
  if (!isConnected && !isDemoMode) {
    return (
      <Card className="p-6" gradient>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-500">
              Connect your wallet to view yield farming data
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Show empty state if no portfolio data
  if (!portfolioData?.totalValue || portfolioData.totalValue === 0) {
    return (
      <Card className="p-6" gradient>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Yield Data
            </h3>
            <p className="text-gray-500">
              Add funds to your vault to see yield farming opportunities
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const totalDeposited = pools.reduce((sum, pool) => sum + pool.deposited, 0);
  const totalEarned = pools.reduce((sum, pool) => sum + pool.earned, 0);
  const avgApy =
    pools.length > 0
      ? pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length
      : 0;

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
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
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
