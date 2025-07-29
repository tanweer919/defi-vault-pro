"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { YieldPool } from "@/lib/types";
import { useYieldFarming } from "@/lib/hooks/useYieldFarming";
import { Loader2, TrendingDown, AlertCircle, DollarSign } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: YieldPool | null;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  pool,
  onSuccess,
}) => {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { withdraw } = useYieldFarming();

  const handleWithdraw = async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const withdrawAmount = parseFloat(amount);

    // Check if withdrawal amount exceeds deposited amount
    if (withdrawAmount > pool.deposited) {
      setError(
        `Cannot withdraw more than deposited amount (${pool.deposited.toLocaleString()})`,
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await withdraw(pool.id, withdrawAmount);
      setAmount("");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxClick = () => {
    if (pool) {
      setAmount(pool.deposited.toString());
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

  const withdrawAmount = parseFloat(amount) || 0;
  const withdrawalFee = pool.fees?.withdraw
    ? (withdrawAmount * pool.fees.withdraw) / 100
    : 0;
  const netWithdrawal = withdrawAmount - withdrawalFee;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Withdraw from ${pool.name}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Pool Info */}
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-900">{pool.protocol}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Your Deposit</p>
              <p className="font-bold text-blue-600">
                ${pool.deposited.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Earned Rewards</p>
              <p className="font-bold text-green-600">
                ${pool.earned.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">APY</p>
              <p className="font-medium text-green-600">{pool.apy}%</p>
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
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Withdraw Amount
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMaxClick}
              disabled={isSubmitting}
              className="text-xs"
            >
              Max: ${pool.deposited.toLocaleString()}
            </Button>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={error}
            disabled={isSubmitting}
            step="0.000001"
            min="0"
            max={pool.deposited}
          />
          <p className="mt-1 text-sm text-gray-500">
            Available to withdraw: ${pool.deposited.toLocaleString()}
          </p>
        </div>

        {/* Withdrawal Summary */}
        {amount && parseFloat(amount) > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Withdrawal Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Withdrawal amount:</span>
                <span className="font-medium">
                  ${withdrawAmount.toLocaleString()}
                </span>
              </div>
              {withdrawalFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Withdrawal fee ({pool.fees?.withdraw}%):
                  </span>
                  <span className="font-medium text-red-600">
                    -${withdrawalFee.toFixed(6)}
                  </span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">
                  You will receive:
                </span>
                <span className="font-bold text-green-600">
                  ${netWithdrawal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fees Warning */}
        {pool.fees && pool.fees.withdraw > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-900">
                Withdrawal Fee
              </span>
            </div>
            <p className="text-sm text-yellow-700">
              A {pool.fees.withdraw}% fee will be applied to your withdrawal
            </p>
          </div>
        )}

        {/* Lockup Warning */}
        {pool.lockupPeriod && pool.lockupPeriod > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-900">Lockup Period</span>
            </div>
            <p className="text-sm text-red-700">
              Please ensure your funds are not within the {pool.lockupPeriod}
              -day lockup period
            </p>
          </div>
        )}

        {/* Earned Rewards Info */}
        {pool.earned > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">
                Unclaimed Rewards
              </span>
            </div>
            <p className="text-sm text-green-700">
              You have ${pool.earned.toLocaleString()} in unclaimed rewards.
              Consider harvesting them separately.
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
            onClick={handleWithdraw}
            disabled={
              isSubmitting ||
              !amount ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > pool.deposited
            }
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Withdrawing...
              </>
            ) : (
              "Withdraw"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
