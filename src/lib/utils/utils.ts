import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Converts wei (or any token's smallest unit) to the display unit
 * @param weiValue - The value in wei as a string or number
 * @param decimals - The number of decimals for the token (18 for ETH)
 * @returns The converted value as a number
 */
export function formatTokenBalance(
  weiValue: string | number,
  decimals: number,
): number {
  const value = typeof weiValue === "string" ? parseFloat(weiValue) : weiValue;
  return value / Math.pow(10, decimals);
}

/**
 * Formats a token balance for display with appropriate decimal places
 * @param weiValue - The value in wei as a string or number
 * @param decimals - The number of decimals for the token
 * @param displayDecimals - Number of decimal places to show (default: 5)
 * @returns Formatted balance string
 */
export function formatTokenBalanceDisplay(
  weiValue: string | number,
  decimals: number,
  displayDecimals: number = 5,
): string {
  const balance = formatTokenBalance(weiValue, decimals);
  return balance.toFixed(displayDecimals);
}
