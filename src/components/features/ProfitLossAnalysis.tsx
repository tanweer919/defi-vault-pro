/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProfitLossAnalysisProps {
  timeRange: string;
}

export const ProfitLossAnalysis: React.FC<ProfitLossAnalysisProps> = ({
  timeRange,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate P&L data
    const generatePLData = () => {
      const periods =
        timeRange === "1d"
          ? 6
          : timeRange === "7d"
          ? 7
          : timeRange === "30d"
          ? 30
          : 12;

      return Array.from({ length: periods }, (_, i) => ({
        period: `Period ${i + 1}`,
        profit: Math.random() * 500,
        loss: Math.random() * 300,
      }));
    };

    setLoading(true);
    setTimeout(() => {
      setData(generatePLData());
      setLoading(false);
    }, 500);
  }, [timeRange]);

  return (
    <Card className="p-6" gradient>
      <h3 className="text-xl font-semibold mb-4">Profit & Loss Analysis</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Bar dataKey="profit" fill="#10B981" name="Profit" />
            <Bar dataKey="loss" fill="#EF4444" name="Loss" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};
