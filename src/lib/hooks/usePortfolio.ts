import { useAccount, useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import oneInchApi from "../api/oneInchApi";
import { PortfolioData, TokenBalance } from "../types";
import { ChainId } from "../config/wagmi";

export const usePortfolio = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const {
    data: portfolioData,
    isLoading,
    error,
    refetch,
  } = useQuery<PortfolioData>({
    queryKey: ["portfolio", address, chainId],
    queryFn: async () => {
      if (!address || !chainId) throw new Error("Wallet not connected");

      // Fetch balances
      const balances = await oneInchApi.getWalletBalances(
        chainId as ChainId,
        address,
      );

      // Get token addresses
      const tokenAddresses = Object.keys(balances);

      // Fetch prices
      const prices = await oneInchApi.getTokenPrices(
        chainId as ChainId,
        tokenAddresses,
      );

      // Process portfolio items
      const items: TokenBalance[] = await Promise.all(
        tokenAddresses.map(async (tokenAddress) => {
          const balance = balances[tokenAddress];
          const price = prices[tokenAddress] || 0;

          try {
            const tokenInfo = await oneInchApi.getTokenMetadata(
              chainId as ChainId,
              tokenAddress,
            );
            return {
              address: tokenAddress,
              symbol: tokenInfo.symbol,
              name: tokenInfo.name,
              balance: balance,
              decimals: tokenInfo.decimals,
              price: price,
              value: parseFloat(balance) * price,
              logo: tokenInfo.logoURI,
            };
          } catch (error) {
            // Fallback for tokens without metadata
            return {
              address: tokenAddress,
              symbol: "Unknown",
              name: "Unknown Token",
              balance: balance,
              decimals: 18,
              price: price,
              value: parseFloat(balance) * price,
              logo: undefined,
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
    enabled: !!address && !!chainId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    portfolioData,
    isLoading,
    error,
    refetch,
  };
};
