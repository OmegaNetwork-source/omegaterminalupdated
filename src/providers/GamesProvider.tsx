"use client";

/**
 * Games Provider Component
 *
 * React Context provider for games system state management
 * Features:
 * - Game modal open/close state
 * - Local leaderboard management (localStorage)
 * - On-chain leaderboard integration (blockchain)
 * - Score submission to smart contract
 * - Integration with WalletProvider for blockchain operations
 */

import dynamic from "next/dynamic";
import React, {
  ComponentType,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { BrowserProvider, JsonRpcProvider, Contract } from "ethers";
import {
  GamesState,
  GameScore,
  LeaderboardEntry,
  GameType,
} from "@/types/games";
import {
  loadLeaderboards,
  addScore as addLocalScore,
  getLeaderboard as getLocalLeaderboardData,
} from "@/lib/games/leaderboard";
import {
  initializeSDK,
  submitScore as submitOnChainScore,
  getLeaderboard as getOnChainLeaderboardData,
} from "@/lib/games/arcade-sdk";
import { useWallet } from "@/hooks/useWallet";
import config from "@/lib/config";
import { GAMES_METADATA } from "@/lib/games/metadata";

/**
 * Games context interface
 * Provides all games-related state and methods
 */
type GameComponentProps = {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
};

interface GamesContextValue {
  /** Current games state */
  gamesState: GamesState;
  /** Open a game modal */
  openGame: (gameId: string) => void;
  /** Close the current game modal */
  closeGame: () => void;
  /** Currently active game React component */
  activeGameComponent: ComponentType<GameComponentProps> | null;
  /** Whether a game bundle is currently loading */
  isGameLoading: boolean;
  /** Submit a score to local leaderboard */
  submitLocalScore: (gameId: string, score: GameScore) => void;
  /** Get local leaderboard for a game */
  getLocalLeaderboard: (gameId: string, limit?: number) => GameScore[];
  /** Submit a score to on-chain leaderboard */
  submitOnChainScore: (
    gameType: GameType,
    score: number,
    username: string,
    gameData?: Record<string, any>
  ) => Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }>;
  /** Fetch on-chain leaderboard for a game */
  fetchOnChainLeaderboard: (
    gameType: GameType,
    limit?: number
  ) => Promise<LeaderboardEntry[]>;
}

/**
 * Games context
 */
export const GamesContext = createContext<GamesContextValue | undefined>(
  undefined
);

/**
 * Games Provider Props
 */
interface GamesProviderProps {
  children: ReactNode;
}

const GameLoadingFallback = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      color: "#00ffd5",
      fontFamily: "IBM Plex Mono, monospace",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
    }}
  >
    Loading arcade system...
  </div>
);

type GameEntry = {
  Component: ComponentType<GameComponentProps>;
  preload: () => Promise<void>;
};

const createGameEntry = (
  loader: () => Promise<{ default: ComponentType<GameComponentProps> }>
): GameEntry => {
  const Component = dynamic<GameComponentProps>(loader, {
    ssr: false,
    loading: GameLoadingFallback,
  });

  return {
    Component,
    preload: async () => {
      await loader();
    },
  };
};

const createPlaceholderEntry = (
  title: string,
  message = "This game is coming soon to Omega Arcade."
): GameEntry => {
  const Placeholder: ComponentType<GameComponentProps> = ({
    onScoreUpdate,
    onGameEnd: _onGameEnd,
  }) => {
    useEffect(() => {
      onScoreUpdate(0);
    }, [onScoreUpdate]);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          gap: "16px",
          textAlign: "center",
          color: "#00ffd5",
          fontFamily: "IBM Plex Mono, monospace",
        }}
      >
        <div style={{ fontSize: "48px" }}>🕹️</div>
        <h3 style={{ fontSize: "24px", margin: 0 }}>{title}</h3>
        <p style={{ margin: 0, maxWidth: "420px", lineHeight: 1.5 }}>
          {message}
        </p>
        <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>
          Use the close button above to return to the arcade lobby.
        </span>
      </div>
    );
  };

  return {
    Component: Placeholder,
    preload: async () => Promise.resolve(),
  };
};

