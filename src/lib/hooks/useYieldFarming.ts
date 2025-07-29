"use client";

import { useState, useCallback } from "react";
import { YieldPool, YieldPosition } from "@/lib/types";

interface UseYieldFarmingReturn {
  positions: YieldPosition[];
  isLoading: boolean;
  deposit: (poolId: string, amount: number) => Promise<void>;
  withdraw: (poolId: string, amount: number) => Promise<void>;
  harvest: (poolId: string) => Promise<void>;
  refreshPositions: () => Promise<void>;
}

export const useYieldFarming = (): UseYieldFarmingReturn => {
  const [positions, setPositions] = useState<YieldPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const deposit = useCallback(async (poolId: string, amount: number) => {
    if (!poolId || amount <= 0) {
      throw new Error("Invalid pool ID or amount");
    }

    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation, this would call the smart contract
      // For now, we'll simulate updating the position
      setPositions((prev) => {
        const existingPosition = prev.find((p) => p.poolId === poolId);
        if (existingPosition) {
          // Update existing position
          return prev.map((p) =>
            p.poolId === poolId
              ? {
                  ...p,
                  deposited: p.deposited + amount,
                  shares: p.shares + amount, // Simplified calculation
                }
              : p,
          );
        } else {
          // Create new position
          const newPosition: YieldPosition = {
            poolId,
            pool: {} as YieldPool, // Would be fetched from pool data
            deposited: amount,
            earned: 0,
            shares: amount,
            entryPrice: 1, // Simplified
            currentPrice: 1,
            pnl: 0,
            pnlPercentage: 0,
            depositedAt: new Date(),
          };
          return [...prev, newPosition];
        }
      });

      console.log(`Successfully deposited ${amount} to pool ${poolId}`);
    } catch (error) {
      console.error("Deposit failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const withdraw = useCallback(async (poolId: string, amount: number) => {
    if (!poolId || amount <= 0) {
      throw new Error("Invalid pool ID or amount");
    }

    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation, this would call the smart contract
      setPositions((prev) => {
        return prev
          .map((p) => {
            if (p.poolId === poolId) {
              const newDeposited = Math.max(0, p.deposited - amount);
              const newShares = Math.max(0, p.shares - amount);

              return {
                ...p,
                deposited: newDeposited,
                shares: newShares,
              };
            }
            return p;
          })
          .filter((p) => p.deposited > 0); // Remove positions with 0 balance
      });

      console.log(`Successfully withdrew ${amount} from pool ${poolId}`);
    } catch (error) {
      console.error("Withdraw failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const harvest = useCallback(async (poolId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real implementation, this would claim rewards from the smart contract
      setPositions((prev) =>
        prev.map((p) => {
          if (p.poolId === poolId) {
            return {
              ...p,
              earned: 0, // Reset earned amount after harvest
              lastHarvestAt: new Date(),
            };
          }
          return p;
        }),
      );

      console.log(`Successfully harvested rewards from pool ${poolId}`);
    } catch (error) {
      console.error("Harvest failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshPositions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate fetching positions from API/blockchain
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation, this would fetch actual positions
      console.log("Positions refreshed");
    } catch (error) {
      console.error("Failed to refresh positions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    positions,
    isLoading,
    deposit,
    withdraw,
    harvest,
    refreshPositions,
  };
};
