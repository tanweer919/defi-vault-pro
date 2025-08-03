"use client";

import React from "react";
import { motion } from "framer-motion";
import { SwapInterface } from "@/components/features/SwapInterface";
import { Card } from "@/components/ui/Card";
import { Zap, Shield, BarChart3 } from "lucide-react";

function GradientStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background:radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[26rem] w-[26rem] rounded-full blur-3xl opacity-30 bg-gradient-to-r from-blue-400 via-fuchsia-400 to-emerald-400" />
      </div>
      {children}
    </div>
  );
}

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
    <GradientStage>
      <div className="space-y-8 md:space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Swap{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tokens
            </span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Get the best rates for your token swaps using 1inch aggregation
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card
                className="p-6 text-center border border-slate-200/80 bg-white/70 backdrop-blur"
                hover
                gradient
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-4 mx-auto shadow-lg shadow-slate-900/10">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Swap Interface */}
        <Card
          className="p-3 md:p-4 border border-slate-200 bg-white/70 backdrop-blur"
          gradient
        >
          <SwapInterface />
        </Card>
      </div>
    </GradientStage>
  );
}
