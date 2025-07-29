import { useState, useEffect, useCallback } from "react";
import { useAccount, useChainId } from "wagmi";

export interface EnhancedTransaction {
  id: string;
  type:
    | "swap"
    | "transfer"
    | "approval"
    | "deposit"
    | "withdrawal"
    | "mint"
    | "burn";
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  fromToken: {
    symbol: string;
    amount: string;
    logo?: string;
    address?: string;
    name?: string;
    decimals?: number;
  };
  toToken: {
    symbol: string;
    amount: string;
    logo?: string;
    address?: string;
    name?: string;
    decimals?: number;
  };
  status: "success" | "pending" | "failed";
  gasUsed: string;
  gasPrice: string;
  gasCostEth?: string;
  protocol?: string;
  priceImpact?: string;
  slippage?: string;
  effectivePrice?: string;
  blockNumber?: string;
  logIndex?: string;
  eventId?: string;
  description?: string;
  routes?: Array<{
    protocol: string;
    fromTokenAddress: string;
    toTokenAddress: string;
    part: number;
  }>;
  protocols?: Array<{
    name: string;
    part: number;
    fromTokenAddress: string;
    toTokenAddress: string;
  }>;
}

export interface TransactionFilters {
  eventTypes?: string[];
  protocols?: string[];
  tokens?: string[];
  minAmount?: string;
  maxAmount?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

export interface UseTransactionHistoryResult {
  transactions: EnhancedTransaction[];
  loading: boolean;
  error: string | null;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  fetchSwapHistory: (filters?: TransactionFilters) => Promise<void>;
  searchTransactions: (filters: TransactionFilters) => Promise<void>;
  availableProtocols: string[];
  refreshData: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useTransactionHistory = (): UseTransactionHistoryResult => {
  const { address } = useAccount();
  const chainId = useChainId();

  const [transactions, setTransactions] = useState<EnhancedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const formatTransaction = useCallback(
    (tx: Record<string, unknown>): EnhancedTransaction => {
      // Helper function to safely extract nested properties
      const getNestedProp = (obj: unknown, path: string): unknown => {
        if (!obj || typeof obj !== "object") return undefined;
        const parts = path.split(".");
        let current = obj as Record<string, unknown>;
        for (const part of parts) {
          current = current[part] as Record<string, unknown>;
          if (current === undefined || current === null) return undefined;
        }
        return current;
      };

      return {
        id: (tx.hash as string) || (tx.eventId as string),
        type: ((tx.input as string) ||
          (tx.eventType as string) ||
          (tx.type as string) ||
          "transfer") as EnhancedTransaction["type"],
        hash: (tx.hash as string) || (tx.txHash as string),
        timestamp: parseInt((tx.timeStamp as string) || "0") * 1000,
        from: (tx.from as string) || (tx.sender as string),
        to: (tx.to as string) || (tx.recipient as string),
        fromToken: {
          symbol: (getNestedProp(tx.fromToken, "symbol") as string) || "ETH",
          amount:
            (tx.fromAmount as string) ||
            (getNestedProp(tx.fromToken, "amount") as string) ||
            "0",
          logo: getNestedProp(tx.fromToken, "logoURI") as string | undefined,
          address: getNestedProp(tx.fromToken, "address") as string | undefined,
          name: getNestedProp(tx.fromToken, "name") as string | undefined,
          decimals: getNestedProp(tx.fromToken, "decimals") as
            | number
            | undefined,
        },
        toToken: {
          symbol: (getNestedProp(tx.toToken, "symbol") as string) || "Unknown",
          amount:
            (tx.toAmount as string) ||
            (getNestedProp(tx.toToken, "amount") as string) ||
            "0",
          logo: getNestedProp(tx.toToken, "logoURI") as string | undefined,
          address: getNestedProp(tx.toToken, "address") as string | undefined,
          name: getNestedProp(tx.toToken, "name") as string | undefined,
          decimals: getNestedProp(tx.toToken, "decimals") as number | undefined,
        },
        status:
          (tx.isError as string) === "0" || (tx.status as string) === "1"
            ? "success"
            : "failed",
        gasUsed: (tx.gasUsed as string) || "0",
        gasPrice: (tx.gasPrice as string) || "0",
        gasCostEth: tx.gasCostEth as string | undefined,
        protocol:
          (tx.protocol as string) ||
          (getNestedProp(tx.protocols, "0.name") as string),
        priceImpact:
          (tx.priceImpact as string) ||
          (getNestedProp(tx.details, "priceImpact") as string),
        slippage:
          (tx.slippage as string) ||
          (getNestedProp(tx.details, "slippage") as string),
        effectivePrice:
          (tx.effectivePrice as string) ||
          (getNestedProp(tx.details, "effectivePrice") as string),
        blockNumber: (tx.blockNumber as number)?.toString(),
        logIndex: (tx.logIndex as number)?.toString(),
        eventId: (tx.eventId as string) || (tx.id as string),
        description: (tx.description as string) || (tx.functionName as string),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        routes:
          (tx.routes as any) || (getNestedProp(tx.details, "routes") as any),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protocols: tx.protocols as any,
      };
    },
    [],
  );

  const fetchTransactions = useCallback(
    async (filters?: TransactionFilters) => {
      if (!address || !chainId) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: (filters?.limit || 50).toString(),
          ...(filters?.offset && { offset: filters.offset.toString() }),
        });

        if (filters?.eventTypes?.length) {
          params.append(
            "type",
            filters.eventTypes.includes("swap") ? "swaps" : "all",
          );
        }

        const response = await fetch(
          `/api/transactions/${chainId}/${address}?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.status}`);
        }

