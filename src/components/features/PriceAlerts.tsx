"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { usePriceAlerts } from "@/lib/hooks/usePriceAlerts";
import { usePortfolio } from "@/lib/hooks/usePortfolio";

export const PriceAlerts: React.FC = () => {
  const {
    activeAlerts,
    triggeredAlerts,
    createAlert,
    deleteAlert,
    toggleAlert,
    clearTriggeredAlerts,
  } = usePriceAlerts();

  const { portfolioData } = usePortfolio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    tokenAddress: "",
    symbol: "",
    targetPrice: "",
    condition: "above" as "above" | "below",
  });

  const availableTokens = portfolioData?.items || [];

  const handleCreateAlert = () => {
    if (!newAlert.tokenAddress || !newAlert.targetPrice) return;

    createAlert({
      tokenAddress: newAlert.tokenAddress,
      symbol: newAlert.symbol,
      targetPrice: parseFloat(newAlert.targetPrice),
      condition: newAlert.condition,
    });

    setNewAlert({
      tokenAddress: "",
      symbol: "",
      targetPrice: "",
      condition: "above",
    });
    setIsModalOpen(false);
  };

  const getCurrentPrice = (tokenAddress: string, symbol: string) => {
    const token = portfolioData?.items.find(
      (item) =>
        item.address.toLowerCase() === tokenAddress.toLowerCase() ||
        item.symbol.toLowerCase() === symbol.toLowerCase(),
    );
    return token?.price || 0;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6" gradient>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Active Price Alerts ({activeAlerts.length})
          </h3>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Alert
          </Button>
        </div>

        {/* Active Alerts */}
        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active price alerts set up yet
            </div>
          ) : (
            activeAlerts.map((alert, index) => {
              const currentPrice = getCurrentPrice(
                alert.tokenAddress,
                alert.symbol,
              );
              const priceDirection = alert.condition === "above" ? "↗️" : "↘️";
              const progressToTarget =
                alert.condition === "above"
                  ? Math.min((currentPrice / alert.targetPrice) * 100, 100)
                  : Math.min(
                      ((alert.targetPrice - currentPrice) / alert.targetPrice) *
                        100 +
                        50,
                      100,
                    );

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:bg-blue-900/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          alert.condition === "above"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        {alert.condition === "above" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium">
                          {alert.symbol} {priceDirection}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Alert when {alert.condition} $
                          {alert.targetPrice.toFixed(2)}
                        </p>

                        {/* Progress bar showing how close we are to target */}
                        <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-2">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 alert-progress ${
                              alert.condition === "above"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                            style={
                              {
                                "--progress-width": `${Math.max(
                                  progressToTarget,
                                  5,
                                )}%`,
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Current: ${currentPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Target: ${alert.targetPrice.toFixed(2)}
                        </p>
                        <p className="text-xs font-medium text-green-600">
                          Active ✓
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAlert(alert.id)}
                      >
                        Pause
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              Triggered Alerts ({triggeredAlerts.length})
            </h3>
            <Button variant="outline" size="sm" onClick={clearTriggeredAlerts}>
              Clear All
            </Button>
          </div>

          <div className="space-y-3">
            {triggeredAlerts.map((alert, index) => {
              const currentPrice = getCurrentPrice(
                alert.tokenAddress,
                alert.symbol,
              );
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-400">
                          {alert.symbol} Alert Triggered! 🎉
                        </h4>
                        <p className="text-sm text-green-600">
                          Went {alert.condition} ${alert.targetPrice.toFixed(2)}{" "}
                          at ${currentPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {alert.triggeredAt?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Create Alert Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Price Alert"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token
            </label>
            <select
              value={newAlert.tokenAddress}
              onChange={(e) => {
                const selectedToken = availableTokens.find(
                  (token) => token.address === e.target.value,
                );
                setNewAlert({
                  ...newAlert,
                  tokenAddress: e.target.value,
                  symbol: selectedToken?.symbol || "",
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select token from your portfolio</option>
              {availableTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - Current: ${token.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              value={newAlert.condition}
              onChange={(e) =>
                setNewAlert({
                  ...newAlert,
                  condition: e.target.value as "above" | "below",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="above">Price goes above</option>
              <option value="below">Price goes below</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Price ($)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newAlert.targetPrice}
              onChange={(e) =>
                setNewAlert({ ...newAlert, targetPrice: e.target.value })
              }
            />
            {newAlert.tokenAddress && (
              <p className="text-xs text-gray-500 mt-1">
                Current price: $
                {getCurrentPrice(
                  newAlert.tokenAddress,
                  newAlert.symbol,
                ).toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAlert}
              disabled={!newAlert.tokenAddress || !newAlert.targetPrice}
              className="flex-1"
            >
              Create Alert
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
