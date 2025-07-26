"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Bell, Moon, Sun, Globe, Shield, Wallet } from "lucide-react";

export const PortfolioSettings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");
  const [gasPreference, setGasPreference] = useState("standard");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <span>Dark Mode</span>
            </div>
            <Button variant="outline" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5" />
              <span>Display Currency</span>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="ETH">ETH</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Trading Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Slippage Tolerance (%)</label>
            <Input
              type="number"
              value={slippageTolerance}
              onChange={(e) => setSlippageTolerance(e.target.value)}
              min="0.1"
              max="5"
              step="0.1"
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2">Gas Price Preference</label>
            <div className="flex space-x-2">
              {["slow", "standard", "fast"].map((speed) => (
                <Button
                  key={speed}
                  variant={gasPreference === speed ? "primary" : "outline"}
                  onClick={() => setGasPreference(speed)}
                  className="capitalize"
                >
                  {speed}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5" />
              <span>Price Alerts</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5" />
              <div>
                <p className="font-medium">Advanced Security</p>
                <p className="text-sm text-gray-600">
                  Enable 2FA and email notifications for important actions
                </p>
              </div>
            </div>
            <Button variant="primary">Configure</Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-5 h-5" />
              <div>
                <p className="font-medium">Connected Wallets</p>
                <p className="text-sm text-gray-600">
                  Manage your connected wallet addresses
                </p>
              </div>
            </div>
            <Button variant="primary">Manage</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
