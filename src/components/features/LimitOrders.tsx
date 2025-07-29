"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowUpDown,
  Settings,
  Target,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  X,
  Info,
} from "lucide-react";
import { useLimitOrders } from "@/lib/hooks/useLimitOrders";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import toast from "react-hot-toast";

// Enhanced token list with more detailed information - expanded with 1inch supported tokens
const TOKENS = {
  1: [
    {
      address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      logo: "⟠",
      isNative: true,
    },
    {
      address: "0xa0b86a33e6441e5ba2ad8d73b8e76c6b72c2e6ef",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logo: "💵",
      isStablecoin: true,
    },
    {
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      logo: "💰",
      isStablecoin: true,
    },
    {
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      logo: "🏦",
      isStablecoin: true,
    },
    {
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      decimals: 8,
      logo: "₿",
    },
    {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logo: "Ⓔ",
    },
    {
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      symbol: "UNI",
      name: "Uniswap",
      decimals: 18,
      logo: "🦄",
    },
    {
      address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
      symbol: "MATIC",
      name: "Polygon",
      decimals: 18,
      logo: "🔷",
    },
    {
      address: "0x514910771af9ca656af840dff83e8264ecf986ca",
      symbol: "LINK",
      name: "ChainLink Token",
      decimals: 18,
      logo: "🔗",
    },
    {
      address: "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b",
      symbol: "CRO",
      name: "Cronos Coin",
      decimals: 8,
      logo: "🔴",
    },
    {
      address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
      symbol: "stETH",
      name: "Lido Staked Ether",
      decimals: 18,
      logo: "🔥",
    },
    {
      address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
      symbol: "SHIB",
      name: "SHIBA INU",
      decimals: 18,
      logo: "🐕",
    },
    {
      address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      symbol: "BUSD",
      name: "Binance USD",
      decimals: 18,
      logo: "🟡",
      isStablecoin: true,
    },
    {
      address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
      symbol: "MKR",
      name: "Maker",
      decimals: 18,
      logo: "🏛️",
    },
    {
      address: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
      symbol: "ENS",
      name: "Ethereum Name Service",
      decimals: 18,
      logo: "🌐",
    },
    {
      address: "0x111111111117dc0aa78b770fa6a738034120c302",
      symbol: "1INCH",
      name: "1INCH Token",
      decimals: 18,
      logo: "1️⃣",
    },
    {
      address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      symbol: "AAVE",
      name: "Aave Token",
      decimals: 18,
      logo: "👻",
    },
    {
      address: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
      symbol: "GRT",
      name: "The Graph",
      decimals: 18,
      logo: "📊",
    },
    {
      address: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
      symbol: "PEPE",
      name: "Pepe",
      decimals: 18,
      logo: "🐸",
    },
    {
      address: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
      symbol: "MEME",
      name: "Memecoin",
      decimals: 18,
      logo: "😂",
    },
  ],
  137: [
    {
      address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      symbol: "MATIC",
      name: "Polygon",
      decimals: 18,
      logo: "🔷",
      isNative: true,
    },
    {
      address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logo: "💵",
      isStablecoin: true,
    },
    {
      address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      logo: "💰",
      isStablecoin: true,
    },
    {
      address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      logo: "🏦",
      isStablecoin: true,
    },
    {
      address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
      logo: "₿",
    },
    {
      address: "0x7ceb23fd6c7194c3d80794a32c4a7e6b8bcae2b1",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logo: "Ⓔ",
    },
    {
      address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
      symbol: "UNI",
      name: "Uniswap",
      decimals: 18,
      logo: "🦄",
    },
    {
      address: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
      symbol: "LINK",
      name: "ChainLink Token",
      decimals: 18,
      logo: "�",
    },
    {
      address: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
      symbol: "AAVE",
      name: "Aave",
      decimals: 18,
      logo: "👻",
    },
    {
      address: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      symbol: "SUSHI",
      name: "SushiToken",
      decimals: 18,
      logo: "🍣",
    },
  ],
};

interface TokenSelectProps {
  tokens: (typeof TOKENS)[1];
  selectedToken: string;
  onTokenSelect: (address: string) => void;
  label: string;
}

