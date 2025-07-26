"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PieChart, BarChart, ArrowRight, Wallet, Repeat } from "lucide-react";

export const AssetAllocation: React.FC = () => {
  const [viewType, setViewType] = useState<"pie" | "bar">("pie");
  const [timeframe, setTimeframe] = useState("1M");

  // Mock data - in a real app, this would come from your data service
  const assetData = [
    { name: "ETH", percentage: 35, value: 15000, color: "bg-blue-500" },
    { name: "BTC", percentage: 25, value: 12000, color: "bg-orange-500" },
    { name: "USDC", percentage: 20, value: 8000, color: "bg-green-500" },
    { name: "Other DeFi", percentage: 15, value: 6000, color: "bg-purple-500" },
    { name: "NFTs", percentage: 5, value: 2000, color: "bg-pink-500" },
  ];

  const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === "pie" ? "primary" : "outline"}
            onClick={() => setViewType("pie")}
            size="sm"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Pie Chart
          </Button>
          <Button
            variant={viewType === "bar" ? "primary" : "outline"}
            onClick={() => setViewType("bar")}
            size="sm"
          >
            <BarChart className="w-4 h-4 mr-2" />
            Bar Chart
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {timeframes.map((t) => (
            <Button
              key={t}
              variant={timeframe === t ? "primary" : "outline"}
              onClick={() => setTimeframe(t)}
              size="sm"
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-xl font-semibold mb-6">Asset Allocation</h3>
          <div className="aspect-square max-h-[400px] flex items-center justify-center">
            {/* Placeholder for chart - you would use a charting library like recharts or chart.js here */}
            <div className="relative w-full h-full">
              {assetData.map((asset, index) => (
                <div
                  key={asset.name}
                  className={`absolute ${asset.color} opacity-80 w-4/5 h-4/5 pie-segment`}
                  style={
                    {
                      "--segment-start": `${index / assetData.length}`,
                      "--segment-end": `${(index + 1) / assetData.length}`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Asset List */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Assets Breakdown</h3>
          <div className="space-y-4">
            {assetData.map((asset) => (
              <div
                key={asset.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${asset.color}`} />
                  <span>{asset.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${asset.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {asset.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3 p-6">
          <h3 className="text-xl font-semibold mb-4">Rebalancing Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-between">
              <div className="flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                <span>Deposit More ETH</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button variant="outline" className="justify-between">
              <div className="flex items-center">
                <Repeat className="w-5 h-5 mr-2" />
                <span>Swap BTC to USDC</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button variant="outline" className="justify-between">
              <div className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                <span>Auto-Rebalance All</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
