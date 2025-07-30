"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PortfolioDashboard } from "@/components/features/PortfolioDashboard";
import { PortfolioSettings } from "@/components/features/PortfolioSettings";
import { AssetAllocation } from "@/components/features/AssetAllocation";
import { PriceAlerts } from "@/components/features/PriceAlerts";
import { ChainSelector } from "@/components/common/ChainSelector";
import {
  TrendingUp,
  Settings,
  PieChart,
  Bell,
  RefreshCw,
  Download,
} from "lucide-react";

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("value");
  const [filterBy, setFilterBy] = useState("all");

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "allocation", label: "Allocation", icon: PieChart },
    { id: "alerts", label: "Price Alerts", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const sortOptions = [
    { value: "value", label: "Value (High to Low)" },
    { value: "value_asc", label: "Value (Low to High)" },
    { value: "name", label: "Name (A-Z)" },
    { value: "change", label: "24h Change" },
  ];

  const filterOptions = [
    { value: "all", label: "All Assets" },
    { value: "tokens", label: "Tokens Only" },
    { value: "nfts", label: "NFTs Only" },
    { value: "defi", label: "DeFi Positions" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Portfolio
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Track and manage your DeFi investments across all chains
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="order-2 sm:order-1">
            <ChainSelector />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 order-1 sm:order-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-auto"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-auto"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="flex-1 sm:flex-none"
              >
                {viewMode === "grid" ? "List" : "Grid"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <Card className="p-2 sm:p-3" gradient>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2 text-sm sm:text-base"
              size="sm"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.charAt(0)}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "overview" && (
          <PortfolioDashboard
            sortBy={sortBy}
            filterBy={filterBy}
            viewMode={viewMode}
          />
        )}
        {activeTab === "allocation" && <AssetAllocation />}
        {activeTab === "alerts" && <PriceAlerts />}
        {activeTab === "settings" && <PortfolioSettings />}
      </motion.div>
    </div>
  );
}
