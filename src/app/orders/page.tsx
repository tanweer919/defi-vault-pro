"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LimitOrderInterface } from "@/components/features/LimitOrders";
import { ActiveOrders } from "@/components/features/ActiveOrders";
import { RealTimeOrderBook } from "@/components/features/RealTimeOrderBook";
import { Plus, List, TrendingUp } from "lucide-react";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("create");

  // Default chain for the order book
  const defaultChainId = 1; // Ethereum mainnet

  const tabs = [
    { id: "create", label: "Create Order", icon: Plus },
    { id: "active", label: "Active Orders", icon: List },
    { id: "history", label: "Order History", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Limit Orders</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your limit orders with real-time market data
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Card className="p-2" gradient>
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === "create" && <LimitOrderInterface />}
          {activeTab === "active" && <ActiveOrders />}
          {activeTab === "history" && (
            <Card className="p-6" gradient>
              <h3 className="text-lg font-semibold mb-4">Order History</h3>
              <p className="text-gray-600">
                Order history component coming soon...
              </p>
            </Card>
          )}
        </div>

        {/* Real-Time Order Book */}
        <div className="lg:col-span-1">
          <RealTimeOrderBook
            chainId={defaultChainId}
            className="h-fit sticky top-6"
          />
        </div>
      </div>
    </div>
  );
}
