"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PortfolioData } from "@/lib/types";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import { Shield, AlertTriangle, TrendingUp, Wallet } from "lucide-react";

interface RiskAnalysisProps {
  portfolioData?: PortfolioData;
}

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
  portfolioData,
}) => {
  const { isConnected } = useWalletState();
  const { isDemoMode } = useDemoMode();
  const { analytics } = useAnalytics(portfolioData);

  // Calculate risk metrics based on real analytics and portfolio data
  const calculateRiskMetrics = () => {
    if (!portfolioData?.items && !isDemoMode) {
      return {
        volatility: 0,
        diversification: 0,
        liquidity: 0,
        overallRisk: 0,
        riskLevel: "Unknown",
        riskColor: "text-gray-600",
      };
    }

    if (isDemoMode) {
      // Use demo analytics risk data
      return {
        volatility: 65,
        diversification: 75,
        liquidity: 80,
        overallRisk: Math.round(analytics.riskValue * 10),
        riskLevel: analytics.riskScore,
        riskColor:
          analytics.riskScore === "Low"
            ? "text-green-600"
            : analytics.riskScore === "Medium"
            ? "text-yellow-600"
            : "text-red-600",
      };
    }

    const assetCount = portfolioData?.items?.length || 0;
    const totalValue = portfolioData?.totalValue || 0;

    // Enhanced risk calculations using analytics data
    const baseVolatility = analytics.riskValue * 10; // Convert to percentage
    const volatility = Math.min(100, Math.max(0, baseVolatility));

    const diversification = Math.min(
      100,
      assetCount * 20 + (analytics.winRate > 50 ? 20 : 0),
    );

    const liquidity = Math.min(
      100,
      Math.max(
        0,
        80 - (totalValue > 10000 ? 10 : 0) + (analytics.winRate > 70 ? 10 : 0),
      ),
    );

    const overallRisk = Math.round(
      (100 - volatility + diversification + liquidity) / 3,
    );

    const riskLevel = analytics.riskScore;
    const riskColor =
      riskLevel === "Low"
        ? "text-green-600"
        : riskLevel === "Medium"
        ? "text-yellow-600"
        : "text-red-600";

    return {
      volatility: 100 - volatility, // Invert so higher is better
      diversification,
      liquidity,
      overallRisk,
      riskLevel,
      riskColor,
    };
  };

  const riskData = calculateRiskMetrics();

  const riskMetrics = [
    {
      name: "Volatility",
      value: riskData.volatility,
      color: (riskData.volatility > 70
        ? "green"
        : riskData.volatility > 40
        ? "yellow"
        : "red") as "green" | "yellow" | "red" | "blue",
      icon: AlertTriangle,
    },
    {
      name: "Diversification",
      value: riskData.diversification,
      color: (riskData.diversification > 70
        ? "green"
        : riskData.diversification > 40
        ? "yellow"
        : "red") as "green" | "yellow" | "red" | "blue",
      icon: TrendingUp,
    },
    {
      name: "Liquidity",
      value: riskData.liquidity,
      color: (riskData.liquidity > 70
        ? "green"
        : riskData.liquidity > 40
        ? "yellow"
        : "red") as "green" | "yellow" | "red" | "blue",
      icon: Shield,
    },
  ];

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
              Connect your wallet to view risk analysis
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
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Risk Data
            </h3>
            <p className="text-gray-500">
              Add funds to your vault to see risk analysis
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-fit" gradient>
      <h3 className="text-xl font-semibold mb-6">Risk Analysis</h3>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold mb-2">
          <span className={riskData.riskColor}>{riskData.riskLevel}</span>
        </div>
        <p className="text-gray-600 mb-3">Overall Risk Level</p>
        <div className="mt-2">
          <ProgressBar
            value={riskData.overallRisk}
            color={
              riskData.overallRisk > 70
                ? "green"
                : riskData.overallRisk > 40
                ? "yellow"
                : "red"
            }
            className="max-w-xs mx-auto"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {riskData.overallRisk}/100 Risk Score
        </p>
      </div>

      <div className="space-y-3">
        {riskMetrics.map((metric) => (
          <div
            key={metric.name}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center space-x-3">
              <metric.icon className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{metric.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <ProgressBar
                value={metric.value}
                color={metric.color}
                className="w-20"
                size="sm"
              />
              <span className="text-sm font-medium w-8">{metric.value}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Assessment Summary */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">
          💡 Risk Assessment
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          {riskData.overallRisk > 70 ? (
            <p>
              • Your portfolio shows low overall risk with good diversification
            </p>
          ) : riskData.overallRisk > 40 ? (
            <p>
              • Your portfolio has moderate risk - consider diversifying further
            </p>
          ) : (
            <p>• High risk detected - review your asset allocation</p>
          )}
          <p>
            •{" "}
            {riskData.diversification > 60
              ? "Well diversified"
              : "Consider adding more assets"}{" "}
            across {portfolioData?.items?.length || 0} tokens
          </p>
          <p>
            •{" "}
            {riskData.liquidity > 70 ? "High liquidity" : "Moderate liquidity"}{" "}
            for quick exits
          </p>
        </div>
      </div>
    </Card>
  );
};
