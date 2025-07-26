"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PerformanceChart } from "@/components/features/PerformanceChart";
import { ProfitLossAnalysis } from "@/components/features/ProfitLossAnalysis";
import { YieldTracker } from "@/components/features/YieldTracker";
import { RiskAnalysis } from "@/components/features/RiskAnalysis";
import { TrendingUp, PieChart, Target, Shield } from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  const timeRanges = [
    { value: "1d", label: "1D" },
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "90d", label: "90D" },
    { value: "1y", label: "1Y" },
  ];

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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6" gradient hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total P&L</p>
              <p className="text-2xl font-bold text-green-600">+$4,283.45</p>
              <p className="text-sm text-green-600">+12.4% ↗</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6" gradient hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-blue-600">73.2%</p>
              <p className="text-sm text-blue-600">+2.1% ↗</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6" gradient hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Yield</p>
              <p className="text-2xl font-bold text-purple-600">8.7%</p>
              <p className="text-sm text-purple-600">APR</p>
            </div>
            <PieChart className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6" gradient hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risk Score</p>
              <p className="text-2xl font-bold text-yellow-600">Medium</p>
              <p className="text-sm text-yellow-600">6.2/10</p>
            </div>
            <Shield className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart timeRange={timeRange} />
        <ProfitLossAnalysis timeRange={timeRange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YieldTracker />
        <RiskAnalysis />
      </div>
    </div>
  );
}
