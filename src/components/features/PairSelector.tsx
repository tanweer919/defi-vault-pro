"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search } from "lucide-react";
import { TokenPair } from "@/lib/hooks/useTokenPairs";

interface PairSelectorProps {
  pairs: TokenPair[];
  selectedPair?: TokenPair | null;
  onPairSelect: (pair: TokenPair) => void;
  loading?: boolean;
}

export function PairSelector({
  pairs,
  selectedPair,
  onPairSelect,
  loading = false,
}: PairSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPairs = pairs.filter((pair) =>
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePairSelect = (pair: TokenPair) => {
    onPairSelect(pair);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <motion.button
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-[140px]"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        disabled={loading}
      >
        <span className="truncate">
          {selectedPair?.symbol || "Select Pair"}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search pairs..."
                  className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Pairs List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredPairs.length > 0 ? (
                filteredPairs.map((pair, index) => (
                  <motion.button
                    key={`${pair.baseToken}-${pair.quoteToken}`}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handlePairSelect(pair)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ x: 4 }}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {pair.symbol}
                    </span>
                    {selectedPair?.baseToken === pair.baseToken &&
                      selectedPair?.quoteToken === pair.quoteToken && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                  </motion.button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pairs found</p>
                  <p className="text-xs mt-1">Try adjusting your search</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {pairs.length} pairs available
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
