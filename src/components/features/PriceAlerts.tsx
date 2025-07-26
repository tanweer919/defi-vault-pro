"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import toast from "react-hot-toast";

interface PriceAlert {
  id: string;
  token: string;
  symbol: string;
  currentPrice: number;
  targetPrice: number;
  condition: "above" | "below";
  isActive: boolean;
  createdAt: Date;
}

export const PriceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    token: "",
    symbol: "",
    targetPrice: "",
    condition: "above" as "above" | "below",
  });

  useEffect(() => {
    // Load alerts from localStorage
    const savedAlerts = localStorage.getItem("priceAlerts");
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  useEffect(() => {
    // Save alerts to localStorage
    localStorage.setItem("priceAlerts", JSON.stringify(alerts));
  }, [alerts]);

  const createAlert = () => {
    const alert: PriceAlert = {
      id: Date.now().toString(),
      token: newAlert.token,
      symbol: newAlert.symbol,
      currentPrice: 0, // Would fetch from API
      targetPrice: parseFloat(newAlert.targetPrice),
      condition: newAlert.condition,
      isActive: true,
      createdAt: new Date(),
    };

    setAlerts([...alerts, alert]);
    setNewAlert({ token: "", symbol: "", targetPrice: "", condition: "above" });
    setIsModalOpen(false);
    toast.success("Price alert created successfully!");
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
    toast.success("Alert deleted");
  };

  const toggleAlert = (id: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert,
      ),
    );
  };

  return (
    <Card className="p-6" gradient>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Price Alerts
        </h3>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Alert
        </Button>
      </div>

      {/* Active Alerts */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No price alerts set up yet
          </div>
        ) : (
          alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 bg-white rounded-lg border-2 transition-all ${
                alert.isActive
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      alert.condition === "above"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {alert.condition === "above" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium">{alert.symbol}</h4>
                    <p className="text-sm text-gray-600">
                      Alert when {alert.condition} $
                      {alert.targetPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Current: ${alert.currentPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {alert.isActive ? "Active" : "Paused"}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAlert(alert.id)}
                  >
                    {alert.isActive ? "Pause" : "Resume"}
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
          ))
        )}
      </div>

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
              value={newAlert.token}
              onChange={(e) => {
                const option = e.target.selectedOptions[0];
                setNewAlert({
                  ...newAlert,
                  token: e.target.value,
                  symbol: option.text,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select token</option>
              <option value="0x...">ETH</option>
              <option value="0x...">USDC</option>
              <option value="0x...">WBTC</option>
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
              placeholder="0.00"
              value={newAlert.targetPrice}
              onChange={(e) =>
                setNewAlert({ ...newAlert, targetPrice: e.target.value })
              }
            />
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
              onClick={createAlert}
              disabled={!newAlert.token || !newAlert.targetPrice}
              className="flex-1"
            >
              Create Alert
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
