/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["tokens.1inch.io"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
