import { useAccount, useChainId } from "wagmi";

export const useWalletState = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    isReady: isConnected && !!chainId,
    shortAddress: address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : null,
  };
};
