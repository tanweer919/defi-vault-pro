"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { YieldPool } from "@/lib/types";
import { useYieldFarming } from "@/lib/hooks/useYieldFarming";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: YieldPool | null;
  onSuccess?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  pool,
  onSuccess,
}) => {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { deposit } = useYieldFarming();

  const handleDeposit = async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const depositAmount = parseFloat(amount);

    // Check minimum deposit if specified
    if (pool.minimumDeposit && depositAmount < pool.minimumDeposit) {
      setError(`Minimum deposit is ${pool.minimumDeposit} tokens`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await deposit(pool.id, depositAmount);
      setAmount("");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount("");
      setError("");
      onClose();
    }
  };

  if (!pool) return null;

  const estimatedRewards = ((parseFloat(amount) || 0) * (pool.apy / 100)) / 365; // Daily rewards estimate

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Deposit to ${pool.name}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Pool Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">{pool.protocol}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">APY</p>
              <p className="font-bold text-green-600">{pool.apy}%</p>
            </div>
            <div>
              <p className="text-gray-600">Risk Level</p>
              <p
                className={`font-medium capitalize ${
                  pool.risk === "low"
                    ? "text-green-600"
                    : pool.risk === "medium"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {pool.risk}
              </p>
            </div>
            <div>
              <p className="text-gray-600">TVL</p>
              <p className="font-medium">${pool.tvl.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Category</p>
              <p className="font-medium capitalize">{pool.category}</p>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deposit Amount
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={error}
            disabled={isSubmitting}
            step="0.000001"
            min="0"
          />
          {pool.minimumDeposit && (
            <p className="mt-1 text-sm text-gray-500">
              Minimum deposit: {pool.minimumDeposit} tokens
            </p>
          )}
        </div>

        {/* Estimates */}
        {amount && parseFloat(amount) > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Estimated Returns
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily rewards:</span>
                <span className="font-medium">
                  ~${estimatedRewards.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly rewards:</span>
                <span className="font-medium">
                  ~${(estimatedRewards * 30).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Yearly rewards:</span>
                <span className="font-medium text-green-600">
                  ~${(estimatedRewards * 365).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fees */}
        {pool.fees && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-900">Fees</span>
            </div>
            <div className="text-sm space-y-1">
              {pool.fees.deposit > 0 && (
                <p className="text-gray-600">
                  Deposit fee: {pool.fees.deposit}%
                </p>
              )}
              {pool.fees.withdraw > 0 && (
                <p className="text-gray-600">
                  Withdrawal fee: {pool.fees.withdraw}%
                </p>
              )}
              {pool.fees.performance > 0 && (
                <p className="text-gray-600">
                  Performance fee: {pool.fees.performance}%
                </p>
              )}
            </div>
          </div>
        )}

        {/* Lockup Period */}
        {pool.lockupPeriod && pool.lockupPeriod > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-900">Lockup Period</span>
            </div>
            <p className="text-sm text-red-700">
              Funds will be locked for {pool.lockupPeriod} days after deposit
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDeposit}
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Depositing...
              </>
            ) : (
              "Deposit"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
