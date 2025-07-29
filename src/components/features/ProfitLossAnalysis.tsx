"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { PortfolioData } from "@/lib/types";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
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
import { Wallet, BarChart3 } from "lucide-react";

interface ProfitLossAnalysisProps {
  timeRange: string;
  portfolioData?: PortfolioData;
}

export const ProfitLossAnalysis: React.FC<ProfitLossAnalysisProps> = ({
  timeRange,
  portfolioData,
}) => {
  const { isConnected } = useWalletState();
  const { isDemoMode } = useDemoMode();
  const { analytics, isLoading } = useAnalytics(portfolioData, timeRange);

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

  // Show empty state if no portfolio data and not in demo mode
  if (!portfolioData?.totalValue && !isDemoMode) {
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

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.profitLossData}>
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
