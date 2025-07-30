import { useAccount, useChainId } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import oneInchApi from "../api/oneInchApi";
import { PortfolioData, TokenBalance } from "../types";
import { ChainId } from "../config/wagmi";
import { useDemoMode } from "./useDemoMode";
import { formatTokenBalance } from "../utils/utils";

export const usePortfolio = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { isDemoMode, getDemoPortfolioData } = useDemoMode();
  const queryClient = useQueryClient();

  // Invalidate query when demo mode changes
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
  }, [isDemoMode, queryClient]);

  const {
    data: portfolioData,
    isLoading,
    error,
    refetch,
  } = useQuery<PortfolioData>({
    queryKey: ["portfolio", address, chainId, isDemoMode],
    queryFn: async () => {
      // If demo mode is enabled, return demo data
      if (isDemoMode) {
        return getDemoPortfolioData();
      }

      if (!address || !chainId) throw new Error("Wallet not connected");

      // Fetch balances
      const balances = await oneInchApi.getWalletBalances(
        chainId as ChainId,
        address,
      );

      // Get token addresses - only track ETH for now
      const tokenAddresses = ["0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"];

      // Fetch prices
      const prices = await oneInchApi.getTokenPrices(
        chainId as ChainId,
        tokenAddresses,
      );

      // Process portfolio items
      const items: TokenBalance[] = await Promise.all(
        tokenAddresses.map(async (tokenAddress) => {
          const rawBalance = balances[tokenAddress];
          const price = Number(prices[tokenAddress]) || 0;

          try {
            const tokenInfo = await oneInchApi.getTokenMetadata(
              chainId as ChainId,
              tokenAddress,
            );
            // Convert balance from wei to display units
            const displayBalance = formatTokenBalance(
              rawBalance,
              tokenInfo.assets.decimals,
            );
            const calculatedValue = displayBalance * price;
            return {
              address: tokenAddress,
              symbol: tokenInfo.assets.symbol,
              name: tokenInfo.assets.name,
              balance: displayBalance.toString(),
              decimals: tokenInfo.assets.decimals,
              price: price,
              value: calculatedValue,
              logo: tokenInfo.assets.logoURI,
            };
          } catch (error) {
            // Fallback for ETH (native token)
            const decimals = 18;
            const displayBalance = formatTokenBalance(rawBalance, decimals);
            const calculatedValue = displayBalance * price;
            return {
              address: tokenAddress,
              symbol: "ETH",
              name: "Ethereum",
              balance: displayBalance.toString(),
              decimals: 18,
              price: price,
              value: calculatedValue,
              logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
            };
          }
        }),
      );

      const totalValue = items.reduce((sum, item) => sum + item.value, 0);

      return {
        items,
        totalValue,
        change24h: 0, // Would need historical data
        chainId,
      };
    },
    enabled: isDemoMode || (!!address && !!chainId),
    refetchInterval: isDemoMode ? false : 30000, // Don't refetch in demo mode
    staleTime: isDemoMode ? 0 : 5 * 60 * 1000, // Demo data is immediately stale
  });

  return {
    portfolioData,
    isLoading,
    error,
    refetch,
    isDemoMode,
  };
};
