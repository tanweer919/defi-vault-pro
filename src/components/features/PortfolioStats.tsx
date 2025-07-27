"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { PortfolioData } from "@/lib/types";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Coins,
  Target,
  Activity,
  Wallet,
  AlertCircle,
} from "lucide-react";

interface PortfolioStatsProps {
  portfolioData: PortfolioData | undefined;
  timeframe: string;
  isLoading?: boolean;
  error?: Error | null;
}

export const PortfolioStats: React.FC<PortfolioStatsProps> = ({
  portfolioData,
  timeframe,
  isLoading = false,
  error = null,
}) => {
  const { isConnected, isConnecting } = useWalletState();
  const { isDemoMode } = useDemoMode();

  // Show wallet connection prompt if not connected AND not in demo mode
  if (!isConnected && !isDemoMode) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6" gradient>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <Wallet className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Connect Wallet</p>
                <p className="text-2xl font-bold text-gray-400">--</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  // Show loading state
  if (isLoading || isConnecting) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6" gradient>
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gray-200 w-12 h-12"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6" gradient>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-red-100">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Error Loading</p>
                <p className="text-2xl font-bold text-red-500">--</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  // Show real data or demo data
  const totalValue = portfolioData?.totalValue || 0;
  const assetCount = portfolioData?.items?.length || 0;
  const bestPerformer = portfolioData?.items?.[0]?.symbol || "N/A";

  // Enhanced demo analytics for stats
  const getDemoStats = () => {
    if (!isDemoMode) return null;
    return {
      change24h: 12.4,
      pnl: 1283.45,
      pnlPercent: 4.7,
      bestPerformerChange: 18.3,
    };
  };

  const demoStats = getDemoStats();

  const stats = [
    {
      title: "Total Value",
      value: totalValue > 0 ? `$${totalValue.toLocaleString()}` : "$0.00",
      change:
        isDemoMode && demoStats
          ? `+${demoStats.change24h}%`
          : totalValue > 0
          ? "+0.0%"
          : "--",
      changeType: (isDemoMode && demoStats ? "positive" : "neutral") as
        | "positive"
        | "negative"
        | "neutral",
      icon: DollarSign,
      color: "blue",
    },
    {
      title: "Total Assets",
      value: assetCount,
      change: assetCount > 0 ? `${assetCount} tokens` : "No assets",
      changeType: "neutral" as "positive" | "negative" | "neutral",
      icon: Coins,
      color: "green",
    },
    {
      title: `${timeframe} P&L`,
      value:
        isDemoMode && demoStats
          ? `+$${demoStats.pnl.toLocaleString()}`
          : totalValue > 0
          ? "$0.00"
          : "--",
      change:
        isDemoMode && demoStats
          ? `+${demoStats.pnlPercent}%`
          : totalValue > 0
          ? "0.0%"
          : "--",
      changeType: (isDemoMode && demoStats ? "positive" : "neutral") as
        | "positive"
        | "negative"
        | "neutral",
      icon: TrendingUp,
      color: "purple",
    },
    {
      title: "Best Performer",
      value: bestPerformer,
      change:
        isDemoMode && demoStats
          ? `+${demoStats.bestPerformerChange}%`
          : totalValue > 0
          ? "0.0%"
          : "--",
      changeType: (isDemoMode && demoStats ? "positive" : "neutral") as
        | "positive"
        | "negative"
        | "neutral",
      icon: Target,
      color: "yellow",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      purple: "text-purple-600 bg-purple-100",
      yellow: "text-yellow-600 bg-yellow-100",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            className="p-6 hover:shadow-md transition-shadow"
            gradient
            hover
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.change !== "--" && (
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : stat.changeType === "negative" ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : null}
                  <span>{stat.change}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
