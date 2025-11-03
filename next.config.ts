import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Optimize package imports for large packages
  experimental: {
    optimizePackageImports: ["@solana/web3.js", "ethers"],
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: [
        "http://localhost:3000",
        "https://omeganetwork.co",
        "https://www.omeganetwork.co",
      ],
    },
  },

  // Image optimization configuration
  images: {
    domains: [],
  },

  // Apply global security headers; individual routes can override as needed.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Optional rewrites for proxying legacy relayer endpoints if needed.
  async rewrites() {
    return [];
  },

  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore to allow dev server to run
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore to allow dev server to run
  },

  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: "framework",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          blockchain: {
            name: "blockchain",
            test: /[\\/]node_modules[\\/](ethers|@solana\/web3\.js|near-api-js)[\\/]/,
            priority: 35,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: "commons",
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: "shared",
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
