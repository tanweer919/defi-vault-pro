import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";

interface RealTimeData {
  prices: Record<string, number>;
  portfolioValue: number;
  pendingTransactions: number;
}

export const useRealTimeData = () => {
  const [data, setData] = useState<RealTimeData>({
    prices: {},
    portfolioValue: 0,
    pendingTransactions: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    if (!address || !chainId) return;

    // Simulate WebSocket connection
    const ws = new WebSocket(`wss://api.1inch.dev/ws/${chainId}`);

    ws.onopen = () => {
      setIsConnected(true);
      // Subscribe to price updates
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channel: "prices",
          tokens: ["ETH", "USDC", "WBTC"],
        }),
      );

      // Subscribe to portfolio updates
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channel: "portfolio",
          address: address,
        }),
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "price_update":
          setData((prev) => ({
            ...prev,
            prices: { ...prev.prices, [message.token]: message.price },
          }));
          break;

        case "portfolio_update":
          setData((prev) => ({
            ...prev,
            portfolioValue: message.value,
          }));
          break;

        case "transaction_update":
          setData((prev) => ({
            ...prev,
            pendingTransactions: message.count,
          }));
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [address, chainId]);

  return { data, isConnected };
};