        const data = await response.json();
        const formattedTransactions = data.result.map(formatTransaction);

        if (filters?.offset && filters.offset > 0) {
          setTransactions((prev) => [...prev, ...formattedTransactions]);
        } else {
          setTransactions(formattedTransactions);
        }

        setHasMore(
          data.meta?.hasNext ||
            formattedTransactions.length === (filters?.limit || 50),
        );
        setOffset((filters?.offset || 0) + formattedTransactions.length);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch transactions";
        setError(errorMessage);
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    },
    [address, chainId, formatTransaction],
  );

  const fetchSwapHistory = useCallback(
    async (filters?: TransactionFilters) => {
      if (!address || !chainId) return;

      setLoading(true);
      setError(null);

      try {
        const endpoint = `/api/transactions/${chainId}/${address}/swaps`;
        const requestBody = {
          limit: filters?.limit || 50,
          offset: filters?.offset || 0,
          protocols: filters?.protocols,
          minAmount: filters?.minAmount,
          maxAmount: filters?.maxAmount,
          startTime: filters?.startTime,
          endTime: filters?.endTime,
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch swap history: ${response.status}`);
        }

        const data = await response.json();
        const formattedTransactions = data.result.map(formatTransaction);

        if (filters?.offset && filters.offset > 0) {
          setTransactions((prev) => [...prev, ...formattedTransactions]);
        } else {
          setTransactions(formattedTransactions);
        }

        setHasMore(
          data.meta?.hasNext ||
            formattedTransactions.length === (filters?.limit || 50),
        );
        setOffset((filters?.offset || 0) + formattedTransactions.length);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch swap history";
        setError(errorMessage);
        console.error("Error fetching swap history:", err);
      } finally {
        setLoading(false);
      }
    },
    [address, chainId, formatTransaction],
  );

  const searchTransactions = useCallback(
    async (filters: TransactionFilters) => {
      if (!address || !chainId) return;

      setLoading(true);
      setError(null);

      try {
        const endpoint = `/api/transactions/${chainId}/${address}/search`;
        const requestBody = {
          chainId: parseInt(chainId.toString()),
          ...filters,
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to search transactions: ${response.status}`);
        }

        const data = await response.json();
        const formattedTransactions = data.result.map(formatTransaction);

        if (filters.offset && filters.offset > 0) {
          setTransactions((prev) => [...prev, ...formattedTransactions]);
        } else {
          setTransactions(formattedTransactions);
        }

        setHasMore(data.meta?.hasNext || false);
        setOffset((filters.offset || 0) + formattedTransactions.length);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search transactions";
        setError(errorMessage);
        console.error("Error searching transactions:", err);
      } finally {
        setLoading(false);
      }
    },
    [address, chainId, formatTransaction],
  );

  const refreshData = useCallback(async () => {
    setOffset(0);
    await fetchTransactions();
  }, [fetchTransactions]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchTransactions({ offset });
  }, [fetchTransactions, hasMore, loading, offset]);

  // Get unique protocols from current transactions
  const availableProtocols = Array.from(
    new Set(transactions.map((tx) => tx.protocol).filter(Boolean)),
  ) as string[];

  // Auto-fetch on address/chain change
  useEffect(() => {
    if (address && chainId) {
      setOffset(0);
      setTransactions([]);
      fetchTransactions();
    }
  }, [address, chainId, fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchSwapHistory,
    searchTransactions,
    availableProtocols,
    refreshData,
    hasMore,
    loadMore,
  };
};
