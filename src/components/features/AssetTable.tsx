"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PortfolioData } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Star,
  MoreHorizontal,
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
          return Math.random() - 0.5; // Placeholder for actual 24h change
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
            <Card className="p-4 hover:shadow-lg transition-shadow" hover>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {asset.logo && (
                    <img
                      src={asset.logo}
                      alt={asset.symbol}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
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
                  {formatPercentage(Math.random() * 20 - 10)}
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
                    {asset.logo && (
                      <img
                        src={asset.logo}
                        alt={asset.symbol}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
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
                  {formatPercentage(Math.random() * 20 - 10)}
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
