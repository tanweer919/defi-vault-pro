import { useState, useEffect, useCallback } from "react";
import { PortfolioData, TokenBalance } from "@/lib/types";
import { isDemoAvailable } from "@/lib/config/demo";

// Custom event for demo mode changes
const DEMO_MODE_CHANGE_EVENT = "demoModeChange";

// Global state to ensure consistency across all hook instances
let globalDemoState = false;

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(globalDemoState);

  // Sync with global state on mount
  useEffect(() => {
    setIsDemoMode(globalDemoState);
  }, []);

  // Check if demo mode is enabled from localStorage or URL params
  useEffect(() => {
    // If demo is not allowed, don't enable demo mode
    if (!isDemoAvailable()) {
      globalDemoState = false;
      setIsDemoMode(false);
      localStorage.removeItem("demoMode"); // Clean up any existing demo mode
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const demoFromUrl = urlParams.get("demo") === "true";
    const demoFromStorage = localStorage.getItem("demoMode") === "true";

    const shouldBeInDemoMode = demoFromUrl || demoFromStorage;

    if (globalDemoState !== shouldBeInDemoMode) {
      globalDemoState = shouldBeInDemoMode;
      setIsDemoMode(shouldBeInDemoMode);
    }
  }, []);

  // Listen for demo mode changes from other components
  useEffect(() => {
    const handleDemoModeChange = (event: CustomEvent) => {
      const newDemoMode = event.detail.isDemoMode;
      globalDemoState = newDemoMode;
      setIsDemoMode(newDemoMode);
    };

    window.addEventListener(
      DEMO_MODE_CHANGE_EVENT,
      handleDemoModeChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        DEMO_MODE_CHANGE_EVENT,
        handleDemoModeChange as EventListener,
      );
    };
  }, []);

  const enableDemoMode = useCallback(() => {
    if (!isDemoAvailable()) {
      console.warn("Demo mode is not available");
      return;
    }

    globalDemoState = true;
    setIsDemoMode(true);
    localStorage.setItem("demoMode", "true");

    // Dispatch custom event to notify other components
    window.dispatchEvent(
      new CustomEvent(DEMO_MODE_CHANGE_EVENT, {
        detail: { isDemoMode: true },
      }),
    );
  }, []);

  const disableDemoMode = useCallback(() => {
    globalDemoState = false;
    setIsDemoMode(false);
    localStorage.removeItem("demoMode");

    // Dispatch custom event to notify other components
    window.dispatchEvent(
      new CustomEvent(DEMO_MODE_CHANGE_EVENT, {
        detail: { isDemoMode: false },
      }),
    );
  }, []);

  const getDemoPortfolioData = useCallback((): PortfolioData => {
    const demoItems: TokenBalance[] = [
      {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        symbol: "ETH",
        name: "Ethereum",
        balance: "2.5",
        decimals: 18,
        price: 2400,
        value: 6000,
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      },
      {
        address: "0xa0b86a33e6441c78c71c9e84f5e1ad15b2b3b7c6",
        symbol: "USDC",
        name: "USD Coin",
        balance: "8500",
        decimals: 6,
        price: 1,
        value: 8500,
        logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      },
      {
        address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        symbol: "WBTC",
        name: "Wrapped Bitcoin",
        balance: "0.15",
        decimals: 8,
        price: 43000,
        value: 6450,
        logo: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
      },
      {
        address: "0x514910771af9ca656af840dff83e8264ecf986ca",
        symbol: "LINK",
        name: "Chainlink",
        balance: "450",
        decimals: 18,
        price: 15.2,
        value: 6840,
        logo: "https://cryptologos.cc/logos/chainlink-link-logo.png",
      },
    ];

    const totalValue = demoItems.reduce((sum, item) => sum + item.value, 0);

    return {
      items: demoItems,
      totalValue,
      change24h: 12.4, // Demo 24h change
      chainId: 1, // Ethereum mainnet
    };
  }, []);

  return {
    isDemoMode: isDemoMode && isDemoAvailable(), // Only return true if demo is both enabled and allowed
    enableDemoMode,
    disableDemoMode,
    getDemoPortfolioData,
    isDemoAvailable: isDemoAvailable(), // Expose whether demo is available
  };
};
