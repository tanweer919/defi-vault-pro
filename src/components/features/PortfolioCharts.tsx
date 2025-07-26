/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PortfolioData } from "@/lib/types";
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

interface PortfolioChartsProps {
  portfolioData: PortfolioData | undefined;
  timeframe: string;
}

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({
  portfolioData,
  timeframe,
}) => {
  const [chartType, setChartType] = useState<"performance" | "allocation">(
    "performance",
  );
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    // Generate performance data based on timeframe
    const generatePerformanceData = () => {
      const points =
        timeframe === "1h"
          ? 12
          : timeframe === "24h"
          ? 24
          : timeframe === "7d"
          ? 7
          : 30;
      const baseValue = portfolioData?.totalValue || 10000;

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

        const variation = (Math.random() - 0.5) * 0.1;
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
  }, [timeframe, portfolioData]);

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
  ];

  const allocationData =
    portfolioData?.items?.map((item, index) => ({
      name: item.symbol,
      value: item.value,
      percentage: (
        (item.value / (portfolioData?.totalValue || 1)) *
        100
      ).toFixed(1),
    })) || [];

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
              • Your portfolio is well-diversified across{" "}
              {portfolioData?.items.length} assets
            </li>
            <li>• Consider rebalancing - ETH allocation is above 40%</li>
            <li>• Strong performance this week with +12.4% gains</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
