import React, { type ReactElement } from "react";
import {
  render,
  type RenderOptions,
  type RenderResult,
  screen,
  waitFor,
} from "@testing-library/react";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { CustomizerProvider } from "@/providers/CustomizerProvider";
import { ViewModeProvider } from "@/providers/ViewModeProvider";
import { GUIThemeProvider } from "@/providers/GUIThemeProvider";
import { SoundEffectsProvider } from "@/providers/SoundEffectsProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import { MultiChainProvider } from "@/providers/MultiChainProvider";
import { SpotifyProvider } from "@/providers/SpotifyProvider";
import { YouTubeProvider } from "@/providers/YouTubeProvider";
import { NewsReaderProvider } from "@/providers/NewsReaderProvider";
import { GamesProvider } from "@/providers/GamesProvider";

import { useWallet } from "@/hooks/useWallet";

import type { CommandContext } from "@/types/commands";
import type { TerminalLine } from "@/types/terminal";
import type { WalletState } from "@/types/wallet";

type RenderWithProvidersOptions = RenderOptions & {
  walletStateOverride?: Partial<WalletState>;
};

const Providers: React.FC<{
  children: React.ReactNode;
  walletStateOverride?: Partial<WalletState>;
}> = ({ children, walletStateOverride }) => (
  <ThemeProvider>
    <SoundEffectsProvider>
      <CustomizerProvider>
        <ViewModeProvider>
          <GUIThemeProvider>
            <NewsReaderProvider>
              <GamesProvider>
                <SpotifyProvider>
                  <YouTubeProvider>
                    <MultiChainProvider>
                      <WalletProvider>
                        <WalletStateInitializer override={walletStateOverride}>
                          {children}
                        </WalletStateInitializer>
                      </WalletProvider>
                    </MultiChainProvider>
                  </YouTubeProvider>
                </SpotifyProvider>
              </GamesProvider>
            </NewsReaderProvider>
          </GUIThemeProvider>
        </ViewModeProvider>
      </CustomizerProvider>
    </SoundEffectsProvider>
  </ThemeProvider>
);

const WalletStateInitializer: React.FC<{
  children: React.ReactNode;
  override?: Partial<WalletState>;
}> = ({ children, override }) => {
  const wallet = useWallet();

  React.useEffect(() => {
    if (override) {
      Object.assign(wallet.state, override);
    }
  }, [wallet, override]);

  return <>{children}</>;
};

/**
 * Render a React element with every application provider context to mirror the
 * production environment. This is the preferred helper for component and
 * integration tests that rely on Omega Terminal contexts.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { walletStateOverride, ...options }: RenderWithProvidersOptions = {}
): RenderResult =>
  render(ui, {
    wrapper: ({ children }) => (
      <Providers walletStateOverride={walletStateOverride}>
        {children}
      </Providers>
    ),
    ...options,
  });

/**
 * Create a mock command context for testing command handlers and the
 * `useCommandExecution` hook. Consumers can override any property to suit a
 * specific test scenario.
 */
export const createMockCommandContext = (
  overrides: Partial<CommandContext> = {}
): CommandContext => ({
  log: jest.fn(),
  clearTerminal: jest.fn(),
  executeCommand: jest.fn(),
  getCommandHistory: jest.fn().mockReturnValue([]),
  theme: {
    currentTheme: "omega",
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
    themes: [],
  },
  wallet: {
    isConnected: false,
    address: null,
    balance: null,
    connectMetaMask: jest.fn(),
    createSessionWallet: jest.fn(),
    importSessionWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    getBalance: jest.fn(),
  },
  config: {
    chains: [],
    version: "test",
  },
  aiProvider: "gemini",
  setAiProvider: jest.fn(),
  ...overrides,
});

/**
 * Generate a reusable wallet state object that mirrors the WalletProvider
 * structure. Useful when testing provider interactions.
 */
export const createMockWalletState = (
  overrides: Partial<WalletState> = {}
): WalletState => ({
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  status: "disconnected",
  connectMetaMask: jest.fn(),
  createSessionWallet: jest.fn(),
  importSessionWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  getBalance: jest.fn(),
  addOmegaNetwork: jest.fn(),
  switchNetwork: jest.fn(),
  signer: null,
  provider: null,
  error: null,
  ...overrides,
});

/**
 * Create a terminal line mock for rendering expectations.
 */
export const createMockTerminalLine = (
  type: TerminalLine["type"],
  content: string
): TerminalLine => ({
  id: `line-${Math.random().toString(36).slice(2)}`,
  type,
  content,
  timestamp: Date.now(),
});

/**
 * Utility helper to wait for a command to finish executing by checking for the
 * expected output text within the terminal output.
 */
export const waitForCommandExecution = async (
  queryScreen: typeof screen = screen,
  expectedOutput: string,
  timeout = 5_000
) => {
  await waitFor(
    () => {
      expect(queryScreen.getByText(expectedOutput)).toBeInTheDocument();
    },
    { timeout }
  );
};

/**
 * Mock a MetaMask-like window.ethereum provider for tests that need wallet
 * interactions without touching the real browser environment.
 */
export const mockMetaMask = () => {
  const ethereum = {
    isMetaMask: true,
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  } as const;

  Object.defineProperty(window, "ethereum", {
    configurable: true,
    value: ethereum,
  });

  return ethereum;
};

/**
 * Replace the browser localStorage implementation with an in-memory map for
 * deterministic testing.
 */
export const mockLocalStorage = () => {
  const store = new Map<string, string>();

  const storage: Storage = {
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key) ?? null : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    get length() {
      return store.size;
    },
  };

  Object.defineProperty(window, "localStorage", {
    value: storage,
    configurable: true,
  });

  Object.defineProperty(window, "sessionStorage", {
    value: storage,
    configurable: true,
  });

  return storage;
};
