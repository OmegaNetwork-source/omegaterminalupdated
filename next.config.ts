import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import path from "path";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Output file tracing root to silence workspace warning
  outputFileTracingRoot: require("path").join(__dirname),

  // Optimize package imports for large packages
  experimental: {
    optimizePackageImports: ["@solana/web3.js", "ethers"],
    // Disable ESM externals to treat rubic-sdk as CommonJS (fixes _interopRequireDefault error)
    esmExternals: false,
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: [
        "http://localhost:3000",
        "https://omeganetwork.co",
        "https://www.omeganetwork.co",
      ],
    },
  },

  // Transpile rubic-sdk to handle CommonJS module properly
  transpilePackages: ["rubic-sdk"],

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
    const webpack = require("webpack");
    if (!isServer) {
      // Configure webpack output to include runtime helpers
      // This ensures _interopRequireDefault and other helpers are available
      config.output = config.output || {};
      config.output.environment = {
        ...config.output.environment,
        arrowFunction: true,
        bigIntLiteral: false,
        const: true,
        destructuring: true,
        dynamicImport: true,
        forOf: true,
        module: true,
      };

      // Add fallbacks for Node.js modules that aren't available in the browser
      // Required for rubic-sdk according to: https://docs.rubic.finance/integrate-sdk/install-sdk
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        got: false,
        // Additional fallbacks required by rubic-sdk
        constants: false,
        querystring: false,
        url: false,
        path: false,
        os: false,
        zlib: false,
        http: require.resolve("http-browserify"),
        https: require.resolve("https-browserify"),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
      };

      // Configure webpack to prefer browser builds
      // This ensures packages with exports.browser use the browser version
      config.resolve.conditionNames = [
        "browser",
        "require",
        "import",
        "default",
      ];

      // Prioritize browser field in package.json over main/module
      config.resolve.mainFields = ["browser", "module", "main"];

      // Configure webpack for rubic-sdk according to official docs
      // https://docs.rubic.finance/integrate-sdk/install-sdk
      if (!config.plugins) config.plugins = [];

      // Add ProvidePlugin for Buffer and process (required by rubic-sdk)
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );

      // Fix CommonJS interop for rubic-sdk
      // Configure webpack to handle rubic-sdk as a CommonJS module without interop
      // This prevents webpack from generating _interopRequireDefault calls
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];

      // Add a rule to handle rubic-sdk specifically
      config.module.rules.push({
        test: /[\\/]node_modules[\\/]rubic-sdk[\\/]/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      });

      // Inject _interopRequireDefault helper into webpack runtime
      // Use processAssets hook (webpack 5) to inject helper before optimization
      config.plugins.push({
        apply: (compiler: any) => {
          compiler.hooks.compilation.tap(
            "InteropHelperPlugin",
            (compilation: any) => {
              if (compilation.hooks && compilation.hooks.processAssets) {
                compilation.hooks.processAssets.tap(
                  {
                    name: "InteropHelperPlugin",
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
                  },
                  (assets: any) => {
                    Object.keys(assets).forEach((filename) => {
                      if (filename.endsWith(".js")) {
                        const asset = assets[filename];
                        const source = asset.source();
                        if (
                          typeof source === "string" &&
                          source.includes("_interopRequireDefault") &&
                          !source.match(
                            /(var|let|const|function)\s+_interopRequireDefault/
                          )
                        ) {
                          // Inject at the very top - must be at module scope
                          asset.source = () =>
                            "var _interopRequireDefault=function(o){return o&&o.__esModule?o:{default:o}};\n" +
                            source;
                        }
                      }
                    });
                  }
                );
              }
            }
          );
        },
      });

      // Ensure Aptos SDK uses browser version, not Node.js version
      // The alias must be set BEFORE any resolution happens
      const browserClientPath = path.resolve(
        __dirname,
        "node_modules/@aptos-labs/aptos-client/dist/browser/index.browser.mjs"
      );

      config.resolve.alias = {
        ...config.resolve.alias,
        "@telegram-apps/bridge": path.join(
          __dirname,
          "src/lib/stubs/telegram-bridge.ts"
        ),
        // Force use of browser client for Aptos - multiple aliases to catch all cases
        "@aptos-labs/aptos-client": browserClientPath,
        // Also alias common variations
        "@aptos-labs/aptos-client/dist/node/index.node.mjs": browserClientPath,
        "@aptos-labs/aptos-client/dist/node/index.node.js":
          browserClientPath.replace(/\.mjs$/, ".js"),
      };

      // Ignore node-specific modules from Aptos SDK and force browser version
      // This catches direct imports that bypass the alias
      config.plugins = config.plugins || [];

      const browserClientMjs = path.resolve(
        __dirname,
        "node_modules/@aptos-labs/aptos-client/dist/browser/index.browser.mjs"
      );
      const browserClientJs = path.resolve(
        __dirname,
        "node_modules/@aptos-labs/aptos-client/dist/browser/index.browser.js"
      );

      // Replace any node client imports with browser client
      // NormalModuleReplacementPlugin works at module resolution time
      config.plugins.push(
        // Most important: catch the exact path that's causing the error
        new webpack.NormalModuleReplacementPlugin(
          /node_modules\/@aptos-labs\/aptos-client\/dist\/node\/index\.node\.mjs$/,
          browserClientMjs
        ),
        // Catch any variation of the node path
        new webpack.NormalModuleReplacementPlugin(
          /@aptos-labs\/aptos-client\/dist\/node\/index\.node\.mjs$/,
          browserClientMjs
        ),
        new webpack.NormalModuleReplacementPlugin(
          /@aptos-labs\/aptos-client\/dist\/node\/index\.node\.js$/,
          browserClientJs
        ),
        // Catch any path with dist/node and transform it
        new webpack.NormalModuleReplacementPlugin(
          /@aptos-labs\/aptos-client\/dist\/node/,
          (resource: any) => {
            if (resource.request) {
              resource.request = resource.request
                .replace(
                  /dist\/node\/index\.node\.mjs/,
                  "dist/browser/index.browser.mjs"
                )
                .replace(
                  /dist\/node\/index\.node\.js/,
                  "dist/browser/index.browser.js"
                )
                .replace(/dist\/node/, "dist/browser")
                .replace(/index\.node/, "index.browser");
            }
          }
        ),
        // Catch bare package import
        new webpack.NormalModuleReplacementPlugin(
          /^@aptos-labs\/aptos-client$/,
          browserClientMjs
        )
      );

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
            test: /[\\/]node_modules[\\/](ethers|@solana\/web3\.js|near-api-js|@aptos-labs)[\\/]/,
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
