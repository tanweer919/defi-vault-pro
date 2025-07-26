"use client";

import React from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { SUPPORTED_CHAINS } from "@/lib/config/wagmi";

const chainNames = {
  1: "Ethereum",
  137: "Polygon",
  42161: "Arbitrum",
  10: "Optimism",
  8453: "Base",
};

export const ChainSelector: React.FC = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  return (
    <div className="relative">
      <select
        value={chainId}
        onChange={(e) => switchChain({ chainId: parseInt(e.target.value) })}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(SUPPORTED_CHAINS).map(([name, id]) => (
          <option key={id} value={id}>
            {chainNames[id as keyof typeof chainNames]}
          </option>
        ))}
      </select>
    </div>
  );
};
