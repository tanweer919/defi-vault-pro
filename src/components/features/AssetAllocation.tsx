"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TokenImage } from "@/components/ui/TokenImage";
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  PieChart,
  BarChart3,
  Target,
  Zap,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/asset-allocation.css";

interface AssetAllocationData {
  address: string;
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  balance: string;
  price: number;
  logo?: string;
  change24h?: number;
  targetPercentage?: number;
  deviation?: number;
  risk?: "low" | "medium" | "high";
}

interface RebalanceAction {
  type: "buy" | "sell";
  symbol: string;
  amount: number;
  usdValue: number;
  reason: string;
}

// Color palette for assets
const getAssetColor = (index: number) => {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-orange-500 to-orange-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
    "from-yellow-500 to-yellow-600",
    "from-red-500 to-red-600",
  ];
  return colors[index % colors.length];
};

// Helper function to get gradient colors
const getGradientColors = (index: number) => {
  const colors = [
    { from: "#3B82F6", to: "#1D4ED8" }, // blue
    { from: "#10B981", to: "#047857" }, // green
    { from: "#F59E0B", to: "#D97706" }, // orange
    { from: "#8B5CF6", to: "#7C3AED" }, // purple
    { from: "#EC4899", to: "#DB2777" }, // pink
    { from: "#6366F1", to: "#4F46E5" }, // indigo
    { from: "#EAB308", to: "#CA8A04" }, // yellow
    { from: "#EF4444", to: "#DC2626" }, // red
  ];
  return colors[index % colors.length];
};

