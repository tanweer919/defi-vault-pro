"use client";

import React from "react";
import { motion } from "framer-motion";
import { SwapInterface } from "@/components/features/SwapInterface";
import { Card } from "@/components/ui/Card";
import { TrendingUp, Zap, Shield, BarChart3 } from "lucide-react";

export default function SwapPage() {
  const features = [
    {
      icon: Zap,
      title: "Best Rates",
      description: "Get the best swap rates across all DEXs",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Non-custodial swaps with full transparency",
    },
    {
      icon: BarChart3,
      title: "Smart Routing",
      description: "Automatically finds the optimal swap route",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Swap{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tokens
          </span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get the best rates for your token swaps using 1inch aggregation
        </p>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 text-center" hover gradient>
              <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Swap Interface */}
      <SwapInterface />
    </div>
  );
}
