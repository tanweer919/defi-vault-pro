// Core token and balance types
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId?: number;
}

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  price: number;
  value: number;
  logo?: string;
  change24h?: number;
  marketCap?: number;
  volume24h?: number;
}

export interface PortfolioData {
  items: TokenBalance[];
  totalValue: number;
  change24h: number;
  change7d?: number;
  change30d?: number;
  chainId: number;
  lastUpdated?: Date;
  totalAssets?: number;
  topPerformer?: TokenBalance;
  worstPerformer?: TokenBalance;
}

// Swap related types
export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  protocols: Protocol[];
  estimatedGas: string;
  slippage: number;
  priceImpact: number;
  minimumReceived: string;
  route?: SwapRoute[];
}

export interface SwapRoute {
  protocol: string;
  percentage: number;
  fromToken: Token;
  toToken: Token;
}

export interface Protocol {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}

export interface SwapTransaction {
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
}

// Limit order types
export interface LimitOrder {
  id: string;
  maker: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  salt: string;
  signature: string;
  status: "active" | "filled" | "cancelled" | "expired";
  createdAt: Date;
  expiresAt?: Date;
  filledAmount?: string;
  remainingAmount?: string;
  makerToken?: Token;
  takerToken?: Token;
}

export interface CreateLimitOrderParams {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  expiry: number;
  maker?: string;
}

// Transaction types
export interface Transaction {
  id: string;
  type: "swap" | "transfer" | "approve" | "deposit" | "withdraw";
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  fromToken: {
    symbol: string;
    amount: string;
    logo?: string;
    address?: string;
  };
  toToken: {
    symbol: string;
    amount: string;
    logo?: string;
    address?: string;
  };
  status: "success" | "pending" | "failed";
  gasUsed: string;
  gasPrice: string;
  gasCost?: number;
  blockNumber?: number;
  confirmations?: number;
  value?: string;
  nonce?: number;
}

export interface TransactionHistory {
  transactions: Transaction[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

// Market data types
export interface MarketData {
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  rank: number;
  dominance?: number;
}

export interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  website?: string;
  description?: string;
  marketData?: MarketData;
  tags?: string[];
  chainId: number;
}

// Price alert types
export interface PriceAlert {
  id: string;
  token: string;
  symbol: string;
  currentPrice: number;
  targetPrice: number;
  condition: "above" | "below";
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  notificationMethod: "email" | "push" | "both";
  userId?: string;
}

// Yield farming types
export interface YieldPool {
  id: string;
  protocol: string;
  name: string;
  apy: number;
  apyRange?: {
    min: number;
    max: number;
  };
  tvl: number;
  rewards: string[];
  deposited: number;
  earned: number;
  logo: string;
  risk: "low" | "medium" | "high";
  category: "lending" | "liquidity" | "farming" | "staking";
  lockupPeriod?: number;
  minimumDeposit?: number;
  fees?: {
    deposit: number;
    withdraw: number;
    performance: number;
  };
  tokens?: Token[];
}

export interface YieldPosition {
  poolId: string;
  pool: YieldPool;
  deposited: number;
  earned: number;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  depositedAt: Date;
  lastHarvestAt?: Date;
}

// Analytics types
export interface PortfolioAnalytics {
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  winRate: number;
  bestPerformer: TokenBalance;
  worstPerformer: TokenBalance;
  averageYield: number;
  riskScore: number;
  diversificationScore: number;
  volatilityScore: number;
  liquidityScore: number;
  performance: PerformanceData[];
  allocation: AllocationData[];
  transactions: Transaction[];
}

export interface PerformanceData {
  date: string;
  time?: string;
  value: number;
  change: number;
  changePercentage: number;
  volume?: number;
}

export interface AllocationData {
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  color?: string;
}

// Risk analysis types
export interface RiskMetrics {
  overall: number;
  volatility: number;
  diversification: number;
  liquidity: number;
  concentration: number;
  drawdown: number;
}

export interface RiskAssessment {
  level: "low" | "medium" | "high";
  score: number;
  metrics: RiskMetrics;
  recommendations: string[];
}

// Chain and network types
export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
    public: {
      http: string[];
    };
  };
  blockExplorers: {
    default: {
      name: string;
      url: string;
    };
  };
  testnet?: boolean;
}

export interface NetworkStats {
  chainId: number;
  blockNumber: number;
  gasPrice: number;
  totalTransactions: number;
  totalAccounts: number;
  totalContracts: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// User preferences and settings
export interface UserSettings {
  currency: "USD" | "EUR" | "GBP" | "JPY";
  language: "en" | "es" | "fr" | "de" | "zh";
  theme: "light" | "dark" | "auto";
  notifications: {
    email: boolean;
  };
}

// Market stats types
export interface MarketStatsPair {
  pair: string;
  volume: string;
  orders: number;
}

export interface MarketStatsGlobal {
  totalOrders: number;
  activeOrders: number;
  totalVolume24h: string;
  totalValueLocked: string;
  averageOrderSize: string;
  topPairs: MarketStatsPair[];
}

export interface MarketStats {
  global: MarketStatsGlobal;
  chain?: {
    orders: number;
    volume24h: string;
    activePairs: number;
  };
  timestamp: string;
}

// Order book types
export interface OrderBookStats {
  bestBid: string;
  bestAsk: string;
  spread: string;
}

export interface OrderBook {
  stats: OrderBookStats;
  bids: Array<[string, string]>; // [price, amount]
  asks: Array<[string, string]>; // [price, amount]
}

// Market depth types
export interface MarketDepth {
  totalBidVolume: string;
  totalAskVolume: string;
  marketPrice: string;
  depth: Array<{
    price: string;
    cumulativeVolume: string;
    side: "bid" | "ask";
  }>;
}

// Optimal pricing types
export interface OptimalPricingStrategy {
  name: string;
  description: string;
  estimatedSavings: string;
  confidence: number;
  suggestedPrice: string;
  expectedFillTime: string;
  fillProbability: string;
}

export interface OptimalPricingRecommendation {
  type: string;
  title: string;
  description: string;
  impact: string;
  priority: "high" | "medium" | "low";
}

export interface OptimalPricing {
  strategies: OptimalPricingStrategy[];
  recommendations: OptimalPricingRecommendation[];
  currentPrice: string;
  optimalPrice: string;
}

// Protocol fee types
export interface ProtocolFeeStructure {
  makerFee: string;
  takerFee: string;
  volumeDiscount?: string;
}

export interface ProtocolFee {
  protocolFee: {
    percentage: string;
    minimumFee: string;
  };
  feeStructure: ProtocolFeeStructure;
  estimatedCost: string;
}
