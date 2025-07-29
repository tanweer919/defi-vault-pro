import { NextRequest, NextResponse } from "next/server";

// Enhanced transaction processing with DeFi protocol detection
const DEFI_PROTOCOLS = {
  // Uniswap
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "Uniswap V2",
  "0xe592427a0aece92de3edee1f18e0157c05861564": "Uniswap V3",

  // SushiSwap
  "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": "SushiSwap",

  // Compound
  "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b": "Compound",
  "0xc00e94cb662c3520282e6f5717214004a7f26888": "Compound",

  // Aave
  "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": "Aave V2",
  "0x87870bace4d1111f9c55c49e4b04a6ed25ea03e0": "Aave V3",

  // Curve
  "0xd51a44d3fae010294c616388b506acda1bfaae46": "Curve",

  // Balancer
  "0xba12222222228d8ba445958a75a0704d566bf2c8": "Balancer V2",

  // 1inch
  "0x1111111254fb6c44bac0bed2854e76f90643097d": "1inch",
  "0x1111111254eeb25477b68fb85ed929f73a960582": "1inch V4",
};

// Common ERC20 tokens for better classification
const COMMON_TOKENS = {
  "0xa0b86a33e6789c16928dc2cf7c4a34f40b1a0b2c": "USDC",
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
  "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH",
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "UNI",
  "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": "AAVE",
  "0xc00e94cb662c3520282e6f5717214004a7f26888": "COMP",
};

function detectTransactionType(tx: any): {
  type: string;
  protocol?: string;
  tokens?: string[];
} {
  const toAddress = tx.to?.toLowerCase();
  const inputData = tx.input || "0x";

  // Check if it's a DeFi protocol interaction
  const protocol = DEFI_PROTOCOLS[toAddress as keyof typeof DEFI_PROTOCOLS];

  if (protocol) {
    // Analyze input data to determine interaction type
    if (inputData.startsWith("0xa9059cbb")) {
      return { type: "token_transfer", protocol };
    } else if (inputData.startsWith("0x7ff36ab5")) {
      return { type: "swap", protocol };
    } else if (inputData.startsWith("0xe8e33700")) {
      return { type: "add_liquidity", protocol };
    } else if (inputData.startsWith("0xbaa2abde")) {
      return { type: "remove_liquidity", protocol };
    } else if (inputData.startsWith("0xa0712d68")) {
      return { type: "mint", protocol };
    } else if (inputData.startsWith("0x2e1a7d4d")) {
      return { type: "redeem", protocol };
    }

    return { type: "defi_interaction", protocol };
  }

  // Check if it's a simple ETH transfer
  if (inputData === "0x" || inputData === "0x0") {
    return { type: "eth_transfer" };
  }

  // Check if it's an ERC20 token transfer
  if (inputData.startsWith("0xa9059cbb")) {
    return { type: "token_transfer" };
  }

  return { type: "contract_interaction" };
}

function enhanceTransactionData(tx: any) {
  const analysis = detectTransactionType(tx);
  const valueInEth = parseFloat(tx.value) / 1e18;

  // Enhanced transaction object with better categorization
  return {
    hash: tx.hash,
    timeStamp: tx.timeStamp,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    valueInEth: valueInEth.toFixed(6),
    input: analysis.type,
    protocol: analysis.protocol || null,
    transactionType: analysis.type,
    fromToken: {
      symbol: analysis.type.includes("token") ? "UNKNOWN" : "ETH",
      logoURI: null,
    },
    toToken: {
      symbol: analysis.type.includes("token") ? "UNKNOWN" : "ETH",
      logoURI: null,
    },
    fromAmount: valueInEth.toFixed(6),
    toAmount: valueInEth.toFixed(6),
    status: tx.txreceipt_status || "1",
    gasUsed: tx.gasUsed,
    gasPrice: tx.gasPrice,
    isError: tx.isError || "0",
    txreceipt_status: tx.txreceipt_status || "1",
    gasCostInEth: (
      (parseFloat(tx.gasUsed || "0") * parseFloat(tx.gasPrice || "0")) /
      1e18
    ).toFixed(6),
    category: analysis.protocol
      ? "defi"
      : analysis.type.includes("token")
      ? "token"
      : "transfer",
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const body = await request.json();
    const { transactions } = body;

    if (!Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Invalid transactions data" },
        { status: 400 },
      );
    }

    // Process and enhance transaction data
    const enhancedTransactions = transactions.map(enhanceTransactionData);

    // Calculate analytics from the enhanced data
    const analytics = {
      totalTransactions: enhancedTransactions.length,
      defiInteractions: enhancedTransactions.filter(
        (tx) => tx.category === "defi",
      ).length,
      tokenTransfers: enhancedTransactions.filter(
        (tx) => tx.category === "token",
      ).length,
      ethTransfers: enhancedTransactions.filter(
        (tx) => tx.category === "transfer",
      ).length,
      protocols: [
        ...new Set(
          enhancedTransactions.map((tx) => tx.protocol).filter(Boolean),
        ),
      ],
      totalGasSpent: enhancedTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.gasCostInEth),
        0,
      ),
      avgGasPerTx:
        enhancedTransactions.length > 0
          ? enhancedTransactions.reduce(
              (sum, tx) => sum + parseFloat(tx.gasCostInEth),
              0,
            ) / enhancedTransactions.length
          : 0,
      successRate:
        enhancedTransactions.length > 0
          ? (enhancedTransactions.filter((tx) => tx.status === "1").length /
              enhancedTransactions.length) *
            100
          : 0,
    };

    return NextResponse.json({
      transactions: enhancedTransactions,
      analytics,
      chainId,
      processed: true,
    });
  } catch (error: unknown) {
    console.error("Transaction processing error:", error);

    return NextResponse.json(
      { error: "Failed to process transactions" },
      { status: 500 },
    );
  }
}
