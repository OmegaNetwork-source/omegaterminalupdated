/**
 * Command System Type Definitions
 * Type definitions for the terminal command execution system
 */

import type {
  Theme,
  AIProvider,
  TerminalLine,
  WalletState,
  OmegaConfig,
} from "@/types";
import type { ViewMode, GUITheme, ColorPalette } from "@/types/ui";
import type {
  SolanaWalletState,
  NEARWalletState,
  EclipseWalletState,
} from "@/types/multichain";
import type {
  SpotifyPlayerState,
  SpotifyAuthState,
  YouTubePlayerState,
  NewsReaderState,
  NewsFilter,
} from "@/types/media";
import type {
  GamesState,
  GameScore,
  LeaderboardEntry,
  GameType,
} from "@/types/games";
import type {
  SoundEffectsState,
  SoundName,
  SoundPlayOptions,
} from "@/types/sound";
import type {
  WalletConnectResult,
  InitializeExternalWalletParams,
} from "@/types/wallet";

/**
 * Command context provided to all command handlers
 * Contains methods and state needed for command execution
 */
export interface CommandContext {
  /**
   * Log a message to the terminal output
   * @param message - The message to log
   * @param type - The type of message (determines styling)
   */
  log: (message: string, type: TerminalLine["type"]) => void;

  /**
   * Log HTML content to terminal output
   * @param htmlContent - The HTML content to log (should be sanitized)
   * @description Useful for interactive elements like copy buttons, formatted wallet info, etc.
   * Note: HTML content should be sanitized to prevent XSS attacks.
   * HTML lines are always rendered with type 'html' regardless of context.
   */
  logHtml: (htmlContent: string) => void;

  /**
   * Clear all terminal output
   */
  clearTerminal: () => void;

  /**
   * Execute another command (for command chaining or AI execution)
   * @param command - The command string to execute
   */
  executeCommand: (command: string) => Promise<void>;

  /**
   * Theme management context
   */
  theme: {
    /** Current active theme */
    currentTheme: Theme;
    /** Set a specific theme */
    setTheme: (theme: Theme) => void;
    /** Toggle to next theme in list */
    toggleTheme: () => void;
  };

  /**
   * View mode management context
   */
  viewMode?: {
    /** Current view mode */
    viewMode: ViewMode;
    /** Set view mode */
    setViewMode: (mode: ViewMode) => void;
    /** Toggle view mode */
    toggleViewMode: () => void;
    /** Whether in basic mode */
    isBasicMode: boolean;
    /** Whether in futuristic mode */
    isFuturisticMode: boolean;
  };

  /**
   * Wallet management context
   */
  wallet: {
    /** Current wallet state */
    state: WalletState;
    /** EVM wallet address (for AI context) */
    address?: string | null;
    /** Solana wallet state (for AI context) */
    solana?: {
      /** Solana wallet address */
      address?: string | null;
    };
    /** Connect to MetaMask wallet */
    connect: () => Promise<WalletConnectResult>;
    initializeExternalConnection: (
      params: InitializeExternalWalletParams
    ) => Promise<void>;
    /** Disconnect current wallet */
    disconnect: () => Promise<void>;
    /**
     * Create a new session wallet
     * @returns Object with address and privateKey, or null on error
     */
    createSessionWallet: () => Promise<{
      address: string;
      privateKey: string;
    } | null>;
    /**
     * Import a session wallet from private key
     * @param privateKey - The private key to import
     * @returns true if successful, false otherwise
     */
    importSessionWallet: (privateKey: string) => Promise<boolean>;
    /**
     * Get current wallet balance
     * @returns Balance as string (e.g. "1.234 OMEGA") or null if not connected
     */
    getBalance: () => Promise<string | null>;
    /**
     * Get wallet signer for transactions
     * @returns Ethers signer object or null if not available
     */
    getSigner: () => Promise<any | null>;
    /**
     * Get wallet provider
     * @returns Ethers provider object or null if not available
     */
    getProvider: () => any | null;
    /**
     * Add Omega Network to MetaMask
     * @returns true if successful, false otherwise
     */
    addOmegaNetwork: () => Promise<boolean>;
  };

  /**
   * Application configuration
   */
  config: OmegaConfig;

  /**
   * Current AI provider setting
   */
  aiProvider: AIProvider;

  /**
   * Update AI provider setting
   * @param provider - The AI provider to use
   */
  setAiProvider: (provider: AIProvider) => void;

  /**
   * Chat history for AI context (matches vanilla terminal.html line 2704)
   * Array of chat messages with type "user", "ai", or "command"
   */
  chatHistory?: Array<{
    type: "user" | "ai" | "command";
    message?: string;
    command?: string | string[];
  }>;

  /**
   * Flag to prevent recursive AI calls during command execution
   * Set to true when AI is executing commands to prevent infinite loops
   */
  executingAICommands?: boolean;

  /**
   * Mining state management
   * Enables commands to manage long-running mining operations
   */
  miningState?: {
    /** Whether mining is currently active */
    isMining: boolean;
    /** Number of blocks mined in current session */
    mineCount: number;
    /** Total OMEGA earned in current session */
    totalEarned: number;
    /** Start mining operation */
    startMining: () => void;
    /** Stop mining operation */
    stopMining: () => void;
  };

