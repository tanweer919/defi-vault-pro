"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLimitOrders } from "@/lib/hooks/useLimitOrders";
import { Clock, X, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const ActiveOrders: React.FC = () => {
  const { orders, isLoading, cancelLimitOrder } = useLimitOrders();

  if (isLoading) {
    return (
      <Card className="p-6" gradient>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  const activeOrders =
    orders?.filter((order) => order.status === "active") || [];

  return (
    <Card className="p-6" gradient>
      <h3 className="text-xl font-semibold mb-4">Active Orders</h3>

      {activeOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No active orders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium">
                      {order.makingAmount} → {order.takingAmount}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      {order.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Created{" "}
                    {formatDistanceToNow(new Date(order.createdAt || 0), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelLimitOrder(order.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};