const TokenSelect: React.FC<TokenSelectProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTokenData = tokens.find((t) => t.address === selectedToken);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedTokenData ? (
          <>
            <span className="text-xl">{selectedTokenData.logo}</span>
            <div className="flex-1">
              <div className="font-medium">{selectedTokenData.symbol}</div>
              <div className="text-sm text-gray-500">
                {selectedTokenData.name}
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500">Select a token</div>
        )}
        <ArrowUpDown className="w-4 h-4 text-gray-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto"
          >
            {tokens.map((token) => (
              <div
                key={token.address}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  onTokenSelect(token.address);
                  setIsOpen(false);
                }}
              >
                <span className="text-xl">{token.logo}</span>
                <div className="flex-1">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm text-gray-500">{token.name}</div>
                </div>
                {token.isStablecoin && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Stable
                  </span>
                )}
                {token.isNative && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Native
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LimitOrderInterface: React.FC = () => {
  const [sellToken, setSellToken] = useState("");
  const [buyToken, setBuyToken] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [expiry, setExpiry] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [showMarketDepth, setShowMarketDepth] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [marketStatsData, setMarketStatsData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [orderBookData, setOrderBookData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [marketDepthData, setMarketDepthData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [optimalPricingData, setOptimalPricingData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [protocolFeeData, setProtocolFeeData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [gasEstimateData, setGasEstimateData] = useState<Record<
    string,
    unknown
  > | null>(null);

  const { isConnected, chainId } = useWalletState();
  const { isDemoMode } = useDemoMode();
  const {
    activeOrders,
    totalActiveOrders,
    orderStats,
    createLimitOrder,
    cancelLimitOrder,
    isCreating,
    isCanceling,
    isLoadingStats,
    getQuote,
    getPopularPairs,
    getRecentActivity,
    getMarketStats,
    getOrderBook,
    getMarketDepth,
    getOptimalPricing,
    getGasEstimate,
    getProtocolFee,
    error,
  } = useLimitOrders();

  const availableTokens = TOKENS[chainId as keyof typeof TOKENS] || TOKENS[1];

  // Auto-calculate buy amount based on target price
  useEffect(() => {
    if (sellAmount && targetPrice) {
      // This would be calculated differently based on the order type and tokens
      // For now, we'll just trigger a re-render when these values change
    }
  }, [sellAmount, targetPrice]);

  // Get suggested price from 1inch
  const getSuggestedPrice = async () => {
    if (!sellToken || !buyToken || !sellAmount) return;

    setIsCalculatingPrice(true);
    try {
      const quote = await getQuote(
        sellToken,
        buyToken,
        (parseFloat(sellAmount) * 10 ** 18).toString(),
      );
      if (quote && typeof quote === "object" && "price" in quote) {
        setTargetPrice(String(quote.price));
      }
    } catch (error) {
      console.error("Failed to get price suggestion:", error);
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Set default expiry to 24 hours from now
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setExpiry(tomorrow.toISOString().slice(0, 16));
  }, []);

  const handleCreateOrder = async () => {
    if (!isConnected && !isDemoMode) {
      toast.error("Please connect your wallet or enable demo mode");
      return;
    }

    if (!sellToken || !buyToken || !sellAmount || !targetPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (sellToken === buyToken) {
      toast.error("Cannot trade the same token");
      return;
    }

    try {
      const buyAmount = (
        parseFloat(sellAmount) * parseFloat(targetPrice)
      ).toString();

      await createLimitOrder({
        sellToken,
        buyToken,
        sellAmount,
        buyAmount,
        expiry: new Date(expiry).getTime() / 1000,
      });

      toast.success(
        isDemoMode
          ? "Demo limit order created successfully!"
          : "Limit order created successfully!",
      );

      // Reset form
      setSellAmount("");
      setTargetPrice("");
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Failed to create limit order");
    }
  };

  const swapTokens = () => {
    const tempToken = sellToken;
    setSellToken(buyToken);
    setBuyToken(tempToken);
    // Recalculate target price for reverse direction
    if (targetPrice) {
      setTargetPrice((1 / parseFloat(targetPrice)).toString());
    }
  };

  const getSellTokenData = () =>
    availableTokens.find((t) => t.address === sellToken);
  const getBuyTokenData = () =>
    availableTokens.find((t) => t.address === buyToken);

  const isOrderValid =
    sellToken && buyToken && sellAmount && targetPrice && expiry;
  const estimatedReceive =
    sellAmount && targetPrice
      ? (parseFloat(sellAmount) * parseFloat(targetPrice)).toFixed(6)
      : "0";

  return (
    <div className="space-y-6">
      {/* Order Statistics */}
      {orderStats && !isLoadingStats && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {String(orderStats.active || 0)}
              </div>
              <div className="text-sm text-gray-600">Active Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {String(orderStats.filled || 0)}
              </div>
              <div className="text-sm text-gray-600">Filled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {String(orderStats.cancelled || 0)}
              </div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {String(orderStats.count || 0)}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </Card>
      )}

      {/* Create Order Form */}
      <Card className="p-6" gradient>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">Create Limit Order</h3>
            <p className="text-sm text-gray-500 mt-1">
              Set a target price and trade automatically when reached
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Connection Status */}
        {!isConnected && !isDemoMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Connect your wallet or enable demo mode to create limit orders
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Order Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={orderType === "buy" ? "primary" : "ghost"}
              onClick={() => setOrderType("buy")}
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy Order
            </Button>
            <Button
              variant={orderType === "sell" ? "primary" : "ghost"}
              onClick={() => setOrderType("sell")}
              className="flex-1"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell Order
            </Button>
          </div>

          {/* Token Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TokenSelect
              tokens={availableTokens}
              selectedToken={sellToken}
              onTokenSelect={setSellToken}
              label={orderType === "buy" ? "Pay with" : "Sell"}
            />

            <div className="relative">
              <TokenSelect
                tokens={availableTokens}
                selectedToken={buyToken}
                onTokenSelect={setBuyToken}
                label={orderType === "buy" ? "Receive" : "For"}
              />

              {/* Swap Button */}
              <div className="absolute -left-6 top-12 md:top-16">
                <motion.button
                  whileHover={{ rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-white border-2 border-gray-200 shadow-md hover:shadow-lg"
                  onClick={swapTokens}
                >
                  <ArrowUpDown className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Popular Trading Pairs */}
          {getPopularPairs().length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-blue-50 rounded-lg p-4"
            >
              <h4 className="text-sm font-medium text-blue-900 mb-3">
                Popular Trading Pairs
              </h4>
              <div className="flex flex-wrap gap-2">
                {getPopularPairs().map((pair, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSellToken(String(pair.makerAsset || ""));
                      setBuyToken(String(pair.takerAsset || ""));
                    }}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded-full transition-colors"
                  >
                    {String(pair.makerSymbol || "")}/
                    {String(pair.takerSymbol || "")} (
                    {String(pair.orderCount || 0)})
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Amount and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to {orderType}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="text-right pr-16"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                  {getSellTokenData()?.symbol || "Token"}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Price
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="text-right pr-20"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                  {getBuyTokenData()?.symbol || "Token"}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-gray-500">
                  Price per {getSellTokenData()?.symbol || "token"}
                </div>
                {sellToken && buyToken && sellAmount && (
                  <button
                    onClick={getSuggestedPrice}
                    disabled={isCalculatingPrice}
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    {isCalculatingPrice ? "Loading..." : "Get market price"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Estimated Receive */}
          {sellAmount && targetPrice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-blue-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  You will receive approximately:
                </span>
                <span className="text-lg font-bold text-blue-900">
                  {estimatedReceive} {getBuyTokenData()?.symbol || ""}
                </span>
              </div>
            </motion.div>
          )}

          {/* Advanced Settings */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t pt-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Expiry Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Order will be automatically cancelled if not filled by this
                    time
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Summary */}
          {isOrderValid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gray-50 rounded-lg p-4 space-y-3"
            >
              <h4 className="font-medium text-gray-900">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order Type</span>
                  <span className="capitalize font-medium">{orderType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trading Pair</span>
                  <span className="font-medium">
                    {getSellTokenData()?.symbol}/{getBuyTokenData()?.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Target Price</span>
                  <span className="font-medium">
                    {targetPrice} {getBuyTokenData()?.symbol} per{" "}
                    {getSellTokenData()?.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span className="font-medium">
                    {sellAmount} {getSellTokenData()?.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Receive</span>
                  <span className="font-medium">
                    {estimatedReceive} {getBuyTokenData()?.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expires</span>
                  <span className="font-medium">
                    {new Date(expiry).toLocaleDateString()} at{" "}
                    {new Date(expiry).toLocaleTimeString()}
                  </span>
                </div>
                {isDemoMode && (
                  <div className="flex justify-between border-t pt-2">
                    <span>Mode</span>
                    <span className="font-medium text-orange-600">Demo</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Create Order Button */}
          <Button
            onClick={handleCreateOrder}
            loading={isCreating}
            disabled={!isOrderValid || isCreating}
            className="w-full"
            size="lg"
          >
            <Target className="w-4 h-4 mr-2" />
            {isDemoMode ? "Create Demo Order" : "Create Limit Order"}
          </Button>
        </div>
      </Card>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Active Orders ({totalActiveOrders})
            </h3>
            <div className="text-sm text-gray-500">
              {isDemoMode && "Demo Mode"}
            </div>
          </div>

          <div className="space-y-3">
            {activeOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">
                      {order.makingAmount} → {order.takingAmount}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Expires: {new Date(order.expiresAt).toLocaleDateString()}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancelLimitOrder(order.id)}
                  loading={isCanceling}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Order Activity */}
      {getRecentActivity().length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <div className="text-sm text-gray-500">Latest order events</div>
          </div>

          <div className="space-y-3">
            {getRecentActivity()
              .slice(0, 5)
              .map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        String(event.type) === "OrderCreated"
                          ? "bg-blue-500"
                          : String(event.type) === "OrderFilled"
                          ? "bg-green-500"
                          : String(event.type) === "OrderCancelled"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-sm">
                        {String(event.type)
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(String(event.timestamp)).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Block #{String(event.blockNumber)}
                  </div>
                </motion.div>
              ))}
          </div>
        </Card>
      )}

      {/* Advanced Features Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Advanced Market Analysis</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide" : "Show"} Advanced
          </Button>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Market Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Market Stats
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const stats = await getMarketStats();
                          setMarketStatsData(stats);
                          toast.success("Market stats updated");
                        } catch {
                          toast.error("Failed to load market stats");
                        }
                      }}
                    >
                      Refresh
                    </Button>
                  </div>
                  {marketStatsData && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Orders:</span>
                        <span className="font-medium">
                          {marketStatsData.global?.totalOrders || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>24h Volume:</span>
                        <span className="font-medium">
                          ${marketStatsData.global?.totalVolume24h || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Orders:</span>
                        <span className="font-medium">
                          {marketStatsData.global?.activeOrders || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Order Book
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!sellToken || !buyToken) {
                          toast.error("Please select tokens first");
                          return;
                        }
                        try {
                          const orderBook = await getOrderBook(
                            sellToken,
                            buyToken,
                          );
                          setOrderBookData(orderBook);
                          setShowOrderBook(true);
                          toast.success("Order book loaded");
                        } catch {
                          toast.error("Failed to load order book");
                        }
                      }}
                    >
                      Load
                    </Button>
                  </div>
                  {orderBookData && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Best Bid:</span>
                        <span className="font-medium text-green-600">
                          ${orderBookData.stats?.bestBid || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Best Ask:</span>
                        <span className="font-medium text-red-600">
                          ${orderBookData.stats?.bestAsk || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spread:</span>
                        <span className="font-medium">
                          {orderBookData.stats?.spread || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Market Depth
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!sellToken || !buyToken) {
                          toast.error("Please select tokens first");
                          return;
                        }
                        try {
                          const depth = await getMarketDepth(
                            sellToken,
                            buyToken,
                            10,
                          );
                          setMarketDepthData(depth);
                          setShowMarketDepth(true);
                          toast.success("Market depth loaded");
                        } catch {
                          toast.error("Failed to load market depth");
                        }
                      }}
                    >
                      Analyze
                    </Button>
                  </div>
                  {marketDepthData && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Bid Volume:</span>
                        <span className="font-medium">
                          ${marketDepthData.totalBidVolume || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ask Volume:</span>
                        <span className="font-medium">
                          ${marketDepthData.totalAskVolume || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Market Price:</span>
                        <span className="font-medium">
                          ${marketDepthData.marketPrice || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Optimal Pricing Analysis */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900">
                    Smart Pricing Assistant
                  </h4>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (!sellToken || !buyToken || !sellAmount) {
                        toast.error("Please fill in trade details first");
                        return;
                      }
                      try {
                        const pricing = await getOptimalPricing(
                          sellToken,
                          buyToken,
                          sellAmount,
                        );
                        setOptimalPricingData(pricing);
                        toast.success("Pricing analysis complete");
                      } catch {
                        toast.error("Failed to analyze pricing");
                      }
                    }}
                  >
                    Analyze Pricing
                  </Button>
                </div>

                {optimalPricingData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {optimalPricingData.strategies?.map(
                      (strategy: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg border"
                        >
                          <div className="font-medium text-sm text-gray-900 mb-1">
                            {strategy.name}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {strategy.description}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span className="font-medium">
                                ${strategy.suggestedPrice}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fill Time:</span>
                              <span>{strategy.expectedFillTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Probability:</span>
                              <span className="text-green-600">
                                {strategy.fillProbability}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              setTargetPrice(strategy.suggestedPrice);
                              toast.success(`Applied ${strategy.name} pricing`);
                            }}
                          >
                            Use This Price
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {optimalPricingData?.recommendations && (
                  <div className="mt-4 p-3 bg-white rounded-lg border">
                    <h5 className="font-medium text-sm text-gray-900 mb-2">
                      Recommendations
                    </h5>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {optimalPricingData.recommendations.map(
                        (rec: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Protocol Fee & Gas Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Protocol Fees
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const fees = await getProtocolFee();
                          setProtocolFeeData(fees);
                          toast.success("Fee information updated");
                        } catch {
                          toast.error("Failed to load fee info");
                        }
                      }}
                    >
                      Check Fees
                    </Button>
                  </div>
                  {protocolFeeData && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Protocol Fee:</span>
                        <span className="font-medium">
                          {protocolFeeData.protocolFee?.percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maker Fee:</span>
                        <span className="font-medium">
                          {protocolFeeData.feeStructure?.makerFee}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taker Fee:</span>
                        <span className="font-medium">
                          {protocolFeeData.feeStructure?.takerFee}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Gas Estimate
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!sellToken || !buyToken || !sellAmount) {
                          toast.error("Please fill in order details first");
                          return;
                        }
                        try {
                          const calculatedBuyAmount =
                            sellAmount && targetPrice
                              ? (
                                  parseFloat(sellAmount) *
                                  parseFloat(targetPrice)
                                ).toString()
                              : "0";
                          const orderData = {
                            makerAsset: sellToken,
                            takerAsset: buyToken,
                            makingAmount: sellAmount,
                            takingAmount: calculatedBuyAmount,
                          };
                          const gas = await getGasEstimate(orderData);
                          setGasEstimateData(gas);
                          toast.success("Gas estimate updated");
                        } catch {
                          toast.error("Failed to estimate gas");
                        }
                      }}
                    >
                      Estimate
                    </Button>
                  </div>
                  {gasEstimateData && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estimated Gas:</span>
                        <span className="font-medium">
                          {String(gasEstimateData.estimatedGas) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Standard Cost:</span>
                        <span className="font-medium">
                          $
                          {String(
                            (gasEstimateData as Record<string, unknown>)
                              ?.gasPrices?.["standard"]?.["cost"]?.["usd"],
                          ) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fast Cost:</span>
                        <span className="font-medium">
                          $
                          {String(
                            (gasEstimateData as Record<string, unknown>)
                              ?.gasPrices?.["fast"]?.["cost"]?.["usd"],
                          ) || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Help Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">
              How Limit Orders Work
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Set a target price for your trade</li>
              <li>• Order executes automatically when price is reached</li>
              <li>• No slippage - you get exactly the price you set</li>
              <li>• Orders expire if not filled by the deadline</li>
              <li>• Cancel anytime before execution</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
