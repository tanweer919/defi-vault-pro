import { useAccount, useChainId } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import oneInchApi from "../api/oneInchApi";
import { ChainId } from "../config/wagmi";
import { useDemoMode } from "./useDemoMode";

interface CreateLimitOrderParams {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  expiry: number;
}

interface LimitOrderData {
  id: string;
  orderId: string;
  maker: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  filledAmount: string;
  remainingAmount: string;
  chainId: number;
}

interface OrderBookData {
  pair: string;
  bids: Array<{
    price: string;
    amount: string;
    total: string;
  }>;
  asks: Array<{
    price: string;
    amount: string;
    total: string;
  }>;
  stats: {
    bestBid: string;
    bestAsk: string;
    spread: string;
    volume24h: string;
  };
}

interface MarketStatsData {
  global: {
    totalOrders: number;
    activeOrders: number;
    totalVolume24h: string;
    topPairs: Array<{
      pair: string;
      volume: string;
      orders: number;
    }>;
  };
}

interface OptimalPricingData {
  strategies: Array<{
    name: string;
    description: string;
    suggestedPrice: string;
    expectedFillTime: string;
    fillProbability: string;
  }>;
  marketAnalysis: {
    volatility: string;
    liquidity: string;
    trend: string;
  };
  recommendations: string[];
}

