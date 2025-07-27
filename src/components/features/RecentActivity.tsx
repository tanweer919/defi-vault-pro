"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: "1",
      type: "swap",
      from: { symbol: "ETH", amount: "0.5" },
      to: { symbol: "USDC", amount: "847.23" },
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      hash: "0x123...abc",
      status: "completed",
    },
    {
      id: "2",
      type: "deposit",
      from: { symbol: "USDC", amount: "1000" },
      to: { symbol: "Vault", amount: "1000" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      hash: "0x456...def",
      status: "completed",
    },
    {
      id: "3",
      type: "approval",
      from: { symbol: "WBTC", amount: "∞" },
      to: { symbol: "Uniswap", amount: "" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      hash: "0x789...ghi",
      status: "completed",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "swap":
        return ArrowUpRight;
      case "deposit":
        return ArrowDownLeft;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "swap":
        return "text-blue-600 bg-blue-100";
      case "deposit":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Card className="p-6" gradient>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div
              key={activity.id}
              className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow transition-shadow"
            >
              <div
                className={`p-2 rounded-full ${getActivityColor(
                  activity.type,
                )}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {activity.from.amount} {activity.from.symbol}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-medium">
                    {activity.to.amount} {activity.to.symbol}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>

              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
