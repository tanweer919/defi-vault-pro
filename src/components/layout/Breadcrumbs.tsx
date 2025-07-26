"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = [
    { name: "Dashboard", href: "/", icon: Home },
    ...pathSegments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: `/${pathSegments.slice(0, index + 1).join("/")}`,
      icon: null,
    })),
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbs.map((item, index) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2"
        >
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          <Link
            href={item.href}
            className={`flex items-center space-x-1 hover:text-blue-600 transition-colors ${
              index === breadcrumbs.length - 1
                ? "text-blue-600 font-medium"
                : ""
            }`}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            <span>{item.name}</span>
          </Link>
        </motion.div>
      ))}
    </nav>
  );
};
