/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
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

interface PerformanceChartProps {
  timeRange: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  timeRange,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for performance data
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

      return Array.from({ length: points }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (points - i - 1));

        return {
          date: date.toISOString().split("T")[0],
          value: 10000 + Math.random() * 5000,
          pnl: (Math.random() - 0.5) * 1000,
        };
      });
    };

    setLoading(true);
    setTimeout(() => {
      setData(generateData());
      setLoading(false);
    }, 500);
  }, [timeRange]);

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
