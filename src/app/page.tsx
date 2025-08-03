"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PortfolioDashboard } from "@/components/features/PortfolioDashboard";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  Wallet,
  Eye,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// Subtle gradient stage wrapper for consistent hero background across pages
function GradientStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
        <div className="absolute inset-0 opacity-[0.06] [background:radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[32rem] w-[32rem] rounded-full blur-3xl opacity-30 bg-gradient-to-r from-blue-400 via-fuchsia-400 to-emerald-400" />
      </div>
      {children}
    </div>
  );
}

export default function HomePage() {
  const { isConnected } = useWalletState();
  const { isDemoMode, enableDemoMode, isDemoAvailable } = useDemoMode();
  const { openConnectModal } = useConnectModal();

  const handleEnableDemo = () => {
    enableDemoMode();
  };

  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Portfolio Tracking",
      description:
        "Monitor your DeFi investments across chains with real‑time balances, PnL, and historical insights.",
      accent: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Smart Swaps",
      description:
        "Route orders for best execution using 1inch aggregation. Gas‑aware, slippage‑smart, chain‑ready.",
      accent: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description:
        "Non‑custodial by design. Clear approvals, readable txs, and audit‑friendly activity.",
      accent: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <GradientStage>
      {/* Page wrapper spacing */}
      <div className="space-y-14 md:space-y-20">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pt-10 md:pt-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-3 py-1 text-sm text-slate-600 shadow-sm">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            DeFi experience, beautifully simple
          </div>

          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Your DeFi{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>

          <p className="mt-4 md:mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Track, swap, and analyze your portfolio with real‑time analytics and
            best‑execution routing powered by 1inch.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {isConnected || isDemoMode ? (
              <Link href="/portfolio">
                <Button
                  size="lg"
                  className="px-7 md:px-9 h-12 md:h-14 text-base md:text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Portfolio
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="px-7 md:px-9 h-12 md:h-14 text-base md:text-lg bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20"
                onClick={handleConnectWallet}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </Button>
            )}

            <Link href="/swap">
              <Button
                variant="outline"
                size="lg"
                className="px-7 md:px-9 h-12 md:h-14 text-base md:text-lg border-slate-200 bg-white/70 backdrop-blur hover:bg-white"
              >
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Start Swapping
              </Button>
            </Link>

            {!isConnected && !isDemoMode && isDemoAvailable && (
              <Button
                variant="secondary"
                size="lg"
                className="px-7 md:px-9 h-12 md:h-14 text-base md:text-lg bg-gradient-to-r from-slate-100 to-white border border-slate-200 hover:from-white hover:to-white"
                onClick={handleEnableDemo}
              >
                <Eye className="w-5 h-5 mr-2" />
                Try Demo
              </Button>
            )}
          </div>
        </motion.section>

        {/* Feature Cards */}
        <section className="container mx-auto px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.06 }}
                className="h-full"
              >
                <Card
                  className="relative p-6 md:p-7 h-full flex flex-col border border-slate-200/80 bg-white/70 backdrop-blur rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  hover
                  gradient
                >
                  <div className="absolute -top-3 -left-3 h-20 w-20 rounded-full blur-2xl opacity-40 bg-gradient-to-br from-[var(--tw-gradient-from)] to-[var(--tw-gradient-to)]" />
                  <div
                    className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-slate-900/10 mb-4`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 flex-1">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Portfolio Preview */}
        {(isConnected || isDemoMode) && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-3 md:p-4 shadow-sm">
              <PortfolioDashboard />
            </div>
          </motion.section>
        )}
      </div>
    </GradientStage>
  );
}
