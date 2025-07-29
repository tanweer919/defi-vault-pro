import { useState } from "react";
import {
  useAccount,
  useChainId,
  useWalletClient,
  usePublicClient,
} from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseEther, formatEther } from "viem";
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
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const { data: quote, isLoading: isQuoteLoading } = useQuery({
    queryKey: [
      "swapQuote",
      fromToken,
      toToken,
      amount,
      slippage,
      chainId,
      address,
    ],
    queryFn: async () => {
      if (!fromToken || !toToken || !amount || !chainId || !address)
        return null;

      return await oneInchApi.getSwapQuote({
        chainId: chainId as ChainId,
        src: fromToken,
        dst: toToken,
        amount,
        from: address,
        slippage,
      });
    },
    enabled: !!fromToken && !!toToken && !!amount && !!chainId && !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const swapMutation = useMutation({
    mutationFn: async () => {
      if (
        !address ||
        !chainId ||
        !fromToken ||
        !toToken ||
        !amount ||
        !quote?.quoteId
      ) {
        throw new Error("Missing required parameters");
      }

      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      // Build the swap transaction
      const swapData = await oneInchApi.buildSwapTransaction({
        chainId: chainId as ChainId,
        src: fromToken,
        dst: toToken,
        amount,
        from: address,
        quoteId: quote.quoteId,
        slippage,
      });

      // Prepare transaction parameters
      const tx = swapData.tx;
      const transaction = {
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: tx.value ? BigInt(tx.value) : BigInt(0),
      };

      // Send the transaction
      const hash = await walletClient.sendTransaction(
        transaction as unknown as Parameters<
          typeof walletClient.sendTransaction
        >[0],
      );

      // Wait for transaction confirmation
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        return { hash, receipt, swapData };
      }

      return { hash, swapData };
    },
  });

  return {
    quote,
    isLoading: isQuoteLoading,
    executeSwap: swapMutation.mutate,
    isSwapping: swapMutation.isPending,
    swapError: swapMutation.error,
    swapResult: swapMutation.data,
  };
};
