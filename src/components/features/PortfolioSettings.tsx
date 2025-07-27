"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Wallet,
  Save,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface SettingsData {
  darkMode: boolean;
  notifications: boolean;
  currency: string;
  slippageTolerance: string;
  gasPreference: string;
  priceAlerts: boolean;
  autoRefresh: boolean;
}

const defaultSettings: SettingsData = {
  darkMode: false,
  notifications: true,
  currency: "USD",
  slippageTolerance: "0.5",
  gasPreference: "standard",
  priceAlerts: true,
  autoRefresh: true,
};

export const PortfolioSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("portfolioSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem("portfolioSettings", JSON.stringify(settings));
      setHasChanges(false);
      toast.success("Settings saved successfully!");

      // Dispatch a custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("settingsChanged", { detail: settings }),
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="space-y-6">
      {/* Save/Reset Actions */}
      {hasChanges && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">You have unsaved changes</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={resetSettings}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button variant="primary" size="sm" onClick={saveSettings}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {settings.darkMode ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <span>Dark Mode</span>
            </div>
            <Button
              variant="outline"
              onClick={() => updateSetting("darkMode", !settings.darkMode)}
            >
              {settings.darkMode ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5" />
              <span>Display Currency</span>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => updateSetting("currency", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="ETH">ETH</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5" />
              <span>Auto Refresh Data</span>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                updateSetting("autoRefresh", !settings.autoRefresh)
              }
            >
              {settings.autoRefresh ? "Enabled" : "Disabled"}
            </Button>
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
              value={settings.slippageTolerance}
              onChange={(e) =>
                updateSetting("slippageTolerance", e.target.value)
              }
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
                  variant={
                    settings.gasPreference === speed ? "primary" : "outline"
                  }
                  onClick={() => updateSetting("gasPreference", speed)}
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
              onClick={() =>
                updateSetting("priceAlerts", !settings.priceAlerts)
              }
            >
              {settings.priceAlerts ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5" />
              <span>Transaction Notifications</span>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                updateSetting("notifications", !settings.notifications)
              }
            >
              {settings.notifications ? "Enabled" : "Disabled"}
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
              <span>Clear Cache</span>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("portfolioSettings");
                localStorage.removeItem("demoMode");
                toast.success("Cache cleared successfully!");
              }}
            >
              Clear
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-5 h-5" />
              <span>Export Settings</span>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const blob = new Blob([JSON.stringify(settings, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "portfolio-settings.json";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Settings exported!");
              }}
            >
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Button at Bottom */}
      <Card className="p-4">
        <Button
          onClick={saveSettings}
          disabled={!hasChanges}
          className="w-full"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {hasChanges ? "Save All Changes" : "All Changes Saved"}
        </Button>
      </Card>
    </div>
  );
};
