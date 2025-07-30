import { useState, useEffect, useCallback } from "react";
import { usePortfolio } from "./usePortfolio";
import toast from "react-hot-toast";

interface PriceAlert {
  id: string;
  tokenAddress: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  lastCheckedPrice?: number;
}

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const { portfolioData } = usePortfolio();

  // Load alerts from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceAlerts");
    if (savedAlerts) {
      try {
        const parsedAlerts = JSON.parse(savedAlerts).map(
          (alert: {
            id: string;
            tokenAddress: string;
            symbol: string;
            targetPrice: number;
            condition: "above" | "below";
            isActive: boolean;
            createdAt: string;
            triggeredAt?: string;
            lastCheckedPrice?: number;
          }) => ({
            ...alert,
            createdAt: new Date(alert.createdAt),
            triggeredAt: alert.triggeredAt
              ? new Date(alert.triggeredAt)
              : undefined,
          }),
        );
        setAlerts(parsedAlerts);
      } catch (error) {
        console.error("Error parsing price alerts:", error);
      }
    }
  }, []);

  // Save alerts to localStorage whenever alerts change
  useEffect(() => {
    localStorage.setItem("priceAlerts", JSON.stringify(alerts));
  }, [alerts]);

  // Check alerts against current prices
  const checkAlerts = useCallback(() => {
    if (!portfolioData?.items || alerts.length === 0) return;

    const updatedAlerts = alerts.map((alert) => {
      if (!alert.isActive || alert.triggeredAt) return alert;

      // Find current price from portfolio data
      const portfolioItem = portfolioData.items.find(
        (item) =>
          item.address.toLowerCase() === alert.tokenAddress.toLowerCase() ||
          item.symbol.toLowerCase() === alert.symbol.toLowerCase(),
      );

      if (!portfolioItem) return alert;

      const currentPrice = portfolioItem.price;
      const updatedAlert = { ...alert, lastCheckedPrice: currentPrice };

      // Check if alert condition is met
      const shouldTrigger =
        (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
        (alert.condition === "below" && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        // Trigger the alert
        const triggeredAlert = {
          ...updatedAlert,
          triggeredAt: new Date(),
          isActive: false, // Deactivate after triggering
        };

        // Show notification
        const message = `🚨 Price Alert: ${alert.symbol} is now ${
          alert.condition
        } $${alert.targetPrice}! Current price: $${currentPrice.toFixed(2)}`;
        toast.success(message, { duration: 10000 });

        // Try to show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification("DeFi Vault Pro - Price Alert", {
            body: message,
            icon: "/favicon.ico",
            tag: `price-alert-${alert.id}`,
          });
        }

        return triggeredAlert;
      }

      return updatedAlert;
    });

    setAlerts(updatedAlerts);
  }, [portfolioData, alerts]);

  // Check alerts every 30 seconds when portfolio data updates
  useEffect(() => {
    if (!portfolioData) return;

    checkAlerts();

    const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [portfolioData, checkAlerts]);

  // Request notification permission on first load
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const createAlert = (
    alertData: Omit<PriceAlert, "id" | "createdAt" | "isActive">,
  ) => {
    const newAlert: PriceAlert = {
      ...alertData,
      id: Date.now().toString(),
      createdAt: new Date(),
      isActive: true,
    };

    setAlerts((prev) => [...prev, newAlert]);
    toast.success("Price alert created successfully!");
    return newAlert;
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    toast.success("Alert deleted");
  };

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, isActive: !alert.isActive, triggeredAt: undefined }
          : alert,
      ),
    );
  };

  const clearTriggeredAlerts = () => {
    setAlerts((prev) => prev.filter((alert) => !alert.triggeredAt));
    toast.success("Triggered alerts cleared");
  };

  const activeAlerts = alerts.filter(
    (alert) => alert.isActive && !alert.triggeredAt,
  );
  const triggeredAlerts = alerts.filter((alert) => alert.triggeredAt);

  return {
    alerts,
    activeAlerts,
    triggeredAlerts,
    createAlert,
    deleteAlert,
    toggleAlert,
    clearTriggeredAlerts,
    checkAlerts,
  };
};
