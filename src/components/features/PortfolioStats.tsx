"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { PortfolioData } from "@/lib/types";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Coins,
  Target,
  Activity,
} from "lucide-react";

interface PortfolioStatsProps {
  portfolioData: PortfolioData | undefined;
  timeframe: string;
}

export const PortfolioStats: React.FC<PortfolioStatsProps> = ({
  portfolioData,
  timeframe,
}) => {
  const stats = [
    {
      title: "Total Value",
      value: `$${portfolioData?.totalValue.toLocaleString() || "0"}`,
      change: "+12.4%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "blue",
    },
    {
      title: "Total Assets",
      value: portfolioData?.items.length || 0,
      change: "+3",
      changeType: "positive" as const,
      icon: Coins,
      color: "green",
    },
    {
      title: `${timeframe} P&L`,
      value: "+$1,234.56",
      change: "+8.7%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "purple",
    },
    {
      title: "Best Performer",
      value: portfolioData?.items[0]?.symbol || "N/A",
      change: "+24.5%",
      changeType: "positive" as const,
      icon: Target,
      color: "yellow",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      purple: "text-purple-600 bg-purple-100",
      yellow: "text-yellow-600 bg-yellow-100",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            className="p-6 hover:shadow-lg transition-shadow"
            gradient
            hover
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div
                className={`flex items-center space-x-1 text-sm ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.changeType === "positive" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
