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
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import {
  Search,
  Wallet,
  Eye,
} from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface PortfolioDashboardProps {
  sortBy?: string;
  filterBy?: string;
  viewMode?: "grid" | "list";
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  sortBy = "value",
  filterBy = "all",
  viewMode = "grid",
}) => {
  const { portfolioData, isLoading, error, refetch, isDemoMode } =
    usePortfolio();
  const { isConnected } = useWalletState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const { enableDemoMode, isDemoAvailable } = useDemoMode();
  const { openConnectModal } = useConnectModal();

  const handleEnableDemo = () => {
    enableDemoMode();
  };

  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  // Show wallet connection prompt if not connected and not in demo mode
  if (!isConnected && !isDemoMode) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your wallet to view your DeFi portfolio, track performance,
            and manage your assets.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={handleConnectWallet}>
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
            {isDemoAvailable && (
              <Button variant="secondary" size="lg" onClick={handleEnableDemo}>
                <Eye className="w-5 h-5 mr-2" />
                Try Demo
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Indicator (local to dashboard) */}
      {isDemoMode && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Demo Portfolio</h3>
              <p className="text-sm text-orange-700">
                This is sample data showcasing the platform&apos;s features.
                Connect your wallet to see real data.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Portfolio Stats */}
      <PortfolioStats
        portfolioData={portfolioData}
        timeframe={selectedTimeframe}
        isLoading={isLoading}
        error={error}
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
        isLoading={isLoading}
        error={error}
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
