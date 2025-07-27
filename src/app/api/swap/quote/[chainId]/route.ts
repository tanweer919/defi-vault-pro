import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string } }
) {
  try {
    const { chainId } = params;
    const { searchParams } = request.nextUrl;

    const queryString = searchParams.toString();

    const response = await fetch(
      `https://api.1inch.dev/swap/v6.0/${chainId}/quote?${queryString}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 10 } // Cache for 10 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch swap quote: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Swap quote API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swap quote' },
      { status: 500 }
    );
  }
}