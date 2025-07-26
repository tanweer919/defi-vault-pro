import axios, { AxiosInstance } from 'axios';
import { ChainId } from '../config/wagmi';

interface ApiResponse<T> {
  data: T;
  status: number;
}

class OneInchApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.1inch.dev',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('1inch API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Fixed balance fetching with proper error handling
  async getWalletBalances(chainId: ChainId, address: string): Promise<any> {
    try {
      console.log(`Fetching balances for ${address} on chain ${chainId}`);
      
      const response = await this.client.get(
        `/balance/v1.2/${chainId}/balances/${address}`
      );
      
      console.log('Balance response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Balance fetch error:', error);
      
      // Return mock data if API fails (for development)
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
        console.warn('Using mock balance data for development');
        return this.getMockBalanceData(chainId);
      }
      
      throw new Error(`Failed to fetch balances: ${error.response?.data?.message || error.message}`);
    }
  }

  async getTokenPrices(chainId: ChainId, tokens: string[]): Promise<any> {
    try {
      if (!tokens.length) return {};
      
      console.log(`Fetching prices for tokens on chain ${chainId}:`, tokens);
      
      const response = await this.client.get(
        `/price/v1.1/${chainId}`,
        {
          params: {
            tokens: tokens.join(','),
            currency: 'USD'
          }
        }
      );
      
      console.log('Price response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Price fetch error:', error);
      
      // Return mock prices if API fails
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
        return this.getMockPriceData(tokens);
      }
      
      throw new Error(`Failed to fetch prices: ${error.response?.data?.message || error.message}`);
    }
  }

  async getTokenMetadata(chainId: ChainId, address: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/token/v1.2/${chainId}/custom`,
        {
          params: { address }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Token metadata error:', error);
      
      // Return basic metadata if API fails
      return {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18,
        logoURI: null
      };
    }
  }

  // Mock data for development/testing
  private getMockBalanceData(chainId: ChainId) {
    const mockTokens = {
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': '1.5', // ETH
      '0xa0b86a33e6441e5ba2ad8d73b8e76c6b72c2e6ef': '1000.0', // USDC
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': '0.05' // WBTC
    };
    
    return mockTokens;
  }

  private getMockPriceData(tokens: string[]) {
    const mockPrices: Record<string, number> = {};
    
    tokens.forEach(token => {
      if (token.includes('eeeeeeee')) {
        mockPrices[token] = 2800; // ETH price
      } else if (token.includes('a0b86a33')) {
        mockPrices[token] = 1; // USDC price
      } else if (token.includes('2260fac5')) {
        mockPrices[token] = 45000; // WBTC price
      } else {
        mockPrices[token] = Math.random() * 100; // Random price
      }
    });
    
    return mockPrices;
  }

  // Add other API methods with similar error handling...
  async getSwapQuote(params: any): Promise<any> {
    try {
      const response = await this.client.get(
        `/swap/v6.0/${params.chainId}/quote`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Swap quote error:', error);
      throw error;
    }
  }
}

export default new OneInchApiService();
