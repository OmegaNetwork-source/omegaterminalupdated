import type { Config } from "jest";
import nextJest from "next/jest";

// Create a Next.js aware Jest configuration helper. This ensures that Next.js
// specific features such as absolute imports, environment variables, and SWC
// transpilation are properly respected inside the Jest runtime.
const createJestConfig = nextJest({
  dir: "./",
});

// Custom Jest configuration tailored for the Omega Terminal application.
// This enables TypeScript support via ts-jest, configures the DOM environment,
// and enforces coverage requirements across the codebase.
const customJestConfig: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.{ts,tsx}", "**/*.{test,spec}.{ts,tsx}"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/types/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transformIgnorePatterns: [
    "/node_modules/(?!(@solana|near-api-js|msw|@mswjs|until-async)/)",
  ],
};

export default createJestConfig(customJestConfig);
