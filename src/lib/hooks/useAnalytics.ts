import { useAccount, useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import oneInchApi from "../api/oneInchApi";
import { PortfolioData } from "../types";
import { ChainId } from "../config/wagmi";
import { useDemoMode } from "./useDemoMode";

interface Transaction {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  valueInEth: string;
  input: string;
  fromToken?: {
    symbol: string;
    logoURI: string | null;
  };
  toToken?: {
    symbol: string;
    logoURI: string | null;
  };
  fromAmount?: string;
  toAmount?: string;
  status: string;
  gasUsed: string;
  gasPrice: string;
  gasCostEth: string;
}

interface AnalyticsData {
  totalPnl: number;
  totalPnlPercent: number;
  winRate: number;
  avgYield: number;
  riskScore: string;
  riskValue: number;
  performanceData: Array<{
    date: string;
    value: number;
    pnl: number;
  }>;
  profitLossData: Array<{
    period: string;
    profit: number;
    loss: number;
  }>;
}

export const useAnalytics = (
  portfolioData?: PortfolioData,
  timeRange: string = "7d",
) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { isDemoMode } = useDemoMode();

  // Fetch transaction history for real analytics
  const {
    data: transactionResponse,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery<{
    result: Transaction[];
    status: string;
    message: string;
  }>({
    queryKey: ["transactions", address, chainId, isDemoMode],
    queryFn: async () => {
      if (!address || !chainId)
        return { result: [], status: "0", message: "No address" };

      try {
        const response = await oneInchApi.getTransactionHistory(
          address,
          chainId as ChainId,
          100,
          isDemoMode,
        );
        return response;
      } catch (error) {
        console.warn("Failed to fetch transaction history:", error);
        return { result: [], status: "0", message: "API Error" };
      }
    },
    enabled: !!address && !!chainId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate analytics based on real data
  const analytics = useMemo((): AnalyticsData => {
    const transactions = transactionResponse?.result || [];

    if (isDemoMode) {
      // Return demo analytics
      return {
        totalPnl: 1283.45,
        totalPnlPercent: 4.7,
        winRate: 68.3,
        avgYield: 8.9,
        riskScore: "Medium",
        riskValue: 6.4,
        performanceData: generateDemoPerformanceData(timeRange),
        profitLossData: generateDemoProfitLossData(timeRange),
      };
    }

    if (!portfolioData || !transactions) {
      return {
        totalPnl: 0,
        totalPnlPercent: 0,
        winRate: 0,
        avgYield: 0,
        riskScore: "Low",
        riskValue: 0,
        performanceData: [],
        profitLossData: [],
      };
    }

    // Calculate real analytics from transaction data
    const currentValue = portfolioData.totalValue || 0;

    // Calculate total invested amount from transaction history
    const swapTransactions = transactions.filter(
      (tx: Transaction) => tx.input === "swap" && tx.status === "1",
    );

    // Calculate invested amount (sum of all money put into DeFi)
    const totalInvested = swapTransactions.reduce(
      (sum: number, tx: Transaction) => {
        // Use the already converted ETH value from the API
        const ethValue = parseFloat(tx.valueInEth || "0");
        return sum + ethValue;
      },
      0,
    );

    // Calculate P&L
    const totalPnl = currentValue - totalInvested;
    const totalPnlPercent =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // Calculate win rate from successful vs failed transactions
    const successfulTxs = transactions.filter(
      (tx: Transaction) => tx.status === "1",
    ).length;
    const totalTxs = transactions.length;
    const winRate = totalTxs > 0 ? (successfulTxs / totalTxs) * 100 : 0;

    // Estimate yield based on P&L and time
    const oldestTx =
      transactions.length > 0
        ? Math.min(
            ...transactions.map((tx: Transaction) => parseInt(tx.timeStamp)),
          )
        : Date.now() / 1000;
    const daysSinceStart = (Date.now() / 1000 - oldestTx) / (24 * 3600);
    const avgYield =
      daysSinceStart > 0 && totalInvested > 0
        ? (totalPnl / totalInvested) * (365 / daysSinceStart) * 100
        : 0;

    // Calculate risk score based on portfolio concentration and volatility
    const riskValue = calculateRiskScore(portfolioData, transactions);
    const riskScore = riskValue < 3 ? "Low" : riskValue < 7 ? "Medium" : "High";

    return {
      totalPnl,
      totalPnlPercent,
      winRate,
      avgYield,
      riskScore,
      riskValue,
      performanceData: generateRealPerformanceData(
        portfolioData,
        transactions,
        timeRange,
      ),
      profitLossData: generateRealProfitLossData(transactions, timeRange),
    };
  }, [portfolioData, transactionResponse, timeRange, isDemoMode]);

  return {
    analytics,
    isLoading: transactionsLoading,
    error: transactionsError,
  };
};

// Helper function to calculate risk score
function calculateRiskScore(
  portfolioData: PortfolioData,
  transactions: Transaction[],
): number {
  // Simple risk calculation based on:
  // 1. Portfolio concentration (fewer assets = higher risk)
  // 2. Transaction frequency (higher frequency = higher risk)

  const assetCount = portfolioData.items?.length || 0;
  const concentrationRisk = assetCount === 0 ? 10 : Math.max(1, 8 - assetCount);

  const txCount = transactions.length;
  const activityRisk = Math.min(5, txCount / 10); // More transactions = more activity risk

  return Math.min(10, (concentrationRisk + activityRisk) / 2);
}

// Generate performance data based on real portfolio value and transactions
function generateRealPerformanceData(
  portfolioData: PortfolioData,
  transactions: Transaction[],
  timeRange: string,
) {
  const days =
    timeRange === "1d"
      ? 1
      : timeRange === "7d"
      ? 7
      : timeRange === "30d"
      ? 30
      : 90;
  const points = timeRange === "1d" ? 24 : days;
  const currentValue = portfolioData.totalValue || 0;

  // If no transactions, show flat line at current value
  if (transactions.length === 0) {
    return Array.from({ length: points }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (points - i - 1));
      return {
        date: date.toISOString().split("T")[0],
        value: currentValue,
        pnl: 0,
      };
    });
  }

  // Create performance data based on transaction timeline
  return Array.from({ length: points }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (points - i - 1));
    const dayTimestamp = date.getTime() / 1000;

    // Find transactions before this date
    const relevantTxs = transactions.filter(
      (tx: Transaction) => parseInt(tx.timeStamp) <= dayTimestamp,
    );

    // Estimate portfolio value at this point
    // This is simplified - real implementation would track token balances over time
    const progress = relevantTxs.length / transactions.length;
    const estimatedValue = currentValue * progress;

    return {
      date: date.toISOString().split("T")[0],
      value: estimatedValue,
      pnl: estimatedValue - currentValue * 0.8, // Rough P&L estimate
    };
  });
}

