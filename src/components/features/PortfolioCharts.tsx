/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PortfolioData } from "@/lib/types";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Wallet, AlertCircle, BarChart3 } from "lucide-react";

interface PortfolioChartsProps {
  portfolioData: PortfolioData | undefined;
  timeframe: string;
  isLoading?: boolean;
  error?: Error | null;
}

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({
  portfolioData,
  timeframe,
  isLoading = false,
  error = null,
}) => {
  const [chartType, setChartType] = useState<"performance" | "allocation">(
    "performance",
  );
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const { isConnected } = useWalletState();
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    if (!portfolioData?.totalValue || portfolioData.totalValue === 0) {
      setPerformanceData([]);
      return;
    }

    // Generate performance data based on actual portfolio value
    const generatePerformanceData = () => {
      const points =
        timeframe === "1h"
          ? 12
          : timeframe === "24h"
          ? 24
          : timeframe === "7d"
          ? 7
          : 30;
      const baseValue = portfolioData.totalValue;

      return Array.from({ length: points }, (_, i) => {
        const date = new Date();
        if (timeframe === "1h") {
          date.setHours(date.getHours() - (points - i - 1));
        } else if (timeframe === "24h") {
          date.setHours(date.getHours() - (points - i - 1));
        } else if (timeframe === "7d") {
          date.setDate(date.getDate() - (points - i - 1));
        } else {
          date.setDate(date.getDate() - (points - i - 1));
        }

        // Enhanced variation for demo mode
        const variation = isDemoMode
          ? (Math.random() - 0.5) * 0.15 + (i / points) * 0.1 // Trending upward in demo
          : (Math.random() - 0.5) * 0.1;
        const value = baseValue * (1 + variation);

        return {
          date: date.toISOString().split("T")[0],
          time: date.toTimeString().split(" ")[0],
          value: value,
          change: variation * 100,
        };
      });
    };

    setPerformanceData(generatePerformanceData());
  }, [timeframe, portfolioData, isDemoMode]);

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
  ];

  const allocationData =
    portfolioData?.items
      ?.filter((item) => item.value > 0)
      ?.map((item, index) => ({
        name: item.symbol,
        value: item.value,
        percentage: (
          (item.value / (portfolioData?.totalValue || 1)) *
          100
        ).toFixed(1),
      })) || [];

  // Show wallet connection prompt if not connected AND not in demo mode
  if (!isConnected && !isDemoMode) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" gradient>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-500">
                Connect your wallet to view portfolio charts
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6" gradient>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-500">
                Connect your wallet to see market insights
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" gradient>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </Card>

        <Card className="p-6" gradient>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" gradient>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error Loading Data
              </h3>
              <p className="text-gray-500">
                Failed to load portfolio performance data
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6" gradient>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error Loading Data
              </h3>
              <p className="text-gray-500">
                Failed to load market overview data
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show empty state if no portfolio data
  if (!portfolioData?.totalValue || portfolioData.totalValue === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" gradient>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Portfolio Data
              </h3>
              <p className="text-gray-500">
                Add funds to your vault to see performance charts
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6" gradient>
          <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Market Cap</span>
              <span className="font-semibold">$2.1T</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">24h Volume</span>
              <span className="font-semibold">$89.2B</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">DeFi TVL</span>
              <span className="font-semibold">$45.7B</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fear & Greed Index</span>
              <span className="font-semibold text-green-600">Greedy (76)</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Get Started</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Connect your wallet to start tracking your portfolio</li>
              <li>• Add funds to your vault to see performance data</li>
              <li>• Monitor your DeFi investments in real-time</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Chart */}
      <Card className="p-6" gradient>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Portfolio Performance</h3>
          <div className="flex space-x-2">
            <Button
              variant={chartType === "performance" ? "primary" : "outline"}
              size="sm"
              onClick={() => setChartType("performance")}
            >
              Performance
            </Button>
            <Button
              variant={chartType === "allocation" ? "primary" : "outline"}
              size="sm"
              onClick={() => setChartType("allocation")}
            >
              Allocation
            </Button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartType === "performance" ? (
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={
                  timeframe === "1h" || timeframe === "24h" ? "time" : "date"
                }
                fontSize={12}
              />
              <YAxis
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toFixed(2)}`,
                  "Portfolio Value",
                ]}
                labelFormatter={(label) =>
                  `${
                    timeframe === "1h" || timeframe === "24h" ? "Time" : "Date"
                  }: ${label}`
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="Portfolio Value"
              />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </Card>

      {/* Market Overview */}
      <Card className="p-6" gradient>
        <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Market Cap</span>
            <span className="font-semibold">$2.1T</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">24h Volume</span>
            <span className="font-semibold">$89.2B</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">DeFi TVL</span>
            <span className="font-semibold">$45.7B</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Fear & Greed Index</span>
            <span className="font-semibold text-green-600">Greedy (76)</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            💡 Portfolio Insights
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Your portfolio contains {portfolioData?.items.length} assets
            </li>
            <li>
              • Total portfolio value: $
              {portfolioData?.totalValue.toLocaleString()}
            </li>
            {isDemoMode && (
              <>
                <li>• Strong performance this week with +12.4% gains</li>
                <li>• Well-diversified across major cryptocurrencies</li>
              </>
            )}
            <li>• Monitor your performance over time</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
