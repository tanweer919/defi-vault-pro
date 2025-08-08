import axios, { AxiosInstance } from "axios";
import { ChainId } from "../config/wagmi";

interface ApiResponse<T> {
  data: T;
  status: number;
}

class OneInchApiService {
  private client: AxiosInstance;

  constructor() {
    // Use Next.js API routes instead of direct 1inch API calls
    this.client = axios.create({
      baseURL: "/api",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000, // Increased timeout for server-side requests
    });

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error.response?.data || error.message);
        throw error;
      },
    );
  }

  async getWalletBalances(chainId: ChainId, address: string): Promise<any> {
    try {
      console.log(`Fetching balances for ${address} on chain ${chainId}`);

      const response = await this.client.get(`/balances/${chainId}/${address}`);

      console.log("Balance response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Balance fetch error:", error);
      throw new Error(
        `Failed to fetch balances: ${
          error.response?.data?.error || error.message
        }`,
      );
    }
  }

  async getTokenPrices(chainId: ChainId, tokens: string[]): Promise<any> {
    try {
      if (!tokens.length) return {};

      console.log(`Fetching prices for tokens on chain ${chainId}:`, tokens);

      const response = await this.client.post(`/prices/${chainId}`, {
        params: {
          tokens: tokens,
          currency: "USD",
        },
      });

      console.log("Price response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Price fetch error:", error);
      throw new Error(
        `Failed to fetch prices: ${
          error.response?.data?.error || error.message
        }`,
      );
    }
  }

  async getTokenMetadata(chainId: ChainId, address: string): Promise<any> {
    try {
      const response = await this.client.get(`/token/${chainId}`, {
        params: { address },
      });
      return response.data;
    } catch (error: any) {
      console.error("Token metadata error:", error);

      // Return basic metadata if API fails
      return {
        assets: {
          symbol: "UNKNOWN",
          name: "Unknown Token",
          decimals: 18,
          logoURI: null,
        },
      };
    }
  }

  async getTokenList(chainId: ChainId): Promise<any> {
    try {
      const response = await this.client.get(`/token/${chainId}`);
      return response.data;
    } catch (error: any) {
      console.error("Token list error:", error);
      throw error;
    }
  }

  async getSwapQuote(params: any): Promise<any> {
    try {
      const { chainId, ...queryParams } = params;

      const response = await this.client.get(`/swap/quote/${chainId}`, {
        params: queryParams,
      });
      return response.data;
    } catch (error: any) {
      console.error("Swap quote error:", error);
      throw error;
    }
  }

  async buildSwapTransaction(params: any): Promise<any> {
    try {
      const { chainId, ...bodyParams } = params;

      const response = await this.client.post(
        `/swap/build/${chainId}`,
        bodyParams,
      );
      return response.data;
    } catch (error: any) {
      console.error("Build swap transaction error:", error);
      throw error;
    }
  }

  async getTransactionHistory(
    address: string,
    chainId: ChainId,
    limit: number = 50,
    isDemoMode: boolean = false,
  ): Promise<any> {
    try {
      console.log(
        `Fetching transaction history for ${address} on chain ${chainId}`,
      );

      const response = await this.client.get(
        `/transactions/${chainId}/${address}`,
        {
          params: {
            limit,
            demo: isDemoMode ? "true" : "false",
          },
        },
      );

      console.log("Transaction history response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Transaction history fetch error:", error);
      throw new Error(
        `Failed to fetch transaction history: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getLimitOrders(chainId: ChainId, address: string): Promise<any[]> {
    try {
      console.log(`Fetching limit orders for ${address} on chain ${chainId}`);

      const response = await this.client.get(
        `/limit-orders/${chainId}/${address}`,
        {
          params: {
            demo: "false",
          },
        },
      );

      console.log("Limit orders response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Limit orders fetch error:", error);
      throw new Error(
        `Failed to fetch limit orders: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async createLimitOrder(
    chainId: ChainId,
    orderData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(`Creating limit order on chain ${chainId}:`, orderData);

      const response = await this.client.post(
        `/limit-orders/${chainId}`,
        orderData,
      );

      console.log("Create limit order response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Create limit order error:", error);
      throw new Error(
        `Failed to create limit order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async cancelLimitOrder(
    chainId: ChainId,
    orderId: string,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(`Canceling limit order ${orderId} on chain ${chainId}`);

      const response = await this.client.delete(
        `/limit-orders/${chainId}/cancel`,
        {
          params: { orderId },
        },
      );

      console.log("Cancel limit order response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Cancel limit order error:", error);
      throw new Error(
        `Failed to cancel limit order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  // Enhanced 1inch Limit Order APIs
  async getLimitOrderByHash(
    chainId: ChainId,
    orderHash: string,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(`Fetching limit order ${orderHash} on chain ${chainId}`);

      const response = await this.client.get(
        `/limit-orders/${chainId}/order/${orderHash}`,
      );

      console.log("Limit order by hash response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Limit order by hash fetch error:", error);
      throw new Error(
        `Failed to fetch limit order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getLimitOrdersCount(
    chainId: ChainId,
    filters?: Record<string, string>,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(`Fetching limit orders count on chain ${chainId}`, filters);

      const response = await this.client.get(`/limit-orders/${chainId}/count`, {
        params: filters,
      });

      console.log("Limit orders count response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Limit orders count fetch error:", error);
      throw new Error(
        `Failed to fetch limit orders count: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getLimitOrderEvents(
    chainId: ChainId,
    orderHash?: string,
  ): Promise<Record<string, unknown>[]> {
    try {
      console.log(`Fetching limit order events on chain ${chainId}`, orderHash);

      const endpoint = orderHash
        ? `/limit-orders/${chainId}/events/${orderHash}`
        : `/limit-orders/${chainId}/events`;

      const response = await this.client.get(endpoint);

      console.log("Limit order events response:", response.data);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: unknown) {
      console.error("Limit order events fetch error:", error);
      throw new Error(
        `Failed to fetch limit order events: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getActiveLimitOrdersWithPermit(
    chainId: ChainId,
    walletAddress: string,
    tokenAddress: string,
  ): Promise<Record<string, unknown>[]> {
    try {
      console.log(
        `Fetching active orders with permit for ${walletAddress} and token ${tokenAddress} on chain ${chainId}`,
      );

      const response = await this.client.get(
        `/limit-orders/${chainId}/has-permit/${walletAddress}/${tokenAddress}`,
      );

      console.log("Active orders with permit response:", response.data);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: unknown) {
      console.error("Active orders with permit fetch error:", error);
      throw new Error(
        `Failed to fetch active orders with permit: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getActiveTokenPairs(
    chainId: ChainId,
  ): Promise<Record<string, unknown>[]> {
    try {
      console.log(`Fetching active token pairs on chain ${chainId}`);

      const response = await this.client.get(
        `/limit-orders/${chainId}/active-pairs`,
      );

      console.log("Active token pairs response:", response.data);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: unknown) {
      console.error("Active token pairs fetch error:", error);
      throw new Error(
        `Failed to fetch active token pairs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getCalculatedMakingAmount(
    chainId: ChainId,
    makerAsset: string,
    takerAsset: string,
    takingAmount: string,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(
        `Calculating making amount for ${makerAsset}/${takerAsset} on chain ${chainId}`,
      );

      const response = await this.client.get(`/limit-orders/${chainId}/quote`, {
        params: {
          makerAsset,
          takerAsset,
          takingAmount,
        },
      });

      console.log("Calculated making amount response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Calculate making amount error:", error);
      throw new Error(
        `Failed to calculate making amount: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  // Additional enhanced 1inch Limit Order APIs
  async getAllLimitOrders(
    chainId: ChainId,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      statuses?: string[];
      makerAsset?: string;
      takerAsset?: string;
    },
  ): Promise<Record<string, unknown>> {
    try {
      console.log(`Fetching all limit orders on chain ${chainId}`, params);

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.statuses?.length)
        queryParams.append("statuses", params.statuses.join(","));
      if (params?.makerAsset)
        queryParams.append("makerAsset", params.makerAsset);
      if (params?.takerAsset)
        queryParams.append("takerAsset", params.takerAsset);

      const response = await this.client.get(
        `/limit-orders/${chainId}/all?${queryParams.toString()}`,
      );

      console.log("All limit orders response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("All limit orders fetch error:", error);
      throw new Error(
        `Failed to fetch all limit orders: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getMarketStats(
    chainId: ChainId,
    baseToken?: string,
    quoteToken?: string,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(`Fetching market stats on chain ${chainId}`, {
        baseToken,
        quoteToken,
      });

      const queryParams = new URLSearchParams();
      if (baseToken) queryParams.append("baseToken", baseToken);
      if (quoteToken) queryParams.append("quoteToken", quoteToken);

      const response = await this.client.get(
        `/limit-orders/${chainId}/market-stats?${queryParams.toString()}`,
      );

      console.log("Market stats response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Market stats fetch error:", error);
      throw new Error(
        `Failed to fetch market stats: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getOrderBookSnapshot(
    chainId: ChainId,
    baseToken: string,
    quoteToken: string,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(
        `Fetching order book for ${baseToken}/${quoteToken} on chain ${chainId}`,
      );

      const response = await this.client.get(
        `/limit-orders/${chainId}/orderbook`,
        {
          params: { baseToken, quoteToken },
        },
      );

      console.log("Order book response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Order book fetch error:", error);
      throw new Error(
        `Failed to fetch order book: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getMarketDepth(
    chainId: ChainId,
    baseToken: string,
    quoteToken: string,
    depth = 10,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(
        `Fetching market depth for ${baseToken}/${quoteToken} on chain ${chainId}`,
      );

      const response = await this.client.get(
        `/limit-orders/${chainId}/market-depth`,
        {
          params: { baseToken, quoteToken, depth: depth.toString() },
        },
      );

      console.log("Market depth response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Market depth fetch error:", error);
      throw new Error(
        `Failed to fetch market depth: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getOptimalPricing(
    chainId: ChainId,
    fromToken: string,
    toToken: string,
    amount: string,
    slippage = 1,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(
        `Fetching optimal pricing for ${fromToken} to ${toToken} on chain ${chainId}`,
      );

      const response = await this.client.get(
        `/limit-orders/${chainId}/optimal-price`,
        {
          params: { fromToken, toToken, amount, slippage: slippage.toString() },
        },
      );

      console.log("Optimal pricing response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Optimal pricing fetch error:", error);
      throw new Error(
        `Failed to fetch optimal pricing: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getOrderQuote(
    chainId: ChainId,
    fromToken: string,
    toToken: string,
    amount: string,
    side: "buy" | "sell" = "sell",
  ): Promise<Record<string, unknown>> {
    try {
      console.log(
        `Fetching order quote for ${fromToken} to ${toToken} on chain ${chainId}`,
      );

      const response = await this.client.get(
        `/limit-orders/${chainId}/order-quote`,
        {
          params: {
            fromTokenAddress: fromToken,
            toTokenAddress: toToken,
            amount,
            side,
          },
        },
      );

      console.log("Order quote response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Order quote fetch error:", error);
      throw new Error(
        `Failed to fetch order quote: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getGasEstimate(
    chainId: ChainId,
    orderData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(`Fetching gas estimate on chain ${chainId}`, orderData);

      const response = await this.client.post(
        `/limit-orders/${chainId}/gas-estimate`,
        orderData,
      );

      console.log("Gas estimate response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Gas estimate fetch error:", error);
      throw new Error(
        `Failed to fetch gas estimate: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getProtocolFee(chainId: ChainId): Promise<Record<string, unknown>> {
    try {
      console.log(`Fetching protocol fee on chain ${chainId}`);

      const response = await this.client.get(
        `/limit-orders/${chainId}/protocol-fee`,
      );

      console.log("Protocol fee response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Protocol fee fetch error:", error);
      throw new Error(
        `Failed to fetch protocol fee: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getAdvancedOrderTypes(
    chainId: ChainId,
  ): Promise<Record<string, unknown>[]> {
    try {
      console.log(`Fetching order types on chain ${chainId}`);

      const response = await this.client.get(
        `/limit-orders/${chainId}/order-types`,
      );

      console.log("Order types response:", response.data);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: unknown) {
      console.error("Order types fetch error:", error);
      throw new Error(
        `Failed to fetch order types: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async validateLimitOrderSignature(
    chainId: ChainId,
    orderData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      console.log(`Validating order signature on chain ${chainId}`, orderData);

      const response = await this.client.post(
        `/limit-orders/${chainId}/validate`,
        orderData,
      );

      console.log("Signature validation response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Signature validation error:", error);
      throw new Error(
        `Failed to validate signature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }
}

const oneInchApiService = new OneInchApiService();
export default oneInchApiService;