export const AssetAllocation: React.FC = () => {
  const [viewType, setViewType] = useState<"pie" | "donut" | "bar">("donut");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const { portfolioData, isLoading, error } = usePortfolio();

  // Fixed target allocation to satisfy ESLint
  const targetAllocationFixed = useMemo(
    () => ({
      ETH: 40,
      USDC: 30,
      WBTC: 20,
      LINK: 10,
    }),
    [],
  );

  // Process portfolio data into allocation format
  const allocationData: AssetAllocationData[] = useMemo(() => {
    if (!portfolioData?.items || portfolioData.items.length === 0) {
      return [];
    }

    const totalValue = portfolioData.totalValue;

    return portfolioData.items
      .filter((item) => item.value > 0)
      .map((item) => {
        const percentage = (item.value / totalValue) * 100;
        const targetPercentage =
          targetAllocationFixed[
            item.symbol as keyof typeof targetAllocationFixed
          ] || 0;
        const deviation = targetPercentage
          ? Math.abs(percentage - targetPercentage)
          : 0;

        // Simple risk assessment based on volatility (mock data for now)
        const risk: "low" | "medium" | "high" =
          item.symbol === "USDC"
            ? "low"
            : item.symbol === "ETH"
            ? "medium"
            : "high";

        return {
          address: item.address,
          symbol: item.symbol,
          name: item.name,
          value: item.value,
          percentage,
          balance: item.balance,
          price: item.price,
          logo: item.logo,
          change24h: item.change24h || 0,
          targetPercentage,
          deviation,
          risk,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [portfolioData, targetAllocationFixed]);

  // Calculate rebalancing suggestions
  const rebalanceActions: RebalanceAction[] = useMemo(() => {
    if (!allocationData.length) return [];

    const actions: RebalanceAction[] = [];
    const totalValue = portfolioData?.totalValue || 0;

    allocationData.forEach((asset) => {
      if (asset.targetPercentage && asset.deviation > 5) {
        // 5% threshold
        const targetValue = (asset.targetPercentage / 100) * totalValue;
        const difference = targetValue - asset.value;

        if (Math.abs(difference) > 100) {
          // Only suggest if difference > $100
          actions.push({
            type: difference > 0 ? "buy" : "sell",
            symbol: asset.symbol,
            amount: Math.abs(difference) / asset.price,
            usdValue: Math.abs(difference),
            reason:
              difference > 0
                ? `Underweight by ${asset.deviation.toFixed(1)}%`
                : `Overweight by ${asset.deviation.toFixed(1)}%`,
          });
        }
      }
    });

    return actions.slice(0, 5); // Limit to top 5 suggestions
  }, [allocationData, portfolioData]);

  // Color palette for assets
  const getAssetColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-yellow-500 to-yellow-600",
      "from-red-500 to-red-600",
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !allocationData.length) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
        <p className="text-gray-600 mb-4">
          {error
            ? "Failed to load portfolio data"
            : "Connect your wallet or add some assets to see allocation"}
        </p>
        <Button className="mx-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Assets
        </Button>
      </Card>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Asset Allocation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track and optimize your portfolio distribution
          </p>
        </motion.div>

        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant={viewType === "donut" ? "primary" : "outline"}
            onClick={() => setViewType("donut")}
            size="sm"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Donut
          </Button>
          <Button
            variant={viewType === "bar" ? "primary" : "outline"}
            onClick={() => setViewType("bar")}
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Bars
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="xl:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Portfolio Distribution</h3>
              <div className="text-right">
                <motion.div
                  className="text-2xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  $
                  {portfolioData?.totalValue.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </motion.div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Chart */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {viewType === "donut" ? (
                  <DonutChart data={allocationData} />
                ) : (
                  <BarChart data={allocationData} />
                )}
              </motion.div>

              {/* Legend */}
              <div className="flex-1 space-y-3 min-w-0">
                <AnimatePresence>
                  {allocationData.map((asset, index) => (
                    <motion.div
                      key={asset.address}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() =>
                        setSelectedAsset(
                          selectedAsset === asset.address
                            ? null
                            : asset.address,
                        )
                      }
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="flex items-center space-x-2">
                          <motion.div
                            className={`w-4 h-4 rounded-full bg-gradient-to-r ${getAssetColor(
                              index,
                            )}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.8 + index * 0.1,
                              type: "spring",
                            }}
                          />
                          {asset.logo && (
                            <TokenImage
                              src={asset.logo}
                              alt={asset.symbol}
                              symbol={asset.symbol}
                              className="w-6 h-6"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {asset.symbol}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {asset.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold">
                          $
                          {asset.value.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {asset.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats and Actions */}
        <div className="space-y-6">
          {/* Allocation Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Allocation Stats</h3>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span>Diversification Score</span>
                    <span className="font-medium">
                      {allocationData.length > 3 ? "Good" : "Needs Improvement"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        allocationData.length > 3
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      } progress-bar`}
                      style={
                        {
                          "--diversification-width": `${Math.min(
                            (allocationData.length / 5) * 100,
                            100,
                          )}%`,
                          width: `${Math.min(
                            (allocationData.length / 5) * 100,
                            100,
                          )}%`,
                        } as React.CSSProperties
                      }
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          (allocationData.length / 5) * 100,
                          100,
                        )}%`,
                      }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span>Risk Level</span>
                    <span className="font-medium">Medium</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-yellow-500 progress-bar-risk"
                      initial={{ width: 0 }}
                      animate={{ width: "60%" }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="pt-4 border-t"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="text-sm text-gray-600 mb-2">Top Holdings</div>
                  {allocationData.slice(0, 3).map((asset, index) => (
                    <motion.div
                      key={asset.address}
                      className="flex justify-between text-sm mb-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                    >
                      <span>{asset.symbol}</span>
                      <span>{asset.percentage.toFixed(1)}%</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Rebalancing
              </h3>

              {rebalanceActions.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">
                    Suggested adjustments to reach target allocation:
                  </div>
                  {rebalanceActions.slice(0, 3).map((action, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.9 + index * 0.1,
                            type: "spring",
                          }}
                        >
                          {action.type === "buy" ? (
                            <Plus className="w-4 h-4 text-green-500" />
                          ) : (
                            <Minus className="w-4 h-4 text-red-500" />
                          )}
                        </motion.div>
                        <div>
                          <div className="font-medium text-sm">
                            {action.type === "buy" ? "Buy" : "Sell"}{" "}
                            {action.symbol}
                          </div>
                          <div className="text-xs text-gray-600">
                            {action.reason}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">
                          $
                          {action.usdValue.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <Button className="w-full mt-4" size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Auto-Rebalance Portfolio
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  className="text-center py-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-green-600">
                    Well Balanced!
                  </div>
                  <div className="text-xs text-gray-600">
                    Your portfolio is within target ranges
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Donut Chart Component
const DonutChart: React.FC<{ data: AssetAllocationData[] }> = ({ data }) => {
  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercentage = 0;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(229, 231, 235)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {data.map((asset, index) => {
          const strokeDasharray = `${
            (asset.percentage / 100) * circumference
          } ${circumference}`;
          const strokeDashoffset =
            (-cumulativePercentage * circumference) / 100;
          cumulativePercentage += asset.percentage;

          return (
            <circle
              key={asset.address}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#gradient-${index})`}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 hover:stroke-opacity-80"
            />
          );
        })}

        {/* Gradients */}
        <defs>
          {data.map((_, index) => (
            <linearGradient
              key={index}
              id={`gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={getGradientColors(index).from} />
              <stop offset="100%" stopColor={getGradientColors(index).to} />
            </linearGradient>
          ))}
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{data.length}</div>
          <div className="text-sm text-gray-600">Assets</div>
        </div>
      </div>
    </div>
  );
};

// Bar Chart Component
const BarChart: React.FC<{ data: AssetAllocationData[] }> = ({ data }) => {
  const maxPercentage = Math.max(...data.map((d) => d.percentage));

  return (
    <div className="w-full max-w-md space-y-3">
      {data.map((asset, index) => (
        <div key={asset.address} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{asset.symbol}</span>
            <span>{asset.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${getAssetColor(
                index,
              )} transition-all duration-500 chart-bar`}
              style={
                {
                  "--bar-width": `${(asset.percentage / maxPercentage) * 100}%`,
                  width: `${(asset.percentage / maxPercentage) * 100}%`,
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};
