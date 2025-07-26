"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LimitOrderInterface } from "@/components/features/LimitOrders";
import { ActiveOrders } from "@/components/features/ActiveOrders";
import { Plus, List, TrendingUp } from "lucide-react";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("create");

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
            Create and manage your limit orders
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
          {activeTab === "history" && <div>Order History Component</div>}
        </div>

        {/* Order Book */}
        <Card className="p-6" gradient>
          <h3 className="text-lg font-semibold mb-4">Order Book</h3>
          <div className="space-y-2">
            <div className="text-sm text-gray-600 grid grid-cols-3 gap-2">
              <span>Price</span>
              <span>Amount</span>
              <span>Total</span>
            </div>

            {/* Sell Orders */}
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="text-sm grid grid-cols-3 gap-2 text-red-600"
                >
                  <span>$2,{1850 + i * 10}</span>
                  <span>0.{5 - i}23</span>
                  <span>$1,{234 + i * 50}</span>
                </div>
              ))}
            </div>

            {/* Current Price */}
            <div className="py-2 border-t border-b text-center font-semibold">
              $2,845.67
            </div>

            {/* Buy Orders */}
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="text-sm grid grid-cols-3 gap-2 text-green-600"
                >
                  <span>$2,{840 - i * 10}</span>
                  <span>0.{i + 1}45</span>
                  <span>$1,{200 - i * 30}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
