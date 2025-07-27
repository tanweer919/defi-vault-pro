"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TokenImage } from "@/components/ui/TokenImage";
import { PortfolioData, TokenBalance } from "@/lib/types";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Star,
  MoreHorizontal,
  Wallet,
  AlertCircle,
  Coins,
  Search,
} from "lucide-react";

interface AssetTableProps {
  portfolioData: PortfolioData | undefined;
  searchTerm: string;
  sortBy: string;
  filterBy: string;
  viewMode: "grid" | "list";
}

export const AssetTable: React.FC<AssetTableProps> = ({
  portfolioData,
  searchTerm,
  sortBy,
  filterBy,
  viewMode,
}) => {
  const { isConnected } = useWalletState();
  const { isDemoMode } = useDemoMode();

  const filteredAndSortedAssets = useMemo(() => {
    if (!portfolioData?.items) return [];

    const filtered = portfolioData.items.filter((asset) => {
      const matchesSearch =
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "tokens" && asset.address) ||
        (filterBy === "defi" && asset.value > 1000);

      return matchesSearch && matchesFilter;
    });

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "value":
          return b.value - a.value;
        case "value_asc":
          return a.value - b.value;
        case "name":
          return a.name.localeCompare(b.name);
        case "change":
          return 0; // No 24h change data available
        default:
          return 0;
      }
    });

    return filtered;
  }, [portfolioData, searchTerm, sortBy, filterBy]);

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span
        className={`flex items-center ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 mr-1" />
        )}
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  };

  // Get demo 24h changes for assets
  const getDemoChanges = () => {
    if (!isDemoMode || !portfolioData?.items) return {};

    const changes: { [key: string]: number } = {};
    portfolioData.items.forEach((asset, index) => {
      // Generate realistic demo changes for each asset
      const demoChanges = [8.4, -2.1, 15.7, 5.2]; // ETH, USDC, WBTC, LINK
      changes[asset.symbol] = demoChanges[index] || 0;
    });
    return changes;
  };

  const demoChanges = getDemoChanges();

  // Show wallet connection prompt if not connected AND not in demo mode
  if (!isConnected && !isDemoMode) {
    return (
      <Card className="p-12 text-center" gradient>
        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 mb-6">
          Connect your wallet to view your assets and portfolio data.
        </p>
      </Card>
    );
  }

  // Show empty state if no assets
  if (!portfolioData?.items || portfolioData.items.length === 0) {
    return (
      <Card className="p-12 text-center" gradient>
        <Coins className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          No Assets Found
        </h3>
        <p className="text-gray-600 mb-6">
          You don&apos;t have any assets in your portfolio yet. Add funds to get
          started.
        </p>
        <Button variant="outline">
          <ExternalLink className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      </Card>
    );
  }

  // Show no results for search
  if (filteredAndSortedAssets.length === 0 && searchTerm) {
    return (
      <Card className="p-12 text-center" gradient>
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          No Results Found
        </h3>
        <p className="text-gray-600 mb-6">
          No assets match your search criteria. Try adjusting your search terms.
        </p>
      </Card>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSortedAssets.map((asset, index) => (
          <motion.div
            key={asset.address}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow" hover>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <TokenImage
                    src={asset.logo}
                    alt={asset.symbol}
                    symbol={asset.symbol}
                    size={40}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {asset.symbol}
                    </h3>
                    <p className="text-sm text-gray-600">{asset.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="font-medium">
                    {parseFloat(asset.balance).toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="font-medium">${asset.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium">${asset.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">24h Change</p>
                  {isDemoMode && demoChanges[asset.symbol] !== undefined ? (
                    formatPercentage(demoChanges[asset.symbol])
                  ) : (
                    <span className="text-gray-500">--</span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Buy
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Sell
                </Button>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <Card className="p-6" gradient>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Assets</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Asset</th>
              <th className="text-right py-3 px-4">Balance</th>
              <th className="text-right py-3 px-4">Price</th>
              <th className="text-right py-3 px-4">24h Change</th>
              <th className="text-right py-3 px-4">Value</th>
              <th className="text-center py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedAssets.map((asset, index) => (
              <motion.tr
                key={asset.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <TokenImage
                      src={asset.logo}
                      alt={asset.symbol}
                      symbol={asset.symbol}
                      size={32}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {asset.symbol}
                      </p>
                      <p className="text-sm text-gray-600">{asset.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <p className="font-medium">
                    {parseFloat(asset.balance).toFixed(4)}
                  </p>
                </td>
                <td className="py-4 px-4 text-right">
                  <p className="font-medium">${asset.price.toFixed(2)}</p>
                </td>
                <td className="py-4 px-4 text-right">
                  {isDemoMode && demoChanges[asset.symbol] !== undefined ? (
                    formatPercentage(demoChanges[asset.symbol])
                  ) : (
                    <span className="text-gray-500">--</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  <p className="font-medium">${asset.value.toLocaleString()}</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm">
                      Trade
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedAssets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No assets found matching your criteria
        </div>
      )}
    </Card>
  );
};
