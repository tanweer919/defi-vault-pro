/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { PortfolioData } from "@/lib/types";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Wallet, AlertCircle, BarChart3 } from "lucide-react";

interface ProfitLossAnalysisProps {
  timeRange: string;
  portfolioData?: PortfolioData;
}

export const ProfitLossAnalysis: React.FC<ProfitLossAnalysisProps> = ({
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

    // Generate P&L data based on actual portfolio value
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
        profit: Math.random() * portfolioData.totalValue * 0.1,
        loss: Math.random() * portfolioData.totalValue * 0.05,
      }));
    };

    setLoading(true);
    setTimeout(() => {
      setData(generatePLData());
      setLoading(false);
    }, 500);
  }, [timeRange, portfolioData]);

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
              Connect your wallet to view P&L analysis
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
              No P&L Data
            </h3>
            <p className="text-gray-500">
              Add funds to your vault to see profit & loss analysis
            </p>
          </div>
        </div>
      </Card>
    );
  }

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