// Generate profit/loss data from real transactions
function generateRealProfitLossData(
  transactions: Transaction[],
  timeRange: string,
) {
  if (transactions.length === 0) {
    return [];
  }

  const periods =
    timeRange === "1d"
      ? 6
      : timeRange === "7d"
      ? 7
      : timeRange === "30d"
      ? 30
      : 12;
  const now = Date.now() / 1000;
  const periodLength =
    timeRange === "1d"
      ? 4 * 3600
      : timeRange === "7d"
      ? 24 * 3600
      : timeRange === "30d"
      ? 24 * 3600
      : 30 * 24 * 3600;

  return Array.from({ length: periods }, (_, i) => {
    const periodStart = now - (periods - i) * periodLength;
    const periodEnd = now - (periods - i - 1) * periodLength;

    const periodTxs = transactions.filter((tx: Transaction) => {
      const txTime = parseInt(tx.timeStamp);
      return txTime >= periodStart && txTime < periodEnd;
    });

    // Calculate profit/loss for this period
    const profit = periodTxs
      .filter(
        (tx: Transaction) =>
          parseFloat(tx.toAmount || "0") > parseFloat(tx.fromAmount || "0"),
      )
      .reduce(
        (sum: number, tx: Transaction) =>
          sum + parseFloat(tx.valueInEth || "0"),
        0,
      );

    const loss = periodTxs
      .filter(
        (tx: Transaction) =>
          parseFloat(tx.toAmount || "0") < parseFloat(tx.fromAmount || "0"),
      )
      .reduce(
        (sum: number, tx: Transaction) =>
          sum + parseFloat(tx.valueInEth || "0"),
        0,
      );

    return {
      period: `Period ${i + 1}`,
      profit,
      loss,
    };
  });
}

// Demo data generators (existing functionality for demo mode)
function generateDemoPerformanceData(timeRange: string) {
  const days =
    timeRange === "1d"
      ? 1
      : timeRange === "7d"
      ? 7
      : timeRange === "30d"
      ? 30
      : 90;
  const points = timeRange === "1d" ? 24 : days;
  const baseValue = 25000;

  return Array.from({ length: points }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (points - i - 1));
    const variation = (Math.random() - 0.5) * 0.15 + (i / points) * 0.08;

    return {
      date: date.toISOString().split("T")[0],
      value: baseValue + baseValue * variation,
      pnl: baseValue * variation,
    };
  });
}

function generateDemoProfitLossData(timeRange: string) {
  const periods =
    timeRange === "1d"
      ? 6
      : timeRange === "7d"
      ? 7
      : timeRange === "30d"
      ? 30
      : 12;

  return Array.from({ length: periods }, (_, i) => ({
    period: `Period ${i + 1}`,
    profit: Math.random() * 1000 + 200,
    loss: Math.random() * 500 + 50,
  }));
}
