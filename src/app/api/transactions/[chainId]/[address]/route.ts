import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; address: string }> }
) {
  try {
    const { chainId, address } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';

    // Since 1inch doesn't provide transaction history API,
    // we'll use a blockchain explorer API (like Etherscan for Ethereum)
    // or return mock data for development

    if (process.env.NODE_ENV === 'development') {
      // Return mock transaction data for development
      const mockTransactions = Array.from({ length: parseInt(limit) }, (_, i) => ({
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        timeStamp: Math.floor(Date.now() / 1000) - (i * 3600),
        from: address,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        value: (Math.random() * 10).toFixed(6),
        input: i % 3 === 0 ? 'swap' : 'transfer',
        fromToken: {
          symbol: ['ETH', 'USDC', 'WBTC'][i % 3],
          logoURI: null
        },
        toToken: {
          symbol: ['USDC', 'WBTC', 'ETH'][i % 3],
          logoURI: null
        },
        fromAmount: (Math.random() * 100).toFixed(6),
        toAmount: (Math.random() * 100).toFixed(6),
        status: '1',
        gasUsed: '21000',
        gasPrice: '20000000000'
      }));

      return NextResponse.json({
        result: mockTransactions,
        status: '1',
        message: 'OK'
      });
    }

    // For production, you would implement actual blockchain explorer API calls
    // For example, using Etherscan API:
    // const response = await fetch(
    //   `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`
    // );

    return NextResponse.json({
      result: [],
      status: '1',
      message: 'No transactions found'
    });

  } catch (error: unknown) {
    console.error('Transaction history API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
} 