import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, arbitrum, optimism, base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "DefiVault Pro",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [mainnet, polygon, arbitrum, optimism, base],
  ssr: true,
});

export const SUPPORTED_CHAINS = {
  ethereum: 1,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
} as const;

export type ChainId = (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];