  /**
   * Stress test state management
   * Enables commands to manage network stress testing operations
   */
  stressTestState?: {
    /** Whether stress test is currently running */
    isStressTesting: boolean;
    /** Stress test statistics */
    stats: {
      /** Number of wallets created for testing */
      walletsCreated: number;
      /** Total number of transactions sent */
      transactionsSent: number;
      /** Number of successful transactions */
      successfulTxs: number;
      /** Number of failed transactions */
      failedTxs: number;
      /** Test start timestamp */
      startTime: number;
    };
    /** Start stress test */
    startStressTest: () => void;
    /** Stop stress test */
    stopStressTest: () => void;
  };

  /**
   * Create contract instance for smart contract interactions
   * @param address - Contract address
   * @param abi - Contract ABI
   * @param signerOrProvider - Optional ethers signer or provider
   * @returns Contract instance
   */
  getContract?: (address: string, abi: any[], signerOrProvider?: any) => any;

  /**
   * Multi-chain wallet management context
   * Enables commands to manage Solana, NEAR, and Eclipse wallet operations
   */
  multichain?: {
    /** Solana blockchain operations */
    solana: {
      /** Current Solana wallet state */
      state: SolanaWalletState;
      /** Connect to Phantom wallet */
      connectPhantom: () => Promise<boolean>;
      /** Generate a new browser wallet */
      generateWallet: () => Promise<{
        publicKey: string;
        secretKey: string;
      } | null>;
      /** Get balance for a public key */
      getBalance: (publicKey: string) => Promise<number | null>;
      /** Send a transaction */
      sendTransaction: (transaction: any) => Promise<string | null>;
    };
    /** NEAR Protocol operations */
    near: {
      /** Current NEAR wallet state */
      state: NEARWalletState;
      /** Connect to NEAR wallet */
      connect: () => Promise<boolean>;
      /** Disconnect NEAR wallet */
      disconnect: () => Promise<void>;
      /** Get balance for an account ID */
      getBalance: (accountId: string) => Promise<string | null>;
      /** Sign and send a transaction */
      signAndSendTransaction: (transaction: any) => Promise<any>;
    };
    /** Eclipse network operations */
    eclipse: {
      /** Current Eclipse wallet state */
      state: EclipseWalletState;
      /** Connect to Phantom wallet for Eclipse */
      connectPhantom: () => Promise<boolean>;
      /** Generate a new browser wallet */
      generateWallet: () => Promise<{
        publicKey: string;
        secretKey: string;
      } | null>;
      /** Get balance for a public key */
      getBalance: (publicKey: string) => Promise<number | null>;
      /** Send a transaction */
      sendTransaction: (transaction: any) => Promise<string | null>;
    };
  };

  /**
   * Media player management context
   * Enables commands to control Spotify, YouTube, and News reader panels
   */
  media?: {
    /** Spotify music player operations */
    spotify: {
      /** Current player state */
      state: SpotifyPlayerState;
      /** Authentication state */
      authState: SpotifyAuthState;
      /** Initiate OAuth authentication */
      authenticate: () => Promise<void>;
      /** Disconnect and clear session */
      logout: () => void;
      /** Search Spotify catalog for tracks */
      searchTracks: (query: string) => Promise<void>;
      /** Play a specific track by URI */
      playTrack: (uri: string) => Promise<void>;
      /** Toggle play/pause */
      togglePlayPause: () => Promise<void>;
      /** Skip to next track */
      skipNext: () => Promise<void>;
      /** Skip to previous track */
      skipPrevious: () => Promise<void>;
      /** Set volume (0-100) */
      setVolume: (volume: number) => Promise<void>;
      /** Show Spotify panel */
      openPanel: () => void;
      /** Hide Spotify panel */
      closePanel: () => void;
    };
    /** YouTube video player operations */
    youtube: {
      /** Current player state */
      state: YouTubePlayerState;
      /** Search YouTube for videos */
      searchVideos: (query: string) => Promise<void>;
      /** Play a specific video by ID */
      playVideo: (videoId: string, index: number) => void;
      /** Toggle play/pause */
      togglePlayPause: () => void;
      /** Play next video in playlist */
      next: () => void;
      /** Play previous video in playlist */
      previous: () => void;
      /** Toggle mute */
      toggleMute: () => void;
      /** Show YouTube panel */
      openPanel: () => void;
      /** Hide YouTube panel */
      closePanel: () => void;
    };
    /** Crypto news reader operations */
    news: {
      /** Current news reader state */
      state: NewsReaderState;
      /** Load news with specific filter */
      loadNews: (filter: NewsFilter, limit?: number) => Promise<void>;
      /** Refresh current news */
      refreshNews: (silent?: boolean) => Promise<void>;
      /** Change news category filter */
      setFilter: (filter: NewsFilter) => void;
      /** Show news reader panel */
      openPanel: () => Promise<void>;
      /** Hide news reader panel */
      closePanel: () => void;
    };
  };

