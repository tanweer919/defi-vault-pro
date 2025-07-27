"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import { Eye, X, AlertTriangle } from "lucide-react";

export const DemoBanner: React.FC = () => {
  const { isDemoMode, disableDemoMode, isDemoAvailable } = useDemoMode();

  // Don't show banner if demo is not available or not in demo mode
  if (!isDemoMode || !isDemoAvailable) return null;

  const handleExitDemo = () => {
    disableDemoMode();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-lg">DEMO MODE</span>
              <p className="text-sm opacity-90">
                You&apos;re viewing sample data for demonstration purposes. This
                is not real portfolio data.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitDemo}
              className="text-white hover:bg-white/20 border-white/30"
            >
              <X className="w-4 h-4 mr-2" />
              Exit Demo
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
