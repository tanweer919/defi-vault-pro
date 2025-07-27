"use client";

import React, { useState } from "react";
import Image from "next/image";

interface TokenImageProps {
  src?: string | null;
  alt: string;
  symbol: string;
  size?: number;
  className?: string;
}

export const TokenImage: React.FC<TokenImageProps> = ({
  src,
  alt,
  symbol,
  size = 24,
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  // If no src provided or error occurred, show fallback
  if (!src || hasError) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: Math.max(8, size * 0.35),
          minWidth: size,
          minHeight: size,
        }}
      >
        {symbol.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      onError={() => setHasError(true)}
      unoptimized
    />
  );
};
