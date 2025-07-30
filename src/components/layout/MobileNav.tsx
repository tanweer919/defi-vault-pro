"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  BarChart3,
  TrendingUp,
  History,
  Activity,
  Wallet,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      description: "Overview & quick actions",
    },
    {
      name: "Portfolio",
      href: "/portfolio",
      icon: BarChart3,
      description: "Track your investments",
    },
    {
      name: "Swap",
      href: "/swap",
      icon: TrendingUp,
      description: "Exchange tokens",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: Activity,
      description: "Performance insights",
    },
    {
      name: "History",
      href: "/history",
      icon: History,
      description: "Transaction records",
    },
    {
      name: "Orders",
      href: "/orders",
      icon: BarChart3,
      description: "Limit orders",
    },
  ];

  // Ensure component is mounted before using portals
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                  style={{ zIndex: 999998 }}
                  onClick={() => setIsOpen(false)}
                />

                {/* Mobile Menu */}
                <motion.div
                  initial={{ opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 120 }}
                  className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto"
                  style={{ zIndex: 999999 }}
                >
                  {/* Header with Logo */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold">DefiVault Pro</h2>
                          <p className="text-blue-100 text-sm">Navigation</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Close navigation menu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Connect Button Container */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-sm text-blue-100 mb-3 font-medium">
                        Wallet Connection
                      </div>
                      <div className="w-full">
                        <div className="w-full [&_button]:!w-full [&_button]:!bg-white/15 [&_button]:!border-white/20 [&_button]:!text-white [&_button]:!rounded-lg [&_button]:!py-3 [&_button]:!px-4 [&_button]:!font-medium [&_button]:!text-sm [&_button:hover]:!bg-white/25 [&_button:hover]:!border-white/30 [&>div]:!w-full">
                          <ConnectButton />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="p-6">
                    <nav className="space-y-1">
                      {navigation.map((item, index) => (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                              pathname === item.href
                                ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  pathname === item.href
                                    ? "bg-blue-100"
                                    : "bg-gray-100 group-hover:bg-gray-200"
                                }`}
                              >
                                <item.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-60" />
                          </Link>
                        </motion.div>
                      ))}
                    </nav>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          © 2025 DefiVault Pro
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Secure DeFi Portfolio Management
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