export const useLimitOrders = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { isDemoMode } = useDemoMode();

  // Get user's limit orders
  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["limitOrders", address, chainId, isDemoMode],
    queryFn: async (): Promise<LimitOrderData[]> => {
      if (!address || !chainId) return [];
      return await oneInchApi.getLimitOrders(chainId as ChainId, address);
    },
    enabled: !!address && !!chainId,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Get order statistics
  const { data: orderStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["limitOrdersCount", address, chainId, isDemoMode],
    queryFn: async () => {
      if (!chainId) return null;
      return await oneInchApi.getLimitOrdersCount(
        chainId as ChainId,
        address ? { maker: address } : undefined,
      );
    },
    enabled: !!chainId,
    refetchInterval: 60000,
  });

  // Get active token pairs for suggestions
  const { data: activeTokenPairs, isLoading: isLoadingPairs } = useQuery({
    queryKey: ["activeTokenPairs", chainId, isDemoMode],
    queryFn: async () => {
      if (!chainId) return [];
      return await oneInchApi.getActiveTokenPairs(chainId as ChainId);
    },
    enabled: !!chainId,
    staleTime: 300000, // 5 minutes
  });

  // Get order events for history
  const { data: orderEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["limitOrderEvents", chainId, isDemoMode],
    queryFn: async () => {
      if (!chainId) return [];
      return await oneInchApi.getLimitOrderEvents(chainId as ChainId);
    },
    enabled: !!chainId,
    refetchInterval: 30000,
  });

  // Create order mutation
  const createMutation = useMutation({
    mutationFn: async (params: CreateLimitOrderParams) => {
      if (!address || !chainId) throw new Error("Wallet not connected");

      // Convert amounts to wei/token units (assuming 18 decimals for simplicity)
      const makingAmount = (
        parseFloat(params.sellAmount) *
        10 ** 18
      ).toString();
      const takingAmount = (parseFloat(params.buyAmount) * 10 ** 18).toString();

      const orderData = {
        makerAsset: params.sellToken,
        takerAsset: params.buyToken,
        makingAmount,
        takingAmount,
        salt: Date.now().toString(),
        expiry: params.expiry,
        maker: address,
        demo: isDemoMode,
      };

      return await oneInchApi.createLimitOrder(chainId as ChainId, orderData);
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!chainId) throw new Error("Chain not connected");
      return await oneInchApi.cancelLimitOrder(chainId as ChainId, orderId);
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Get order details by hash
  const getOrderByHash = async (orderHash: string) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getLimitOrderByHash(chainId as ChainId, orderHash);
  };

  // Get calculated making amount for price estimation
  const getQuote = async (
    makerAsset: string,
    takerAsset: string,
    takingAmount: string,
  ) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getCalculatedMakingAmount(
      chainId as ChainId,
      makerAsset,
      takerAsset,
      takingAmount,
    );
  };

  // Calculate order statistics
  const activeOrders =
    orders?.filter((order) => order.status === "active") || [];
  const totalActiveOrders = activeOrders.length;
  const totalValue = activeOrders.reduce((acc, order) => {
    const makingAmount = parseFloat(order.makingAmount) / 10 ** 18;
    return acc + makingAmount;
  }, 0);

  // Get popular trading pairs for suggestions
  const getPopularPairs = () => {
    return activeTokenPairs?.slice(0, 5) || [];
  };

  // Get recent order activity
  const getRecentActivity = () => {
    return orderEvents?.slice(0, 10) || [];
  };

  // Additional enhanced functionality using new 1inch APIs

  // Get all limit orders for market overview
  const getAllOrders = async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    statuses?: string[];
    makerAsset?: string;
    takerAsset?: string;
  }) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getAllLimitOrders(chainId as ChainId, params);
  };

  // Get market statistics
  const getMarketStats = async (baseToken?: string, quoteToken?: string) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getMarketStats(
      chainId as ChainId,
      baseToken,
      quoteToken,
    );
  };

  // Get order book snapshot
  const getOrderBook = async (baseToken: string, quoteToken: string) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getOrderBookSnapshot(
      chainId as ChainId,
      baseToken,
      quoteToken,
    );
  };

  // Get market depth
  const getMarketDepth = async (
    baseToken: string,
    quoteToken: string,
    depth = 10,
  ) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getMarketDepth(
      chainId as ChainId,
      baseToken,
      quoteToken,
      depth,
    );
  };

  // Get optimal pricing strategies
  const getOptimalPricing = async (
    fromToken: string,
    toToken: string,
    amount: string,
    slippage = 1,
  ) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getOptimalPricing(
      chainId as ChainId,
      fromToken,
      toToken,
      amount,
      slippage,
    );
  };

  // Get detailed order quote
  const getOrderQuote = async (
    fromToken: string,
    toToken: string,
    amount: string,
    side: "buy" | "sell" = "sell",
  ) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getOrderQuote(
      chainId as ChainId,
      fromToken,
      toToken,
      amount,
      side,
    );
  };

  // Get gas estimation for order
  const getGasEstimate = async (orderData: Record<string, unknown>) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getGasEstimate(chainId as ChainId, orderData);
  };

  // Get protocol fee information
  const getProtocolFee = async () => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getProtocolFee(chainId as ChainId);
  };

  // Get available order types
  const getOrderTypes = async () => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getAdvancedOrderTypes(chainId as ChainId);
  };

  // Validate order signature
  const validateOrderSignature = async (orderData: Record<string, unknown>) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.validateLimitOrderSignature(
      chainId as ChainId,
      orderData,
    );
  };

  // Get orders with permit for specific token
  const getOrdersWithPermit = async (
    walletAddress: string,
    tokenAddress: string,
  ) => {
    if (!chainId) throw new Error("Chain not connected");
    return await oneInchApi.getActiveLimitOrdersWithPermit(
      chainId as ChainId,
      walletAddress,
      tokenAddress,
    );
  };

  return {
    // Core data
    orders: orders || [],
    activeOrders,
    totalActiveOrders,
    totalValue,
    orderStats,
    activeTokenPairs: activeTokenPairs || [],
    orderEvents: orderEvents || [],

    // Loading states
    isLoading,
    isLoadingStats,
    isLoadingPairs,
    isLoadingEvents,

    // Mutations
    createLimitOrder: createMutation.mutate,
    cancelLimitOrder: cancelMutation.mutate,
    isCreating: createMutation.isPending,
    isCanceling: cancelMutation.isPending,
    error: createMutation.error || cancelMutation.error,

    // Utility functions
    getOrderByHash,
    getQuote,
    getPopularPairs,
    getRecentActivity,
    refetch,
    // Enhanced functions
    getAllOrders,
    getMarketStats,
    getOrderBook,
    getMarketDepth,
    getOptimalPricing,
    getOrderQuote,
    getGasEstimate,
    getProtocolFee,
    getOrderTypes,
    validateOrderSignature,
    getOrdersWithPermit,
  };
};