  /**
   * Games system operations
   * Enables commands to launch games, manage leaderboards, and submit scores to blockchain
   */
  games?: {
    /** Current games state */
    state: GamesState;
    /** Open a game modal */
    openGame: (gameId: string) => void;
    /** Close the current game modal */
    closeGame: () => void;
    /** Submit a score to local leaderboard (localStorage) */
    submitLocalScore: (gameId: string, score: GameScore) => void;
    /** Get local leaderboard for a game */
    getLocalLeaderboard: (gameId: string, limit?: number) => GameScore[];
    /** Submit a score to on-chain leaderboard (blockchain) */
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
    /** Fetch on-chain leaderboard for a game from blockchain */
    fetchOnChainLeaderboard: (
      gameType: GameType,
      limit?: number
    ) => Promise<LeaderboardEntry[]>;
  };

  /**
   * UI system context for view mode, GUI themes, and color palettes.
   * Enables commands to control layout transformations and appearance.
   */
  ui?: {
    /** Current view mode */
    viewMode: ViewMode;
    /** Set a specific view mode */
    setViewMode: (mode: ViewMode) => void;
    /** Toggle between basic and futuristic */
    toggleViewMode: () => void;
    /** Convenience flags */
    isBasicMode: boolean;
    isFuturisticMode: boolean;

    /** Current GUI theme */
    guiTheme: GUITheme;
    /** Set GUI theme */
    setGUITheme: (theme: GUITheme) => void;
    /** Whether default terminal mode is active */
    isTerminalMode: boolean;

    /** Current color palette */
    colorPalette: ColorPalette | null;
    /** Set color palette */
    setColorPalette: (palette: ColorPalette) => void;
    /** Cycle through palettes */
    cycleColorPalette: () => void;
    /** Reset palette to default (null removes attribute) */
    resetColorPalette: () => void;
  };

  /**
   * Sound effects context for audio feedback on user actions.
   * Commands can trigger sounds such as wallet connection, balance check,
   * chart viewer activation, clearing terminal, help command, etc.
   * Playback is best-effort and may fail silently due to browser autoplay policies.
   */
  sound?: {
    state: SoundEffectsState;
    playSound: (name: SoundName, options?: SoundPlayOptions) => Promise<void>;
    stopSound: (name: string) => void;
    stopAllSounds: () => void;
    setVolume: (volume: number) => void;
    setEnabled: (enabled: boolean) => void;
    playWalletConnectSound: (options?: SoundPlayOptions) => Promise<void>;
    playAIToggleSound: (options?: SoundPlayOptions) => Promise<void>;
    playBalanceWealthSound: (options?: SoundPlayOptions) => Promise<void>;
    playChartViewerSound: (options?: SoundPlayOptions) => Promise<void>;
    playBasicViewSound: (options?: SoundPlayOptions) => Promise<void>;
    playClearTerminalSound: (options?: SoundPlayOptions) => Promise<void>;
    playModernUIThemeSound: (options?: SoundPlayOptions) => Promise<void>;
    playHelpCommandSound: (options?: SoundPlayOptions) => Promise<void>;
  };
}

/**
 * Command handler function type
 * Receives context and arguments, executes command logic
 */
export type CommandHandler = (
  context: CommandContext,
  args: string[]
) => Promise<void> | void;

/**
 * Command metadata for registration and help display
 */
export interface CommandMetadata {
  /** Command name (primary identifier) */
  name: string;
  /** Alternative names for the command (optional) */
  aliases?: string[];
  /** Human-readable description */
  description: string;
  /** Usage example (optional) */
  usage?: string;
  /** Command category for grouping (optional) */
  category?: string;
}

/**
 * Complete command definition
 * Combines metadata with execution handler
 */
export interface Command extends CommandMetadata {
  /** Command execution handler */
  handler: CommandHandler;
}

/**
 * Command registry interface
 * Manages command registration and execution routing
 */
export interface CommandRegistry {
  /**
   * Register a new command
   * @param command - The command to register
   */
  register: (command: Command) => void;

  /**
   * Unregister a command by name
   * @param name - The command name to remove
   */
  unregister: (name: string) => void;

  /**
   * Execute a command string with context
   * @param commandString - The full command string to execute
   * @param context - The command execution context
   */
  execute: (commandString: string, context: CommandContext) => Promise<void>;

  /**
   * Get a registered command by name
   * @param name - The command name to look up
   * @returns The command if found, undefined otherwise
   */
  getCommand: (name: string) => Command | undefined;

  /**
   * Get all registered commands
   * @returns Array of all commands (excluding aliases)
   */
  getAllCommands: () => Command[];

  /**
   * Get commands filtered by category
   * @param category - The category to filter by
   * @returns Array of commands in the category
   */
  getCommandsByCategory: (category: string) => Command[];

  /**
   * Get all command names including aliases
   * Used for autocomplete
   * @returns Array of all command names and aliases
   */
  getCommandNames: () => string[];

  /**
   * Get unique command names (canonical names only, no aliases)
   * Used for autocomplete to avoid showing duplicates
   * @returns Array of unique canonical command names
   */
  getUniqueCommandNames: () => string[];
}
