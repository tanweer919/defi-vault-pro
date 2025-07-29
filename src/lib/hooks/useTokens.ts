import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import oneInchApi from "../api/oneInchApi";
import { ChainId } from "../config/wagmi";

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export const useTokens = () => {
  const chainId = useChainId();

  const {
    data: tokens,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tokens", chainId],
    queryFn: async () => {
      // If no chainId, return fallback tokens for Ethereum
      if (!chainId) {
        return getFallbackTokens(1);
      }

      try {
        const response = await oneInchApi.getTokenList(chainId as ChainId);
        return response.tokens || getFallbackTokens(chainId as ChainId);
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        // Return fallback tokens
        return getFallbackTokens(chainId as ChainId);
      }
    },
    enabled: true, // Always enabled to provide fallback tokens
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    tokens: tokens || getFallbackTokens((chainId || 1) as ChainId),
    isLoading,
    error,
  };
};

// Fallback tokens for when API fails - expanded with 1inch supported tokens
const getFallbackTokens = (chainId: ChainId): Token[] => {
  const fallbackTokens: Record<number, Token[]> = {
    1: [
      // Ethereum - Popular tokens supported by 1inch
      {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
      },
      {
        address: "0xa0b86a33e6441e5ba2ad8d73b8e76c6b72c2e6ef",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        logoURI:
          "https://tokens.1inch.io/0xa0b86a33e6441e5ba2ad8d73b8e76c6b72c2e6ef.png",
      },
      {
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
        logoURI:
          "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
      },
      {
        address: "0x6b175474e89094c44da98b954eedeac495271d0f",
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
      },
      {
        address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        symbol: "WBTC",
        name: "Wrapped Bitcoin",
        decimals: 8,
        logoURI:
          "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
      },
      {
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        symbol: "WETH",
        name: "Wrapped Ether",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
      },
      {
        address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        symbol: "UNI",
        name: "Uniswap",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png",
      },
      {
        address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
        symbol: "MATIC",
        name: "Polygon",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
      },
      {
        address: "0x514910771af9ca656af840dff83e8264ecf986ca",
        symbol: "LINK",
        name: "ChainLink Token",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png",
      },
      {
        address: "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b",
        symbol: "CRO",
        name: "Cronos Coin",
        decimals: 8,
        logoURI:
          "https://tokens.1inch.io/0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b.png",
      },
      {
        address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
        symbol: "stETH",
        name: "Lido Staked Ether",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0xae7ab96520de3a18e5e111b5eaab095312d7fe84.png",
      },
      {
        address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
        symbol: "SHIB",
        name: "SHIBA INU",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce.png",
      },
      {
        address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
        symbol: "BUSD",
        name: "Binance USD",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png",
      },
      {
        address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
        symbol: "MKR",
        name: "Maker",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2.png",
      },
      {
        address: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
        symbol: "ENS",
        name: "Ethereum Name Service",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0xc18360217d8f7ab5e7c516566761ea12ce7f9d72.png",
      },
      {
        address: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
        symbol: "MEME",
        name: "Memecoin",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x0f5d2fb29fb7d3cfee444a200298f468908cc942.png",
      },
      {
        address: "0x111111111117dc0aa78b770fa6a738034120c302",
        symbol: "1INCH",
        name: "1INCH Token",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x111111111117dc0aa78b770fa6a738034120c302.png",
      },
      {
        address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
        symbol: "AAVE",
        name: "Aave Token",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.png",
      },
      {
        address: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
        symbol: "GRT",
        name: "The Graph",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0xc944e90c64b2c07662a292be6244bdf05cda44a7.png",
      },
      {
        address: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
        symbol: "PEPE",
        name: "Pepe",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x6982508145454ce325ddbe47a25d4ec3d2311933.png",
      },
    ],
    137: [
      // Polygon - Popular tokens supported by 1inch
      {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        symbol: "MATIC",
        name: "Polygon",
        decimals: 18,
        logoURI: "https://wallet-asset.matic.network/img/tokens/matic.svg",
      },
      {
        address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        logoURI: "https://wallet-asset.matic.network/img/tokens/usdc.svg",
      },
      {
        address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
        logoURI: "https://wallet-asset.matic.network/img/tokens/usdt.svg",
      },
      {
        address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
        logoURI: "https://wallet-asset.matic.network/img/tokens/dai.svg",
      },
      {
        address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
        symbol: "WBTC",
        name: "Wrapped BTC",
        decimals: 8,
        logoURI: "https://wallet-asset.matic.network/img/tokens/wbtc.svg",
      },
      {
        address: "0x7ceb23fd6c7194c3d80794a32c4a7e6b8bcae2b1",
        symbol: "WETH",
        name: "Wrapped Ether",
        decimals: 18,
        logoURI: "https://wallet-asset.matic.network/img/tokens/eth.svg",
      },
      {
        address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
        symbol: "UNI",
        name: "Uniswap",
        decimals: 18,
        logoURI: "https://wallet-asset.matic.network/img/tokens/uni.svg",
      },
      {
        address: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
        symbol: "LINK",
        name: "ChainLink Token",
        decimals: 18,
        logoURI: "https://wallet-asset.matic.network/img/tokens/link.svg",
      },
      {
        address: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
        symbol: "AAVE",
        name: "Aave",
        decimals: 18,
        logoURI: "https://wallet-asset.matic.network/img/tokens/aave.svg",
      },
      {
        address: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
        symbol: "SUSHI",
        name: "SushiToken",
        decimals: 18,
        logoURI: "https://wallet-asset.matic.network/img/tokens/sushi.svg",
      },
    ],
    56: [
      // BSC - Popular tokens supported by 1inch
      {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        symbol: "BNB",
        name: "BNB",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png",
      },
      {
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d.png",
      },
      {
        address: "0x55d398326f99059ff775485246999027b3197955",
        symbol: "BSC-USD",
        name: "Tether USD",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x55d398326f99059ff775485246999027b3197955.png",
      },
      {
        address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        symbol: "BUSD",
        name: "BUSD Token",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0xe9e7cea3dedca5984780bafc599bd69add087d56.png",
      },
      {
        address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
        symbol: "BTCB",
        name: "BTCB Token",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c.png",
      },
    ],
    42161: [
      // Arbitrum
      {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
      },
      {
        address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        logoURI:
          "https://tokens.1inch.io/0xff970a61a04b1ca14834a43f5de4533ebddb5cc8.png",
      },
      {
        address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
        logoURI:
          "https://tokens.1inch.io/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.png",
      },
    ],
    10: [
      // Optimism
      {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
        logoURI:
          "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
      },
      {
        address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        logoURI:
          "https://tokens.1inch.io/0x7f5c764cbc14f9669b88837ca1490cca17c31607.png",
      },
      {
        address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
        logoURI:
          "https://tokens.1inch.io/0x94b008aa00579c1307b0ef2c499ad98a8ce58e58.png",
      },
    ],
  };

  return fallbackTokens[chainId] || fallbackTokens[1];
};
