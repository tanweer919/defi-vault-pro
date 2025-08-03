import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Load and cache active token pairs
let activePairsCache: { makerAsset: string; takerAsset: string }[] | null =
  null;

function loadActivePairs() {
  if (activePairsCache) return activePairsCache;

  try {
    const filePath = path.join(process.cwd(), "active-pairs.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    activePairsCache = data.items || [];
    return activePairsCache;
  } catch (error) {
    console.error("Failed to load active pairs:", error);
    return [];
  }
}

function getTokenSymbol(address: string): string {
  const knownTokens: Record<string, string> = {
    // Real token addresses from active-pairs.json
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH", // Wrapped Ethereum
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC", // USD Coin
    "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT", // Tether USD
    "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI", // Dai Stablecoin
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "UNI", // Uniswap
    "0x0000000000085d4780b73119b644ae5ecd22b376": "TrueUSD", // TrueUSD
    "0x000000000000d0151e748d25b766e77efe2a6c83": "HAM", // HAM token
    "0x0000000000300dd8b0230efcfef136ecdf6abcde": "PLEB", // PLEB token
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC", // Wrapped Bitcoin
    "0x514910771af9ca656af840dff83e8264ecf986ca": "LINK", // Chainlink
    "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": "AAVE", // Aave
    "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a": "SUSHI", // SushiSwap
    "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce": "SHIB", // Shiba Inu
    "0x111111111117dc0aa78b770fa6a738034120c302": "1INCH", // 1inch
    "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b": "CRO", // Crypto.com Coin
    "0x0d8775f648430679a709e98d2b0cb6250d2887ef": "BAT", // Basic Attention Token
    "0x4fabb145d64652a948d72533023f6e7a623c7c53": "BUSD", // Binance USD
    "0x853d955acef822db058eb8505911ed77f175b99e": "FRAX", // Frax
    "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0": "FXS", // Frax Share
    "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0": "MATIC", // Polygon (Matic)
    "0x4e15361fd6b4bb609fa63c81a2be19d873717870": "FTM", // Fantom
    "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9": "FTT", // FTX Token
    "0xd533a949740bb3306d119cc777fa900ba034cd52": "CRV", // Curve DAO Token
    "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f": "SNX", // Synthetix
    "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e": "YFI", // yearn.finance
    "0x1776e1f26f98b1a5df9cd347953a26dd3cb46671": "NMR", // Numeraire
    "0xa693b19d2931d498c5b318df961919bb4aee87a5": "UST", // TerraUSD (Classic)
    "0x956f47f50a910163d8bf957cf5846d573e7f87ca": "FEI", // Fei USD
    "0x6f259637dcd74c767781e37bc6133cd6a68aa161": "HEX", // HEX
  };

  return knownTokens[address.toLowerCase()] || "TOKEN";
}

function getPopularTokenPairs(limit: number = 50): {
  baseToken: string;
  quoteToken: string;
  symbol: string;
}[] {
  const pairs = loadActivePairs();
  const popularPairs: {
    baseToken: string;
    quoteToken: string;
    symbol: string;
  }[] = [];

  // Take more pairs to increase variety, but filter out duplicates and unknown tokens
  const seenPairs = new Set<string>();

  for (const pair of pairs.slice(0, Math.min(200, pairs.length))) {
    const baseSymbol = getTokenSymbol(pair.makerAsset);
    const quoteSymbol = getTokenSymbol(pair.takerAsset);

    // Skip pairs with unknown tokens
    if (baseSymbol === "TOKEN" || quoteSymbol === "TOKEN") {
      continue;
    }

    // Create a consistent pair key for deduplication
    const pairKey = [
      pair.makerAsset.toLowerCase(),
      pair.takerAsset.toLowerCase(),
    ]
      .sort()
      .join("-");

    // Skip if we've already seen this pair
    if (seenPairs.has(pairKey)) {
      continue;
    }

    seenPairs.add(pairKey);
    popularPairs.push({
      baseToken: pair.makerAsset,
      quoteToken: pair.takerAsset,
      symbol: `${baseSymbol}/${quoteSymbol}`,
    });

    // Stop when we have enough pairs
    if (popularPairs.length >= limit) {
      break;
    }
  }

  return popularPairs;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> },
) {
  try {
    const { chainId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    console.log(`Fetching token pairs for chain ${chainId}, limit: ${limit}`);

    // Get popular token pairs from active-pairs.json
    const pairs = getPopularTokenPairs(limit);

    console.log(`Found ${pairs.length} valid token pairs`);

    return NextResponse.json({
      pairs,
      meta: {
        chainId: parseInt(chainId),
        totalPairs: pairs.length,
        source: "active-pairs.json",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching token pairs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch token pairs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
