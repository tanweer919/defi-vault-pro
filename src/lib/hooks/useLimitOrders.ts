import { useAccount, useChainId } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import oneInchApi from "../api/oneInchApi";
import { ChainId } from "../config/wagmi";

interface CreateLimitOrderParams {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  expiry: number;
}

export const useLimitOrders = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["limitOrders", address, chainId],
    queryFn: async () => {
      if (!address || !chainId) return [];
      return await oneInchApi.getLimitOrders(
        chainId as ChainId,
        address,
      );
    },
    enabled: !!address && !!chainId,
  });

  const createMutation = useMutation({
    mutationFn: async (params: CreateLimitOrderParams) => {
      if (!address || !chainId) throw new Error("Wallet not connected");

      const orderData = {
        makerAsset: params.sellToken,
        takerAsset: params.buyToken,
        makingAmount: params.sellAmount,
        takingAmount: params.buyAmount,
        salt: Date.now().toString(),
        expiry: params.expiry,
        maker: address,
      };

      return await oneInchApi.createLimitOrder(
        chainId as ChainId,
        orderData,
      );
    },
    onSuccess: () => {
      refetch();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!chainId) throw new Error("Chain not connected");
      // Implementation for canceling limit order
      return await oneInchApi.cancelLimitOrder(
        chainId as ChainId,
        orderId,
      );
    },
    onSuccess: () => {
      refetch();
    },
  });

  return {
    orders,
    isLoading,
    createLimitOrder: createMutation.mutate,
    cancelLimitOrder: cancelMutation.mutate,
    isCreating: createMutation.isPending,
    isCanceling: cancelMutation.isPending,
    refetch,
  };
};
