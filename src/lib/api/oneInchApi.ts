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
        throw error;
      },
    );
  }

  async getWalletBalances(chainId: ChainId, address: string): Promise<any> {
    try {

      const response = await this.client.get(`/balances/${chainId}/${address}`);

      return response.data;
    } catch (error: any) {
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

      g(`Fetching prices for tokens on chain ${chainId}:`, tokens);

      const response = await this.client.post(`/prices/${chainId}`, {
        params: {
          tokens: tokens,
          currency: "USD",
        },
      });

      return response.data;
    } catch (error: any) {
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

  async getSwapQuote(params: any): Promise<any> {
    try {
      const { chainId, ...queryParams } = params;

      const response = await this.client.get(`/swap/quote/${chainId}`, {
        params: queryParams,
      });
      return response.data;
    } catch (error: any) {
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
      throw error;
    }
  }

  async getTransactionHistory(
    address: string,
    chainId: ChainId,
    limit: number = 50,
  ): Promise<any> {
    try {

      const response = await this.client.get(
        `/transactions/${chainId}/${address}`,
        {
          params: { limit },
        },
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        `Failed to fetch transaction history: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async getLimitOrders(chainId: ChainId, address: string): Promise<any[]> {
    try {

      const response = await this.client.get(
        `/limit-orders/${chainId}/${address}`,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        `Failed to fetch limit orders: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async createLimitOrder(chainId: ChainId, orderData: any): Promise<any> {
    try {

      const response = await this.client.post(
        `/limit-orders/${chainId}`,
        orderData,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        `Failed to create limit order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async cancelLimitOrder(chainId: ChainId, orderId: string): Promise<any> {
    try {

      const response = await this.client.delete(
        `/limit-orders/${chainId}/cancel`,
        {
          params: { orderId },
        },
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        `Failed to cancel limit order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }
}

export default new OneInchApiService();
