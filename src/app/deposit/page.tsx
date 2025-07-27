"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
} from "lucide-react";
import toast from "react-hot-toast";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const supportedTokens = [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xA0b86a33E6441E5BA2AD8D73B8E76C6B72C2E6eF",
      logo: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
      decimals: 6,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      logo: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
      decimals: 8,
    },
  ];

  const selectedTokenData = supportedTokens.find(
    (token) => token.symbol === selectedToken,
  );
  const depositAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Example address

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    toast.success("Address copied to clipboard!");
  };

  const handleRefreshBalance = () => {
    toast.success("Balance refreshed!");
  };

  const generateQRCode = () => {
    // In a real app, you'd use a QR code library
    setShowQR(true);
    toast.success("QR code generated!");
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token Selection & Amount */}
        <Card className="p-6" gradient>
          <h2 className="text-xl font-semibold mb-6">Transfer Details</h2>

          <div className="space-y-6">
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Token
              </label>
              <div className="grid grid-cols-3 gap-3">
                {supportedTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedToken === token.symbol
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={token.logo}
                        alt={token.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">{token.symbol}</span>
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
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {selectedToken}
                </div>
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
                <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="bg-white rounded border p-3 font-mono text-sm break-all">
                {depositAddress}
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={generateQRCode}
                className="mb-4"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {showQR ? "Hide QR Code" : "Show QR Code"}
              </Button>

              {showQR && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-4 rounded-lg border inline-block"
                >
                  <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-500">QR Code</span>
                  </div>
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
        <Button variant="outline" onClick={handleRefreshBalance} size="lg">
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
          <Wallet className="w-12 h-12 mx-auto mb-4 text-purple-600" />
          <h3 className="text-xl font-semibold mb-2">Multi-Chain</h3>
          <p className="text-gray-600">
            Support for Ethereum, Polygon, and more
          </p>
        </Card>
      </div>
    </div>
  );
}
