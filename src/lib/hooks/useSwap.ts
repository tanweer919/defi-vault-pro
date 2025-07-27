import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import oneInchApi from "../api/oneInchApi";
import { ChainId } from "../config/wagmi";

interface UseSwapParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: number;
}

export const useSwap = ({
  fromToken,
  toToken,
  amount,
  slippage,
}: UseSwapParams) => {
  const { address } = useAccount();
  const chainId = useChainId();

  const { data: quote, isLoading: isQuoteLoading } = useQuery({
    queryKey: ["swapQuote", fromToken, toToken, amount, slippage, chainId],
    queryFn: async () => {
      if (!fromToken || !toToken || !amount || !chainId) return null;

      return await oneInchApi.getSwapQuote({
        chainId: chainId as ChainId,
        src: fromToken,
        dst: toToken,
        amount,
        slippage,
      });
    },
    enabled: !!fromToken && !!toToken && !!amount && !!chainId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const swapMutation = useMutation({
    mutationFn: async () => {
      if (!address || !chainId || !fromToken || !toToken || !amount) {
        throw new Error("Missing required parameters");
      }

      return await oneInchApi.buildSwapTransaction({
        chainId: chainId as ChainId,
        src: fromToken,
        dst: toToken,
        amount,
        from: address,
        slippage,
      });
    },
  });

  return {
    quote,
    isLoading: isQuoteLoading,
    executeSwap: swapMutation.mutate,
    isSwapping: swapMutation.isPending,
    swapError: swapMutation.error,
  };
};
