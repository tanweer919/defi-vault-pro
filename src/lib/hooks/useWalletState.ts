import { useAccount, useChainId } from "wagmi";
import { useEffect, useState } from "react";

export const useWalletState = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't show connection state until hydrated to prevent flashing
  const safeIsConnected = isHydrated ? isConnected : false;

  return {
    address,
    isConnected: safeIsConnected,
    isConnecting,
    chainId,
    isReady: safeIsConnected && !!chainId,
    isHydrated,
    shortAddress: address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : null,
  };
};
