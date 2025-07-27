"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PerformanceChart } from "@/components/features/PerformanceChart";
import { ProfitLossAnalysis } from "@/components/features/ProfitLossAnalysis";
import { YieldTracker } from "@/components/features/YieldTracker";
import { RiskAnalysis } from "@/components/features/RiskAnalysis";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import {
  TrendingUp,
  PieChart,
  Target,
  Shield,
  Wallet,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const { isConnected } = useWalletState();
  const { portfolioData, isLoading, error, isDemoMode } = usePortfolio();
  const { enableDemoMode, isDemoAvailable } = useDemoMode();

  const handleEnableDemo = () => {
    enableDemoMode();
  };

  const timeRanges = [
    { value: "1d", label: "1D" },
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "90d", label: "90D" },
    { value: "1y", label: "1Y" },
  ];

  // Show wallet connection prompt if not connected and not in demo mode
  if (!isConnected && !isDemoMode) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics</h1>
          <p className="text-gray-600">
            Deep insights into your DeFi performance
          </p>
        </motion.div>

        <Card className="p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your wallet to view detailed analytics, performance metrics,
            and insights about your DeFi portfolio.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg">
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
            {isDemoAvailable && (
              <Button variant="secondary" size="lg" onClick={handleEnableDemo}>
                <Eye className="w-5 h-5 mr-2" />
                Try Demo
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">
              Deep insights into your DeFi performance
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="p-6" gradient>
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="p-6" gradient>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics</h1>
          <p className="text-gray-600">
            Deep insights into your DeFi performance
          </p>
        </motion.div>

        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Analytics
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Failed to load your portfolio analytics. Please check your
            connection and try again.
          </p>
          <Button variant="outline" size="lg">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate real metrics from portfolio data (or demo data)
  const totalValue = portfolioData?.totalValue || 0;
  const assetCount = portfolioData?.items?.length || 0;
  const hasData = totalValue > 0 && assetCount > 0;

  // Enhanced demo data for analytics
  const getDemoAnalytics = () => {
    if (!isDemoMode || !hasData) return null;

    return {
      totalPnl: 1283.45,
      totalPnlPercent: 4.7,
      winRate: 68.3,
      avgYield: 8.9,
      riskScore: "Medium",
      riskValue: 6.4,
    };
  };

  const demoAnalytics = getDemoAnalytics();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Deep insights into your DeFi performance
          </p>
        </div>

        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Demo Analytics</h3>
              <p className="text-sm text-orange-700">
                These analytics are based on sample portfolio data for
                demonstration purposes.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6" gradient hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {hasData ? `$${totalValue.toLocaleString()}` : "$0.00"}
              </p>
              <p className="text-sm text-gray-500">
                {hasData ? `${assetCount} assets` : "No assets"}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6" gradient hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total P&L</p>
              <p className="text-2xl font-bold text-gray-900">
                {isDemoMode && demoAnalytics
                  ? `+$${demoAnalytics.totalPnl.toLocaleString()}`
                  : hasData
                  ? "$0.00"
                  : "--"}
              </p>
              <p className="text-sm text-green-600">
                {isDemoMode && demoAnalytics
                  ? `+${demoAnalytics.totalPnlPercent}%`
                  : hasData
                  ? "0.0%"
                  : "No data"}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6" gradient hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {isDemoMode && demoAnalytics
                  ? `${demoAnalytics.winRate}%`
                  : hasData
                  ? "0.0%"
                  : "--"}
              </p>
              <p className="text-sm text-gray-500">
                {isDemoMode ? "Trading success" : "No data"}
              </p>
            </div>
            <PieChart className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6" gradient hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {isDemoMode && demoAnalytics
                  ? demoAnalytics.riskScore
                  : hasData
                  ? "Low"
                  : "--"}
              </p>
              <p className="text-sm text-gray-500">
                {isDemoMode && demoAnalytics
                  ? `${demoAnalytics.riskValue}/10`
                  : hasData
                  ? "2.1/10"
                  : "No data"}
              </p>
            </div>
            <Shield className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart timeRange={timeRange} portfolioData={portfolioData} />
        <ProfitLossAnalysis
          timeRange={timeRange}
          portfolioData={portfolioData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YieldTracker portfolioData={portfolioData} />
        <RiskAnalysis portfolioData={portfolioData} />
      </div>
    </div>
  );
}
