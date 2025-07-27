"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Target,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: Zap,
      label: "Swap Tokens",
      href: "/swap",
      color: "bg-blue-500 text-white",
    },
    {
      icon: PlusCircle,
      label: "Add Funds",
      href: "/deposit",
      color: "bg-green-500 text-white",
    },
    {
      icon: Target,
      label: "Limit Orders",
      href: "/orders",
      color: "bg-purple-500 text-white",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/analytics",
      color: "bg-orange-500 text-white",
    },
  ];

  return (
    <Card className="p-6" gradient>
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Button
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-sm transition-shadow"
            >
              <div className={`p-2 rounded-full ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
};
