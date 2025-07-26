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
  Filter,
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your DeFi investments across all chains
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ChainSelector />

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <Card className="p-2" gradient>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
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
