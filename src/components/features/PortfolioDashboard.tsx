"use client";

import React, { useState } from "react";
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PortfolioStats } from "@/components/features/PortfolioStats";
import { AssetTable } from "@/components/features/AssetTable";
import { PortfolioCharts } from "@/components/features/PortfolioCharts";
import { RecentActivity } from "@/components/features/RecentActivity";
import { QuickActions } from "@/components/features/QuickActions";
import {
  Search,
  Grid,
  List,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Target,
  Activity,
} from "lucide-react";

interface PortfolioDashboardProps {
  sortBy: string;
  filterBy: string;
  viewMode: "grid" | "list";
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  sortBy,
  filterBy,
  viewMode,
}) => {
  const { portfolioData, isLoading, error, refetch } = usePortfolio();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </Card>
          <Card className="p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <TrendingDown className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Failed to load portfolio</p>
          <p className="text-sm">Please check your connection and try again</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      <PortfolioStats
        portfolioData={portfolioData}
        timeframe={selectedTimeframe}
      />

      {/* Search and Filters */}
      <Card className="p-4" gradient>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Timeframe:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="1h">1H</option>
              <option value="24h">24H</option>
              <option value="7d">7D</option>
              <option value="30d">30D</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      <PortfolioCharts
        portfolioData={portfolioData}
        timeframe={selectedTimeframe}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Table */}
        <div className="lg:col-span-2">
          <AssetTable
            portfolioData={portfolioData}
            searchTerm={searchTerm}
            sortBy={sortBy}
            filterBy={filterBy}
            viewMode={viewMode}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};
