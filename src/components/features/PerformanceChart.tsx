/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
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
} from "recharts";
import { Wallet, AlertCircle, BarChart3 } from "lucide-react";

interface PerformanceChartProps {
  timeRange: string;
  portfolioData?: PortfolioData;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  timeRange,
  portfolioData,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useWalletState();
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    if (!portfolioData?.totalValue || portfolioData.totalValue === 0) {
      setData([]);
      setLoading(false);
      return;
    }

    // Generate performance data based on actual portfolio value
    const generateData = () => {
      const days =
        timeRange === "1d"
          ? 1
          : timeRange === "7d"
          ? 7
          : timeRange === "30d"
          ? 30
          : 90;
      const points = timeRange === "1d" ? 24 : days;
      const baseValue = portfolioData.totalValue;

      return Array.from({ length: points }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (points - i - 1));

        // Enhanced variation for demo mode
        const variation = isDemoMode
          ? (Math.random() - 0.5) * 0.15 + (i / points) * 0.08 // Trending upward in demo
          : (Math.random() - 0.5) * 0.1;

        return {
          date: date.toISOString().split("T")[0],
          value: baseValue + baseValue * variation,
          pnl: baseValue * variation,
        };
      });
    };

    setLoading(true);
    setTimeout(() => {
      setData(generateData());
      setLoading(false);
    }, 500);
  }, [timeRange, portfolioData, isDemoMode]);

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
              Connect your wallet to view performance data
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
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Performance Data
            </h3>
            <p className="text-gray-500">
              Add funds to your vault to see performance charts
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" gradient>
      <h3 className="text-xl font-semibold mb-4">Portfolio Performance</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Portfolio Value"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};