const UNKNOWN_GAME_ENTRY = createPlaceholderEntry(
  "Game Not Found",
  "We couldn't locate this game. Check the command or try a different title."
);

const baseGameEntries = GAMES_METADATA.reduce<Record<string, GameEntry>>(
  (acc, game) => {
    if (game.id === "snake") {
      acc[game.id] = createGameEntry(async () => ({
        default: (await import("@/components/Games/SnakeGame")).SnakeGame,
      }));
    } else {
      acc[game.id] = createPlaceholderEntry(
        game.name,
        `${game.description} Coming soon to Omega Arcade.`
      );
    }
    return acc;
  },
  {}
);

const EXTRA_GAME_ENTRIES: Record<string, GameEntry> = {
  matrix: createPlaceholderEntry(
    "Matrix Simulation",
    "The Matrix rain animation runs directly in the terminal. Use the 'matrix' command for the console effect."
  ),
};

const GAME_COMPONENTS: Record<string, GameEntry> = {
  ...baseGameEntries,
  ...EXTRA_GAME_ENTRIES,
};

/**
 * Games Provider Component
 * Wraps children with games context
 *
 * @example
 * ```tsx
 * <GamesProvider>
 *   <App />
 * </GamesProvider>
 * ```
 */
export function GamesProvider({ children }: GamesProviderProps) {
  // Load local leaderboards from localStorage on mount
  const [gamesState, setGamesState] = useState<GamesState>({
    currentGame: null,
    isGameOpen: false,
    localLeaderboards: {},
    onChainLeaderboards: {},
  });
  const [activeGameComponent, setActiveGameComponent] =
    useState<ComponentType<GameComponentProps> | null>(null);
  const [isGameLoading, setIsGameLoading] = useState<boolean>(false);

  // Get wallet provider from WalletProvider
  const { provider, address } = useWallet();

  // Load local leaderboards on mount
  useEffect(() => {
    const localLeaderboards = loadLeaderboards();
    setGamesState((prev) => ({
      ...prev,
      localLeaderboards,
    }));
  }, []);

  /**
   * Open a game modal
   */
  const openGame = useCallback((gameId: string) => {
    const normalizedId = gameId.trim().toLowerCase();

    setGamesState((prev) => ({
      ...prev,
      currentGame: normalizedId,
      isGameOpen: true,
    }));
    setIsGameLoading(true);

    const entry = GAME_COMPONENTS[normalizedId];

    if (!entry) {
      console.warn(
        `[Games] No component registered for game '${normalizedId}'.`
      );
      setActiveGameComponent(() => UNKNOWN_GAME_ENTRY.Component);
      setIsGameLoading(false);
      return;
    }

    setActiveGameComponent(() => entry.Component);

    void entry
      .preload()
      .catch((error) => {
        console.error("[Games] Failed to load game component", error);
        setActiveGameComponent(() => UNKNOWN_GAME_ENTRY.Component);
      })
      .finally(() => {
        setIsGameLoading(false);
      });

    console.log("[Games] Opening game:", normalizedId);
  }, []);

  /**
   * Close the current game modal
   */
  const closeGame = useCallback(() => {
    setGamesState((prev) => ({
      ...prev,
      currentGame: null,
      isGameOpen: false,
    }));
    setActiveGameComponent(null);
    setIsGameLoading(false);
    console.log("[Games] Closing game");
  }, []);

  /**
   * Submit a score to local leaderboard
   */
  const submitLocalScore = useCallback((gameId: string, score: GameScore) => {
    // Add to localStorage
    addLocalScore(gameId, score);

    // Reload leaderboards
    const updatedLeaderboards = loadLeaderboards();
    setGamesState((prev) => ({
      ...prev,
      localLeaderboards: updatedLeaderboards,
    }));

    console.log("[Games] Local score submitted:", {
      gameId,
      score: score.score,
      username: score.username,
    });
  }, []);

  /**
   * Get local leaderboard for a game
   */
  const getLocalLeaderboard = useCallback((gameId: string, limit?: number) => {
    return getLocalLeaderboardData(gameId, limit);
  }, []);

  /**
   * Submit a score to on-chain leaderboard
   * Requires wallet connection
   */
  const submitOnChainScoreHandler = useCallback(
    async (
      gameType: GameType,
      score: number,
      username: string,
      gameData: Record<string, any> = {}
    ): Promise<{
      success: boolean;
      transactionHash?: string;
      error?: string;
    }> => {
      try {
        // Check if wallet is connected
        if (!provider || !address) {
          return {
            success: false,
            error: "Wallet not connected. Please connect your wallet first.",
          };
        }

        console.log("[Games] Submitting on-chain score:", {
          gameType,
          score,
          username,
          address,
        });

        // Initialize SDK with wallet provider
        const browserProvider = new BrowserProvider(provider);
        const sdk = await initializeSDK(browserProvider);

        if (!sdk) {
          return {
            success: false,
            error: "Failed to initialize Arcade SDK",
          };
        }

        const { contract } = sdk;

        // Submit score to contract
        const result = await submitOnChainScore(
          contract,
          gameType,
          score,
          username,
          gameData
        );

        if (result.success) {
          console.log("[Games] On-chain score submitted successfully:", {
            txHash: result.transactionHash,
            blockNumber: result.blockNumber,
          });

          // Refresh on-chain leaderboard
          await fetchOnChainLeaderboardHandler(gameType);
        }

        return result;
      } catch (error: any) {
        console.error("[Games] On-chain score submission failed:", error);
        return {
          success: false,
          error: error.message || "Failed to submit score",
        };
      }
    },
    [provider, address]
  );

  /**
   * Fetch on-chain leaderboard for a game
   * Allows reading without wallet by using read-only provider
   */
  const fetchOnChainLeaderboardHandler = useCallback(
    async (
      gameType: GameType,
      limit: number = 10
    ): Promise<LeaderboardEntry[]> => {
      try {
        console.log("[Games] Fetching on-chain leaderboard:", {
          gameType,
          limit,
        });

        let contract: Contract;

        if (provider) {
          // If wallet is connected, use wallet provider
          const browserProvider = new BrowserProvider(provider);
          const sdk = await initializeSDK(browserProvider);

          if (!sdk) {
            console.error("[Games] Failed to initialize Arcade SDK");
            return [];
          }

          contract = sdk.contract;
        } else {
          // If no wallet, use read-only provider
          console.log(
            "[Games] No wallet connected, using read-only provider for leaderboard reads"
          );
          const readOnlyProvider = new JsonRpcProvider(
            config.OMEGA_NETWORK.rpcUrls[0]
          );
          contract = new Contract(
            config.ARCADE_CONTRACT_ADDRESS,
            config.ARCADE_CONTRACT_ABI,
            readOnlyProvider
          );
        }

        // Fetch leaderboard from contract
        const result = await getOnChainLeaderboardData(
          contract,
          gameType,
          limit
        );

        if (result.success && result.leaderboard) {
          // Update state
          setGamesState((prev) => ({
            ...prev,
            onChainLeaderboards: {
              ...prev.onChainLeaderboards,
              [gameType]: result.leaderboard!,
            },
          }));

          console.log("[Games] On-chain leaderboard fetched:", {
            gameType,
            entries: result.leaderboard.length,
          });

          return result.leaderboard;
        }

        return [];
      } catch (error: any) {
        console.error("[Games] Failed to fetch on-chain leaderboard:", error);
        return [];
      }
    },
    [provider]
  );

  // Create context value
  const contextValue: GamesContextValue = {
    gamesState,
    openGame,
    closeGame,
    activeGameComponent,
    isGameLoading,
    submitLocalScore,
    getLocalLeaderboard,
    submitOnChainScore: submitOnChainScoreHandler,
    fetchOnChainLeaderboard: fetchOnChainLeaderboardHandler,
  };

  return (
    <GamesContext.Provider value={contextValue}>
      {children}
    </GamesContext.Provider>
  );
}
