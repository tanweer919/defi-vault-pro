"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Shield, AlertTriangle, TrendingUp } from "lucide-react";

export const RiskAnalysis: React.FC = () => {
  const riskMetrics = [
    {
      name: "Volatility",
      value: 62,
      color: "red" as const,
      icon: AlertTriangle,
    },
    {
      name: "Diversification",
      value: 78,
      color: "green" as const,
      icon: TrendingUp,
    },
    { name: "Liquidity", value: 85, color: "blue" as const, icon: Shield },
  ];

  const overallRisk = Math.round(
    riskMetrics.reduce((sum, metric) => sum + metric.value, 0) /
      riskMetrics.length,
  );
  const riskLevel =
    overallRisk > 70 ? "Low" : overallRisk > 40 ? "Medium" : "High";
  const riskColor =
    overallRisk > 70
      ? "text-green-600"
      : overallRisk > 40
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <Card className="p-6" gradient>
      <h3 className="text-xl font-semibold mb-4">Risk Analysis</h3>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold mb-2">
          <span className={riskColor}>{riskLevel}</span>
        </div>
        <p className="text-gray-600">Overall Risk Level</p>
        <div className="mt-2">
          <ProgressBar
            value={overallRisk}
            color={
              overallRisk > 70 ? "green" : overallRisk > 40 ? "yellow" : "red"
            }
            className="max-w-xs mx-auto"
          />
        </div>
      </div>

      <div className="space-y-4">
        {riskMetrics.map((metric, index) => (
          <div key={metric.name} className="flex items-center justify-between">
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
    </Card>
  );
};
