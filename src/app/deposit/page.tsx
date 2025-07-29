"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TokenImage } from "@/components/ui/TokenImage";
import { ChainSelector } from "@/components/common/ChainSelector";
import {
  ArrowDown,
  Wallet,
  Copy,
  ExternalLink,
  Zap,
  Shield,
  CheckCircle,
  QrCode,
  RefreshCw,
  AlertTriangle,
  Info,
  TrendingUp,
} from "lucide-react";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useTokens } from "@/lib/hooks/useTokens";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import toast from "react-hot-toast";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState<number | null>(null);
  const [expectedConfirmations, setExpectedConfirmations] = useState(1);

  const { address, isConnected, chainId } = useWalletState();
  const { tokens, isLoading: tokensLoading } = useTokens();
  const { isDemoMode } = useDemoMode();

  // Enhanced token list with more popular tokens supported by 1inch
  const supportedTokens =
    tokens.length > 0
      ? tokens.slice(0, 20)
      : [
          {
            symbol: "ETH",
            name: "Ethereum",
            address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            decimals: 18,
            logoURI:
              "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
          },
          {
            symbol: "USDC",
            name: "USD Coin",
            address: "0xa0b86a33e6441e5ba2ad8d73b8e76c6b72c2e6ef",
            decimals: 6,
            logoURI:
              "https://tokens.1inch.io/0xa0b86a33e6441e5ba2ad8d73b8e76c6b72c2e6ef.png",
          },
          {
            symbol: "USDT",
            name: "Tether USD",
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            decimals: 6,
            logoURI:
              "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
          },
          {
            symbol: "WBTC",
            name: "Wrapped Bitcoin",
            address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            decimals: 8,
            logoURI:
              "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
          },
          {
            symbol: "DAI",
            name: "Dai Stablecoin",
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            decimals: 18,
            logoURI:
              "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
          },
          {
            symbol: "UNI",
            name: "Uniswap",
            address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            decimals: 18,
            logoURI:
              "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png",
          },
          {
            symbol: "LINK",
            name: "ChainLink Token",
            address: "0x514910771af9ca656af840dff83e8264ecf986ca",
            decimals: 18,
            logoURI:
              "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png",
          },
          {
            symbol: "AAVE",
            name: "Aave Token",
            address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
            decimals: 18,
            logoURI:
              "https://tokens.1inch.io/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.png",
          },
          {
            symbol: "MATIC",
            name: "Polygon",
            address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
            decimals: 18,
            logoURI:
              "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
          },
          {
            symbol: "1INCH",
            name: "1INCH Token",
            address: "0x111111111117dc0aa78b770fa6a738034120c302",
            decimals: 18,
            logoURI:
              "https://tokens.1inch.io/0x111111111117dc0aa78b770fa6a738034120c302.png",
          },
        ];

  // Use actual wallet address or demo address
  const depositAddress = isDemoMode
    ? "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" // Demo address
    : address || "Connect wallet to see your address";

  // Generate QR code data URL
  const generateQRCode = (text: string) => {
    // For a real implementation, you'd use a QR code library like qrcode
    // For now, we'll create a placeholder QR code URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      text,
    )}`;
  };

  // Get selected token details
  const selectedTokenDetails = supportedTokens.find(
    (token) => token.symbol === selectedToken,
  );

  // Estimate gas fees based on network
  useEffect(() => {
    const estimateGas = () => {
      const baseGas = selectedToken === "ETH" ? 21000 : 65000; // ETH transfer vs ERC20
      const gasPrice = chainId === 1 ? 20 : chainId === 137 ? 30 : 15; // Gwei
      setEstimatedGas((baseGas * gasPrice) / 1e9); // Convert to ETH

      // Set expected confirmations based on network
      if (chainId === 1) setExpectedConfirmations(12); // Ethereum
      else if (chainId === 137) setExpectedConfirmations(3); // Polygon
      else setExpectedConfirmations(6); // Default
    };

    estimateGas();
  }, [selectedToken, chainId]);

  const handleCopyAddress = () => {
    if (
      depositAddress &&
      depositAddress !== "Connect wallet to see your address"
    ) {
      navigator.clipboard.writeText(depositAddress);
      toast.success("Address copied to clipboard!");
    } else {
      toast.error("Please connect your wallet first");
    }
  };

  const handleRefreshBalance = async () => {
    if (!isConnected && !isDemoMode) {
      toast.error("Please connect your wallet or enable demo mode");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Balance refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh balance");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportInfo = () => {
    if (
      !depositAddress ||
      depositAddress === "Connect wallet to see your address"
    ) {
      toast.error("Please connect your wallet first");
      return;
    }

    const info = {
      token: selectedToken,
      tokenName: selectedTokenDetails?.name || selectedToken,
      address: depositAddress,
      network: getNetworkName(chainId),
      amount: amount || "Any amount",
      contractAddress: selectedTokenDetails?.address,
      decimals: selectedTokenDetails?.decimals,
      estimatedGas: estimatedGas ? `${estimatedGas.toFixed(6)} ETH` : "N/A",
      expectedConfirmations,
      timestamp: new Date().toISOString(),
    };

    const csvContent = Object.entries(info)
      .map(([key, value]) => `${key},${value}`)
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deposit-info-${selectedToken.toLowerCase()}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Deposit info exported!");
  };

  const getNetworkName = (chainId: number | undefined) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 137:
        return "Polygon";
      case 42161:
        return "Arbitrum";
      case 10:
        return "Optimism";
      case 56:
        return "BSC";
      default:
        return "Unknown Network";
    }
  };

  const handleQuickAmount = (percentage: number) => {
    // This would typically fetch the user's balance and calculate the percentage
    // For demo purposes, we'll use placeholder values
    const mockBalance =
      selectedToken === "ETH" ? 1.5 : selectedToken === "USDC" ? 1000 : 100;
    const calculatedAmount = ((mockBalance * percentage) / 100).toString();
    setAmount(calculatedAmount);
  };

  const selectedTokenData = supportedTokens.find(
    (token) => token.symbol === selectedToken,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Crypto{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transfer
          </span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Send crypto from another wallet to your DeFi vault
        </p>
      </motion.div>

      {/* Connection Status */}
      {!isConnected && !isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              Connect your wallet to see your deposit address
            </span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token Selection & Amount */}
        <Card className="p-6" gradient>
          <h2 className="text-xl font-semibold mb-6">Transfer Details</h2>

          <div className="space-y-6">
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Token ({supportedTokens.length} available)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {supportedTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedToken === token.symbol
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <TokenImage
                        src={token.logoURI}
                        alt={token.name}
                        symbol={token.symbol}
                        size={24}
                      />
                      <span className="font-medium text-xs">
                        {token.symbol}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Network Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network
              </label>
              <ChainSelector />
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (Optional - for reference)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  {selectedToken}
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex space-x-2 mt-2">
                {[25, 50, 75, 100].map((percentage) => (
                  <Button
                    key={percentage}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(percentage)}
                    className="text-xs"
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Network:</span>
                <span className="font-medium">{getNetworkName(chainId)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Est. Gas:</span>
                <span className="font-medium">
                  {estimatedGas
                    ? `${estimatedGas.toFixed(6)} ETH`
                    : "Calculating..."}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Confirmations:</span>
                <span className="font-medium">
                  {expectedConfirmations} blocks
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Deposit Address */}
        <Card className="p-6" gradient>
          <h2 className="text-xl font-semibold mb-6">Deposit Address</h2>

          <div className="space-y-6">
            {/* Address Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Your {selectedToken} Address:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  disabled={!depositAddress}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="bg-white rounded border p-3 font-mono text-sm break-all">
                {depositAddress || "Connect wallet to see address"}
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center flex flex-col-reverse gap-4 justify-center items-center">
              <Button
                variant="outline"
                onClick={() => setShowQR(!showQR)}
                disabled={!depositAddress}
                className="mb-4"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {showQR ? "Hide QR Code" : "Show QR Code"}
              </Button>

              {showQR && depositAddress && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-4 rounded-lg border inline-block"
                >
                  <img
                    src={generateQRCode(depositAddress)}
                    alt="Deposit Address QR Code"
                    className="mx-auto"
                    width={200}
                    height={200}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Scan to get deposit address
                  </p>
                </motion.div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">How to transfer:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Copy the deposit address above</li>
                    <li>Send {selectedToken} from your external wallet</li>
                    <li>Wait for network confirmations</li>
                    <li>Funds will appear in your vault</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={handleRefreshBalance}
          size="lg"
          loading={isProcessing}
          disabled={isProcessing}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Balance
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() =>
            window.open(
              `https://etherscan.io/address/${depositAddress}`,
              "_blank",
            )
          }
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleExportInfo}
          disabled={!depositAddress}
        >
          <Copy className="w-4 h-4 mr-2" />
          Export Info
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center" hover gradient>
          <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-xl font-semibold mb-2">Secure</h3>
          <p className="text-gray-600">
            Direct blockchain transfers with full transparency
          </p>
        </Card>

        <Card className="p-6 text-center" hover gradient>
          <Zap className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-semibold mb-2">Fast</h3>
          <p className="text-gray-600">
            Instant deposits once confirmed on blockchain
          </p>
        </Card>

        <Card className="p-6 text-center" hover gradient>
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-600" />
          <h3 className="text-xl font-semibold mb-2">Multi-Token</h3>
          <p className="text-gray-600">
            Support for {supportedTokens.length}+ popular cryptocurrencies
          </p>
        </Card>
      </div>
    </div>
  );
}
