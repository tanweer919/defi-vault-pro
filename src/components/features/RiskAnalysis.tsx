"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PortfolioData } from "@/lib/types";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Wallet,
  AlertCircle,
} from "lucide-react";

interface RiskAnalysisProps {
  portfolioData?: PortfolioData;
}

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
  portfolioData,
}) => {
  const { isConnected } = useWalletState();
  const { isDemoMode } = useDemoMode();

  // Calculate risk metrics based on portfolio data
  const calculateRiskMetrics = () => {
    if (!portfolioData?.items || portfolioData.items.length === 0) {
      return {
        volatility: 0,
        diversification: 0,
        liquidity: 0,
        overallRisk: 0,
        riskLevel: "Unknown",
        riskColor: "text-gray-600",
      };
    }

    const assetCount = portfolioData.items.length;
    const totalValue = portfolioData.totalValue;

    // Simple risk calculations based on portfolio composition
    const volatility = Math.min(100, Math.max(0, 50 + (assetCount - 3) * 10)); // More assets = lower volatility
    const diversification = Math.min(100, assetCount * 20); // More assets = better diversification
    const liquidity = Math.min(
      100,
      Math.max(0, 80 - (totalValue > 10000 ? 20 : 0)),
    ); // Higher value = lower liquidity

    const overallRisk = Math.round(
      (volatility + diversification + liquidity) / 3,
    );
    const riskLevel =
      overallRisk > 70 ? "Low" : overallRisk > 40 ? "Medium" : "High";
    const riskColor =
      overallRisk > 70
        ? "text-green-600"
        : overallRisk > 40
        ? "text-yellow-600"
        : "text-red-600";

    return {
      volatility,
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

  // Show empty state if no portfolio data
  if (!portfolioData?.totalValue || portfolioData.totalValue === 0) {
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
        {riskMetrics.map((metric, index) => (
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
