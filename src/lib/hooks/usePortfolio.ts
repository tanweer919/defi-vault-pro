import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import oneInchApi from "@/lib/api/oneInchApi";
import { ChainId } from "@/lib/config/wagmi";
import { PortfolioData, TokenBalance } from "@/lib/types";
import { useDemoMode } from "./useDemoMode";
import { formatTokenBalance } from "@/lib/utils/utils";

export const usePortfolio = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { isDemoMode, getDemoPortfolioData } = useDemoMode();

  const query = useQuery<PortfolioData>({
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
              decimals: decimals,
              price: price,
              value: calculatedValue,
              logo: undefined,
            };
          }
        }),
      );

      const totalValue = items.reduce((sum, item) => sum + item.value, 0);

      return {
        totalValue,
        items,
        change24h: 0,
        chainId: chainId as number,
      };
    },
    enabled: !!address && !!chainId,
    refetchInterval: 30000,
  });

  return {
    portfolioData: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isDemoMode,
  };
};
