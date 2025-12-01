/**
 * useCommandExecution Hook
 * Custom React hook for command execution that integrates with command registry and React contexts
 *
 * This hook manages all command execution state and provides the bridge between
 * UI components and the command system. It integrates with ThemeProvider and
 * WalletProvider to provide full context to command handlers.
 *
 * @example
 * function TerminalContainer() {
 *   const { executeCommand, terminalLines, clearTerminal } = useCommandExecution();
 *
 *   return (
 *     <>
 *       <TerminalOutput lines={terminalLines} />
 *       <TerminalInput onSubmit={executeCommand} />
 *     </>
 *   );
 * }
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useWallet } from "@/hooks/useWallet";
import { useMultiChain } from "@/hooks/useMultiChain";
import { usePerps } from "@/hooks/usePerps";
import { useSpotify } from "@/hooks/useSpotify";
import { useYouTube } from "@/hooks/useYouTube";
import { useNewsReader } from "@/hooks/useNewsReader";
import { useGames } from "@/hooks/useGames";
import { createCommandLine } from "@/lib/commands/command-output-helpers";
import { APP_VERSION } from "@/lib/constants";
import { getQuickActions, groupQuickActionsByCategory, addQuickAction } from "@/lib/quick-actions";
import { extractCommandsFromSection, getSectionCategory } from "@/lib/section-commands-extractor";
import { usePGT } from "@/hooks/usePGT";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTelegram } from "@/providers/TelegramProvider";
import { commandRegistry } from "@/lib/commands";
import { openNetworkSelector } from "@/lib/wallet/networkSelector";
import { useViewMode } from "@/hooks/useViewMode";
import { useGUITheme } from "@/hooks/useGUITheme";
import { useCustomizer } from "@/hooks/useCustomizer";
import { useTerminalMode } from "@/hooks/useTerminalMode";
import { config } from "@/lib/config";
import { Contract } from "ethers";
import { parseCommandArgs } from "@/lib/utils";
import type { TerminalLine, CommandContext, AIProvider } from "@/types";

/**
 * Return type for useCommandExecution hook
 */
export interface UseCommandExecutionReturn {
  /** Execute a command string */
  executeCommand: (command: string) => Promise<void>;
  /** Array of terminal output lines */
  terminalLines: TerminalLine[];
  /** Clear all terminal output */
  clearTerminal: () => void;
  /** Command history for navigation */
  commandHistory: string[];
  /** Current history index (-1 = not navigating) */
  historyIndex: number;
  /** Navigate command history (up/down arrows) */
  navigateHistory: (direction: "up" | "down") => string | null;
  /** Get autocomplete matches for partial command */
  autocomplete: (partial: string) => string[];
  /** Current AI provider */
  aiProvider: AIProvider;
  /** Update AI provider */
  setAiProvider: (provider: AIProvider) => void;
  /** Mining state for UI components */
  miningState: {
    isMining: boolean;
    mineCount: number;
    totalEarned: number;
  };
  /** Stress test state for UI components */
  stressTestState: {
    isStressTesting: boolean;
    stats: {
      walletsCreated: number;
      transactionsSent: number;
      successfulTxs: number;
      failedTxs: number;
      startTime: number;
    };
  };
  /** Whether the command registry initialized successfully */
  commandsInitialized: boolean;
  /** Names of command groups that failed to register */
  commandSystemErrors: string[];
  /** Update command system status (used by TerminalContainer) */
  setCommandSystemStatus: (ready: boolean, errors?: string[]) => void;
  /** Determine if a command is registered and available */
  isCommandAvailable: (command: string) => boolean;
}

/**
 * Custom hook for command execution
 *
 * Manages terminal state, command execution, history navigation, and autocomplete.
 * Integrates with ThemeProvider and WalletProvider for full command context.
 *
 * @returns Command execution interface
 */
export function useCommandExecution(): UseCommandExecutionReturn {
  // Get context from providers
  const theme = useTheme();
  const wallet = useWallet();
  const multichain = useMultiChain();
  const perps = usePerps();
  const spotify = useSpotify();
  const youtube = useYouTube();
  const newsReader = useNewsReader();
  const games = useGames();
  const pgt = usePGT();
  const soundEffects = useSoundEffects();
  const telegram = useTelegram();
  const viewModeCtx = useViewMode();
  const guiThemeCtx = useGUITheme();
  const customizerCtx = useCustomizer();
  const terminalModeCtx = useTerminalMode();

  // Terminal output state (start with welcome messages)
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>(() => {
    // SVG Icons (inline for consistency)
    const lightningIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
    const rocketIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`;
    const lightbulbIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z"></path><line x1="12" y1="9" x2="12" y2="15"></line></svg>`;
    const globeIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-bottom: 4px;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    const chartIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-bottom: 4px;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
    const paletteIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-bottom: 4px;"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>`;

    // Additional icons for enhanced UI
    const tradingIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
    const defiIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12"></path><path d="M6 12h12"></path></svg>`;
    const nftIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M9 9h6v6H9z"></path></svg>`;
    const walletIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
    const mediaIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    const analyticsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M3 3v18h18"></path><path d="M18 7l-5 5-4-4-6 6"></path></svg>`;

    const welcomeHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        color: var(--palette-text, #e0e0e0);
        padding: 24px 0;
        line-height: 1.6;
        position: relative;
      ">
        <!-- Animated Background Pattern -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 2px,
              color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 2px,
              color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 4px
            );
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        "></div>

        <div style="position: relative; z-index: 1;">
          <!-- Header Section with Enhanced Design -->
          <div style="
            text-align: center;
            margin-bottom: 32px;
            padding: 24px 20px;
            background: linear-gradient(135deg, 
              color-mix(in srgb, var(--palette-primary, #00d4ff) 12%, transparent) 0%,
              color-mix(in srgb, var(--palette-secondary, #00ff88) 8%, transparent) 50%,
              color-mix(in srgb, var(--palette-primary, #00d4ff) 12%, transparent) 100%
            );
            border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
            border-radius: 16px;
            box-shadow: 0 8px 32px color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
          ">
            <!-- Welcome Header with Typing Animation (React Component) -->
            <div data-welcome-header-placeholder></div>
          </div>

          <!-- Custom Quick Actions Section with Drop Zone -->
          <div 
            id="omega-quick-actions-drop-zone"
            style="
              background: linear-gradient(135deg, 
                color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%,
                color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%
              );
              border: 2px dashed color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 24px;
              box-shadow: 0 4px 20px color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent);
              transition: all 0.3s ease;
            "
            onmouseenter="this.style.borderColor = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 50%, transparent)'; this.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent) 100%)';"
            onmouseleave="this.style.borderColor = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)'; this.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%)';"
          >
            <div style="
              font-size: 18px;
              font-weight: 700;
              color: var(--palette-primary, #00d4ff);
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            ">
              ${lightbulbIcon}
              Your Quick Actions
            </div>
            
            ${(() => {
              const actions = getQuickActions();
              const grouped = groupQuickActionsByCategory(actions);
              const categoryIcons: Record<string, string> = {
                "Wallet & Connection": walletIcon,
                "Trading & Markets": tradingIcon,
                "DeFi & Analytics": analyticsIcon,
                "Ethereum & Uniswap": tradingIcon,
                "Media & Entertainment": mediaIcon,
                "Other": lightbulbIcon,
              };
              const categoryColors: Record<string, string> = {
                "Wallet & Connection": "var(--palette-secondary, #00ff88)",
                "Trading & Markets": "var(--palette-warning, #ffa502)",
                "DeFi & Analytics": "var(--palette-secondary, #00ff88)",
                "Ethereum & Uniswap": "var(--palette-primary, #00d4ff)",
                "Media & Entertainment": "var(--palette-accent, #ff00ff)",
                "Other": "var(--palette-primary, #00d4ff)",
              };

              let html = "";
              const categories = Object.keys(grouped);
              
              categories.forEach((category, catIndex) => {
                const categoryActions = grouped[category];
                const icon = categoryIcons[category] || lightbulbIcon;
                const color = categoryColors[category] || "var(--palette-primary, #00d4ff)";
                
                html += `
                  <div style="margin-bottom: ${catIndex === categories.length - 1 ? '0' : '20px'};">
                    <div style="
                      font-size: 13px;
                      font-weight: 600;
                      color: ${color};
                      margin-bottom: 12px;
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                    ">
                      ${icon}
                      ${category}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
                      ${categoryActions.map((action) => {
                        const escapedCommand = action.command.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
                        return `
                          <div 
                            class="omega-execute-command"
                            data-command="${escapedCommand}"
                            style="
                              color: var(--palette-secondary, #00ff88);
                              font-weight: bold;
                              font-size: 1.05em;
                              font-family: 'Courier New', monospace;
                              text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);
                              cursor: pointer;
                              display: inline-block;
                              padding: 8px 12px;
                              border-radius: 6px;
                              background: color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent);
                              border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
                              transition: all 0.2s ease;
                              user-select: none;
                            "
                            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent)'; this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 12px color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)';"
                            onmouseout="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent)'; this.style.transform = 'translateY(0)'; this.style.boxShadow = 'none';"
                            title="Click to execute: ${escapedCommand}"
                          >
                            ${action.label || action.command}
                            ${action.description ? `<div style="font-size: 0.85em; color: color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent); margin-top: 4px; font-weight: normal;">${action.description}</div>` : ""}
                          </div>
                        `;
                      }).join("")}
                    </div>
                  </div>
                `;
              });

              if (categories.length === 0) {
                html += `
                  <div style="text-align: center; padding: 20px; color: color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent);">
                    No quick actions set yet. Use 'quick-actions add' to customize your favorite commands!
                  </div>
                `;
              }

              return html;
            })()}
            
            <div style="
              margin-top: 20px;
              padding-top: 16px;
              border-top: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
              text-align: center;
              font-size: 12px;
              color: color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent);
            ">
              💡 Drag sections from sidebar here to add commands | ${createCommandLine("quick-actions", "quick-actions")} to customize
            </div>
          </div>
        </div>
      </div>
    `;

    return [
      {
        id: "welcome-1",
        type: "html" as const,
        htmlContent: welcomeHtml,
        content: "", // Empty content for html type
        timestamp: 0,
      },
    ];
  });

  // Command history state
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // AI provider state (persisted in localStorage)
  const [aiProvider, setAiProviderState] = useState<AIProvider>("off");
  const [commandsInitialized, setCommandsInitialized] = useState<boolean>(true);
  const [commandSystemErrors, setCommandSystemErrors] = useState<string[]>([]);
  const commandFailureLoggedRef = useRef<boolean>(false);

  // AI state object - use object so mutations work (matches vanilla terminal.html)
  // This object is mutable and shared across all command executions
  const aiStateRef = useRef<{
    chatHistory: Array<{
      type: "user" | "ai" | "command";
      message?: string;
      command?: string | string[];
    }>;
    executingAICommands: boolean;
  }>({
    chatHistory: [],
    executingAICommands: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("omega-ai-mode");
      if (saved === "near" || saved === "openai" || saved === "off") {
        setAiProviderState(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setTerminalLines((prev) =>
      prev.map((line, idx) =>
        line.timestamp === 0 ? { ...line, timestamp: Date.now() + idx } : line
      )
    );
  }, []);

  // Update welcome message when quick actions change
  useEffect(() => {
    // Only update if the first line is the welcome message
    setTerminalLines((prev) => {
      if (prev.length === 0 || prev[0].id !== "welcome-1") {
        return prev;
      }

      // Regenerate welcome message with current quick actions
      const actions = getQuickActions();
      const grouped = groupQuickActionsByCategory(actions);
      
      // SVG Icons
      const lightningIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
      const rocketIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`;
      const lightbulbIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z"></path><line x1="12" y1="9" x2="12" y2="15"></line></svg>`;
      const walletIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
      const tradingIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
      const analyticsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M3 3v18h18"></path><path d="M18 7l-5 5-4-4-6 6"></path></svg>`;
      const mediaIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      const globeIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-bottom: 4px;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

      const categoryIcons: Record<string, string> = {
        "Wallet & Connection": walletIcon,
        "Trading & Markets": tradingIcon,
        "DeFi & Analytics": analyticsIcon,
        "Ethereum & Uniswap": tradingIcon,
        "Media & Entertainment": mediaIcon,
        "Other": lightbulbIcon,
      };
      const categoryColors: Record<string, string> = {
        "Wallet & Connection": "var(--palette-secondary, #00ff88)",
        "Trading & Markets": "var(--palette-warning, #ffa502)",
        "DeFi & Analytics": "var(--palette-secondary, #00ff88)",
        "Ethereum & Uniswap": "var(--palette-primary, #00d4ff)",
        "Media & Entertainment": "var(--palette-accent, #ff00ff)",
        "Other": "var(--palette-primary, #00d4ff)",
      };

      let quickActionsHtml = "";
      const categories = Object.keys(grouped);
      
      categories.forEach((category, catIndex) => {
        const categoryActions = grouped[category];
        const icon = categoryIcons[category] || lightbulbIcon;
        const color = categoryColors[category] || "var(--palette-primary, #00d4ff)";
        
        quickActionsHtml += `
          <div style="margin-bottom: ${catIndex === categories.length - 1 ? '0' : '20px'};">
            <div style="
              font-size: 13px;
              font-weight: 600;
              color: ${color};
              margin-bottom: 12px;
              display: flex;
              align-items: center;
              gap: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              ${icon}
              ${category}
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
              ${categoryActions.map((action) => {
                const escapedCommand = action.command.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
                return `
                  <div 
                    class="omega-execute-command"
                    data-command="${escapedCommand}"
                    style="
                      color: var(--palette-secondary, #00ff88);
                      font-weight: bold;
                      font-size: 1.05em;
                      font-family: 'Courier New', monospace;
                      text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);
                      cursor: pointer;
                      display: inline-block;
                      padding: 8px 12px;
                      border-radius: 6px;
                      background: color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent);
                      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
                      transition: all 0.2s ease;
                      user-select: none;
                    "
                    onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent)'; this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 12px color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)';"
                    onmouseout="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent)'; this.style.transform = 'translateY(0)'; this.style.boxShadow = 'none';"
                    title="Click to execute: ${escapedCommand}"
                  >
                    ${action.label || action.command}
                    ${action.description ? `<div style="font-size: 0.85em; color: color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent); margin-top: 4px; font-weight: normal;">${action.description}</div>` : ""}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        `;
      });

      if (categories.length === 0) {
        quickActionsHtml = `
          <div style="text-align: center; padding: 20px; color: color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent);">
            No quick actions set yet. Drag sections from the sidebar here or use 'quick-actions add' to customize!
          </div>
        `;
      }

      // Regenerate full welcome HTML
      const welcomeHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          color: var(--palette-text, #e0e0e0);
          padding: 24px 0;
          line-height: 1.6;
          position: relative;
        ">
          <!-- Animated Background Pattern -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 2px,
                color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 4px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 2px,
                color-mix(in srgb, var(--palette-primary, #00d4ff) 3%, transparent) 4px
              );
            opacity: 0.3;
            pointer-events: none;
            z-index: 0;
          "></div>

          <div style="position: relative; z-index: 1;">
            <!-- Header Section with Typing Animation (React Component) -->
            <div style="
              text-align: center;
              margin-bottom: 32px;
              padding: 24px 20px;
              background: linear-gradient(135deg, 
                color-mix(in srgb, var(--palette-primary, #00d4ff) 12%, transparent) 0%,
                color-mix(in srgb, var(--palette-secondary, #00ff88) 8%, transparent) 50%,
                color-mix(in srgb, var(--palette-primary, #00d4ff) 12%, transparent) 100%
              );
              border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
              border-radius: 16px;
              box-shadow: 0 8px 32px color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
            ">
              <!-- Welcome Header with Typing Animation (React Component) -->
              <div data-welcome-header-placeholder></div>
            </div>

            <!-- Custom Quick Actions Section with Drop Zone -->
            <div 
              id="omega-quick-actions-drop-zone"
              style="
                background: linear-gradient(135deg, 
                  color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%,
                  color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%
                );
                border: 2px dashed color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 4px 20px color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent);
                transition: all 0.3s ease;
              "
              onmouseenter="this.style.borderColor = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 50%, transparent)'; this.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent) 100%)';"
              onmouseleave="this.style.borderColor = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)'; this.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%)';"
            >
              <div style="
                font-size: 18px;
                font-weight: 700;
                color: var(--palette-primary, #00d4ff);
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">
                ${lightbulbIcon}
                Your Quick Actions
              </div>
              
              ${quickActionsHtml}
              
              <div style="
                margin-top: 20px;
                padding-top: 16px;
                border-top: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
                text-align: center;
                font-size: 12px;
                color: color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent);
              ">
                💡 Drag sections from sidebar here to add commands | ${createCommandLine("quick-actions", "quick-actions")} to customize
              </div>
            </div>

          </div>
        </div>
      `;

      return prev.map((line) =>
        line.id === "welcome-1"
          ? { ...line, htmlContent: welcomeHtml }
          : line
      );
    });
  }, []); // Empty deps - we'll trigger this manually via event

  // Listen for quick actions changes to update welcome message
  useEffect(() => {
    const handleQuickActionsChange = () => {
      setTerminalLines((prev) => {
        if (prev.length === 0 || prev[0].id !== "welcome-1") {
          return prev;
        }
        // Trigger re-render by updating the welcome line
        const actions = getQuickActions();
        const grouped = groupQuickActionsByCategory(actions);
        
        // Regenerate quick actions HTML (same logic as above)
        const lightbulbIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z"></path><line x1="12" y1="9" x2="12" y2="15"></line></svg>`;
        const walletIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
        const tradingIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
        const analyticsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M3 3v18h18"></path><path d="M18 7l-5 5-4-4-6 6"></path></svg>`;
        const mediaIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        const lightningIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
        const rocketIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`;
        const globeIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-bottom: 4px;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

        const categoryIcons: Record<string, string> = {
          "Wallet & Connection": walletIcon,
          "Trading & Markets": tradingIcon,
          "DeFi & Analytics": analyticsIcon,
          "Ethereum & Uniswap": tradingIcon,
          "Media & Entertainment": mediaIcon,
          "Other": lightbulbIcon,
        };
        const categoryColors: Record<string, string> = {
          "Wallet & Connection": "var(--palette-secondary, #00ff88)",
          "Trading & Markets": "var(--palette-warning, #ffa502)",
          "DeFi & Analytics": "var(--palette-secondary, #00ff88)",
          "Ethereum & Uniswap": "var(--palette-primary, #00d4ff)",
          "Media & Entertainment": "var(--palette-accent, #ff00ff)",
          "Other": "var(--palette-primary, #00d4ff)",
        };

        let quickActionsHtml = "";
        const categories = Object.keys(grouped);
        
        categories.forEach((category, catIndex) => {
          const categoryActions = grouped[category];
          const icon = categoryIcons[category] || lightbulbIcon;
          const color = categoryColors[category] || "var(--palette-primary, #00d4ff)";
          
          quickActionsHtml += `
            <div style="margin-bottom: ${catIndex === categories.length - 1 ? '0' : '20px'};">
              <div style="
                font-size: 13px;
                font-weight: 600;
                color: ${color};
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">
                ${icon}
                ${category}
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
                ${categoryActions.map((action) => {
                  const escapedCommand = action.command.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
                  return `
                    <div 
                      class="omega-execute-command"
                      data-command="${escapedCommand}"
                      style="
                        color: var(--palette-secondary, #00ff88);
                        font-weight: bold;
                        font-size: 1.05em;
                        font-family: 'Courier New', monospace;
                        text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);
                        cursor: pointer;
                        display: inline-block;
                        padding: 8px 12px;
                        border-radius: 6px;
                        background: color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent);
                        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
                        transition: all 0.2s ease;
                        user-select: none;
                      "
                      onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent)'; this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 12px color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)';"
                      onmouseout="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent)'; this.style.transform = 'translateY(0)'; this.style.boxShadow = 'none';"
                      title="Click to execute: ${escapedCommand}"
                    >
                      ${action.label || action.command}
                      ${action.description ? `<div style="font-size: 0.85em; color: color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent); margin-top: 4px; font-weight: normal;">${action.description}</div>` : ""}
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `;
        });

        if (categories.length === 0) {
          quickActionsHtml = `
            <div style="text-align: center; padding: 20px; color: color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent);">
              No quick actions set yet. Drag sections from the sidebar here or use 'quick-actions add' to customize!
            </div>
          `;
        }

        // Get the existing welcome HTML and replace just the quick actions part
        const existingWelcome = prev[0]?.htmlContent || "";
        const quickActionsStart = existingWelcome.indexOf('<!-- Custom Quick Actions Section');
        
        // Find the end of the quick actions section
        // Look for the closing </div> after the tip text "💡 Drag sections from sidebar"
        let quickActionsEnd = -1;
        if (quickActionsStart !== -1) {
          const tipText = '💡 Drag sections from sidebar';
          const tipIndex = existingWelcome.indexOf(tipText, quickActionsStart);
          if (tipIndex !== -1) {
            // Find the closing </div> tag that closes the drop zone div (after the tip div)
            // The structure is: tip div closes, then drop zone div closes
            let closeCount = 0;
            let searchIndex = tipIndex + tipText.length;
            // Find the closing </div> for the tip div first
            const tipClose = existingWelcome.indexOf('</div>', searchIndex);
            if (tipClose !== -1) {
              // Then find the closing </div> for the drop zone div
              quickActionsEnd = existingWelcome.indexOf('</div>', tipClose + 6);
              if (quickActionsEnd !== -1) {
                quickActionsEnd += 6; // Include the </div> tag
              }
            }
          }
        }
        
        if (quickActionsStart !== -1 && quickActionsEnd !== -1) {
          const before = existingWelcome.substring(0, quickActionsStart);
          const after = existingWelcome.substring(quickActionsEnd);
          
          const newQuickActionsSection = `
            <!-- Custom Quick Actions Section with Drop Zone -->
            <div 
              id="omega-quick-actions-drop-zone"
              style="
                background: linear-gradient(135deg, 
                  color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%,
                  color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%
                );
                border: 2px dashed color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 4px 20px color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent);
                transition: all 0.3s ease;
              "
              onmouseenter="this.style.borderColor = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 50%, transparent)'; this.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent) 100%)';"
              onmouseleave="this.style.borderColor = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)'; this.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent) 0%, color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent) 100%)';"
            >
              <div style="
                font-size: 18px;
                font-weight: 700;
                color: var(--palette-primary, #00d4ff);
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">
                ${lightbulbIcon}
                Your Quick Actions
              </div>
              
              ${quickActionsHtml}
              
              <div style="
                margin-top: 20px;
                padding-top: 16px;
                border-top: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
                text-align: center;
                font-size: 12px;
                color: color-mix(in srgb, var(--palette-text, #e0e0e0) 70%, transparent);
              ">
                💡 Drag sections from sidebar here to add commands | ${createCommandLine("quick-actions", "quick-actions")} to customize
              </div>
            </div>
          `;
          
          const newHtml = before + newQuickActionsSection + after;
          
          return prev.map((line) =>
            line.id === "welcome-1"
              ? { ...line, htmlContent: newHtml }
              : line
          );
        }
        
        return prev;
      });
    };

    // Listen for quick actions updates
    window.addEventListener("omega-quick-actions-updated", handleQuickActionsChange);
    
    return () => {
      window.removeEventListener("omega-quick-actions-updated", handleQuickActionsChange);
    };
  }, []);

  // Mining state management
  const [miningState, setMiningState] = useState({
    isMining: false,
    mineCount: 0,
    totalEarned: 0,
  });
  const miningInterval = useRef<NodeJS.Timeout | null>(null);
  const miningTimeoutRef = useRef<number | null>(null);
  const miningActiveRef = useRef<boolean>(false);

  // Stress test state management
  const [stressTestState, setStressTestState] = useState({
    isStressTesting: false,
    stats: {
      walletsCreated: 0,
      transactionsSent: 0,
      successfulTxs: 0,
      failedTxs: 0,
      startTime: 0,
    },
  });
  const stressTestInterval = useRef<NodeJS.Timeout | null>(null);
  const stressTestTimeoutRef = useRef<number | null>(null);
  const stressActiveRef = useRef<boolean>(false);
  const stressWallet = useRef<any>(null);

  // Track whether we've observed a real user gesture (pointer/touch/keyboard)
  const hasUserGestureRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const markGesture = () => {
      hasUserGestureRef.current = true;
    };

    window.addEventListener("pointerdown", markGesture, { once: true });
    window.addEventListener("touchstart", markGesture, { once: true });
    window.addEventListener("keydown", markGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", markGesture);
      window.removeEventListener("touchstart", markGesture);
      window.removeEventListener("keydown", markGesture);
    };
  }, []);

  const autoConnectBlockedRef = useRef<boolean>(false);

  // Command queue for sequential execution (FIFO) - stores command with metadata
  const commandQueue = useRef<Array<{ command: string; fromAI: boolean }>>([]);
  const isProcessingQueue = useRef<boolean>(false);

  const isCommandAvailable = useCallback((commandString: string): boolean => {
    const args = parseCommandArgs(commandString);
    if (args.length === 0) {
      return false;
    }

    const commandName = args[0]!.toLowerCase();
    return Boolean(commandRegistry.getCommand(commandName));
  }, []);

  /**
   * Add a line to terminal output
   */
  const addLine = useCallback(
    (type: TerminalLine["type"], content: string): void => {
      const newLine: TerminalLine = {
        id: `line-${Date.now()}-${Math.random()}`,
        type,
        content,
        timestamp: Date.now(),
      };
      setTerminalLines((prev) => [...prev, newLine]);
    },
    []
  );

  /**
   * Log function for command context
   */
  const log = useCallback(
    (message: string, type: TerminalLine["type"]): void => {
      addLine(type, message);
    },
    [addLine]
  );

  /**
   * Log HTML content for command context
   */
  const logHtml = useCallback((htmlContent: string): void => {
    const newLine: TerminalLine = {
      id: `line-${Date.now()}-${Math.random()}`,
      type: "html",
      content: "", // Empty string for HTML lines
      timestamp: Date.now(),
      htmlContent: htmlContent,
    };
    setTerminalLines((prev) => [...prev, newLine]);
  }, []);

  /**
   * Clear terminal output
   */
  const clearTerminal = useCallback((): void => {
    setTerminalLines([]);
  }, []);

  /**
   * Start mining operation
   */
  const startMining = useCallback((): void => {
    miningActiveRef.current = true;
    setMiningState((prev) => ({
      ...prev,
      isMining: true,
    }));
  }, []);

  /**
   * Stop mining operation
   */
  const stopMining = useCallback((): void => {
    miningActiveRef.current = false;
    setMiningState({
      isMining: false,
      mineCount: 0,
      totalEarned: 0,
    });
    if (miningInterval.current) {
      clearInterval(miningInterval.current);
      miningInterval.current = null;
    }
    if (miningTimeoutRef.current !== null) {
      clearTimeout(miningTimeoutRef.current);
      miningTimeoutRef.current = null;
    }
  }, []);

  /**
   * Update mining count
   */
  const incrementMineCount = useCallback((): void => {
    setMiningState((prev) => ({
      ...prev,
      mineCount: prev.mineCount + 1,
    }));
  }, []);

  /**
   * Update total earned
   */
  const addToTotalEarned = useCallback((amount: number): void => {
    setMiningState((prev) => ({
      ...prev,
      totalEarned: prev.totalEarned + amount,
    }));
  }, []);

  /**
   * Start stress test operation
   */
  const startStressTest = useCallback((): void => {
    stressActiveRef.current = true;
    setStressTestState({
      isStressTesting: true,
      stats: {
        walletsCreated: 0,
        transactionsSent: 0,
        successfulTxs: 0,
        failedTxs: 0,
        startTime: Date.now(),
      },
    });
  }, []);

  /**
   * Stop stress test operation
   */
  const stopStressTest = useCallback((): void => {
    stressActiveRef.current = false;
    setStressTestState((prev) => ({
      ...prev,
      isStressTesting: false,
    }));
    if (stressTestInterval.current) {
      clearInterval(stressTestInterval.current);
      stressTestInterval.current = null;
    }
    if (stressTestTimeoutRef.current !== null) {
      clearTimeout(stressTestTimeoutRef.current);
      stressTestTimeoutRef.current = null;
    }
    stressWallet.current = null;
  }, []);

  /**
   * Update stress test stats
   */
  const updateStressTestStats = useCallback(
    (updates: Partial<typeof stressTestState.stats>): void => {
      setStressTestState((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          ...updates,
        },
      }));
    },
    []
  );

  /**
   * Atomic increment helpers for stress test stats
   */
  const incTransactionsSent = useCallback((): void => {
    setStressTestState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        transactionsSent: prev.stats.transactionsSent + 1,
      },
    }));
  }, []);

  const incSuccessfulTxs = useCallback((): void => {
    setStressTestState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        successfulTxs: prev.stats.successfulTxs + 1,
      },
    }));
  }, []);

  const incFailedTxs = useCallback((): void => {
    setStressTestState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        failedTxs: prev.stats.failedTxs + 1,
      },
    }));
  }, []);

  /**
   * Get contract instance helper
   */
  const getContract = useCallback(
    (address: string, abi: any[], signerOrProvider?: any): any => {
      try {
        return new Contract(address, abi, signerOrProvider);
      } catch (error) {
        console.error("Error creating contract instance:", error);
        throw error;
      }
    },
    []
  );

  const executeFallbackCommand = useCallback(
    async (commandString: string, context: CommandContext): Promise<void> => {
      const args = parseCommandArgs(commandString);
      if (args.length === 0) {
        return;
      }

      const commandName = args[0]!.toLowerCase();

      switch (commandName) {
        case "help": {
          context.log(
            "Command system initialization failed. Fallback commands available:",
            "error"
          );
          context.log(" • help — show fallback commands", "output");
          context.log(" • clear — clear terminal output", "output");
          context.log(" • connect — attempt MetaMask connection", "output");
          if (commandSystemErrors.length > 0) {
            context.log(
              `Missing command modules: ${commandSystemErrors.join(", ")}`,
              "warning"
            );
          }
          break;
        }
        case "clear": {
          context.clearTerminal();
          context.log("Terminal cleared (fallback handler).", "info");
          break;
        }
        case "connect": {
          context.log("🌐 Opening multi-network selector…", "info");
          if (typeof window === "undefined") {
            context.log(
              "Environment does not support wallet connection (SSR).",
              "error"
            );
            break;
          }

          openNetworkSelector({
            log: context.log,
            logHtml: context.logHtml,
            wallet: context.wallet,
            sound: context.sound,
            source: "command",
          });
          break;
        }
        default: {
          context.log(
            `Command system offline. '${commandName}' is unavailable.`,
            "error"
          );
          context.log("Fallback commands: help, clear, connect", "info");
        }
      }
    },
    [commandSystemErrors]
  );

  /**
   * Process the command queue sequentially
   */
  const processQueue = useCallback(async (): Promise<void> => {
    // If already processing, return
    if (isProcessingQueue.current) {
      return;
    }

    // Start processing
    isProcessingQueue.current = true;

    try {
      // Process commands while queue is not empty
      while (commandQueue.current.length > 0) {
        // Dequeue the next command with metadata
        const { command: trimmedCommand, fromAI } =
          commandQueue.current.shift()!;

        if (process.env.NODE_ENV !== "production") {
          try {
            // eslint-disable-next-line no-console
            console.warn("[CommandQueue][debug] executing command", {
              command: trimmedCommand,
              fromAI,
              stack: new Error().stack,
            });
          } catch {
            // ignore logging errors
          }
        }

        // Add command to terminal output
        addLine("command", trimmedCommand);

        // Emit chart open event when relevant to update dashboard stats panel
        try {
          if (typeof window !== "undefined") {
            const lc = trimmedCommand.toLowerCase();
            if (lc.startsWith("chart ") || lc === "chart") {
              const symbol =
                trimmedCommand.split(" ").slice(1).join(" ").trim() || "BTC";
              window.dispatchEvent(
                new CustomEvent("omega:openChart", {
                  detail: { symbol: symbol.toUpperCase() },
                })
              );
            }
          }
        } catch {}

        // Add to command history
        setCommandHistory((prev) => [...prev, trimmedCommand]);
        setHistoryIndex(-1);

        // NOTE: Removed command-execute sound playback
        // The wookie.mp4.mp3 sound should ONLY play for interface selection (WelcomeScreen)
        // Quick action buttons execute commands, but they shouldn't play the wookie sound
        // If (soundEffects.state.isEnabled) {
        //   soundEffects.playSound("command-execute").catch(() => {});
        // }

        // Create command context
        const context: CommandContext = {
          log,
          logHtml,
          clearTerminal,
          executeCommand, // Allow nested command execution (for AI)
          theme: {
            currentTheme: theme.currentTheme,
            setTheme: theme.setTheme,
            toggleTheme: theme.toggleTheme,
          },
          viewMode: {
            viewMode: viewModeCtx.viewMode,
            setViewMode: viewModeCtx.setViewMode,
            toggleViewMode: viewModeCtx.toggleViewMode,
            isBasicMode: viewModeCtx.isBasicMode,
            isFuturisticMode: viewModeCtx.isFuturisticMode,
          },
          wallet: {
            state: wallet.state,
            address: wallet.state.address,
            solana: {
              address: multichain.solanaState.publicKey,
            },
            connect: async () => {
              return await wallet.connectMetaMask();
            },
            disconnect: async () => {
              await wallet.disconnect();
            },
            createSessionWallet: async () => {
              try {
                // Call the wallet provider method to create and connect
                const success = await wallet.createSessionWallet();
                if (!success) {
                  return null;
                }

                // Get the private key from session storage (where WalletProvider stores it)
                const privateKey =
                  typeof window !== "undefined"
                    ? sessionStorage.getItem("omega-session-wallet-key")
                    : null;

                if (!privateKey || !wallet.state.address) {
                  return null;
                }

                return {
                  address: wallet.state.address,
                  privateKey: privateKey,
                };
              } catch (error) {
                console.error("Error creating session wallet:", error);
                return null;
              }
            },
            importSessionWallet: async (privateKey: string) => {
              try {
                return await wallet.importSessionWallet(privateKey);
              } catch (error) {
                console.error("Error importing session wallet:", error);
                return false;
              }
            },
            getBalance: async () => {
              try {
                return await wallet.getBalance();
              } catch (error) {
                console.error("Error getting balance:", error);
                return null;
              }
            },
            getSigner: async () => {
              try {
                return await wallet.getSigner();
              } catch (error) {
                console.error("Error getting signer:", error);
                return null;
              }
            },
            getProvider: () => {
              try {
                return wallet.getProvider();
              } catch (error) {
                console.error("Error getting provider:", error);
                return null;
              }
            },
            addOmegaNetwork: async () => {
              try {
                return await wallet.addOmegaNetwork();
              } catch (error) {
                console.error("Error adding Omega network:", error);
                return false;
              }
            },
            initializeExternalConnection: async (params) => {
              try {
                await wallet.initializeExternalConnection(params);
              } catch (error) {
                console.error(
                  "Error initializing external wallet connection:",
                  error
                );
                throw error;
              }
            },
          },
          config,
          aiProvider,
          setAiProvider: (provider: AIProvider) => {
            setAiProviderState(provider);
            if (typeof window !== "undefined") {
              localStorage.setItem("omega-ai-mode", provider);
            }
          },
          // Pass the mutable state object properties directly
          // Since we're passing the array/boolean from the ref object,
          // mutations in callAI will update the ref object
          get chatHistory() {
            return aiStateRef.current.chatHistory;
          },
          get executingAICommands() {
            return aiStateRef.current.executingAICommands;
          },
          set executingAICommands(value: boolean) {
            aiStateRef.current.executingAICommands = value;
          },
          miningState: {
            isMining: miningState.isMining,
            mineCount: miningState.mineCount,
            totalEarned: miningState.totalEarned,
            startMining,
            stopMining,
          },
          stressTestState: {
            isStressTesting: stressTestState.isStressTesting,
            stats: stressTestState.stats,
            startStressTest,
            stopStressTest,
          },
          getContract,
          multichain: {
            solana: {
              state: multichain.solanaState,
              connectPhantom: multichain.connectSolanaPhantom,
              generateWallet: multichain.generateSolanaWallet,
              getBalance: multichain.getSolanaBalance,
              sendTransaction: multichain.sendSolanaTransaction,
            },
            near: {
              state: multichain.nearState,
              connect: multichain.connectNear,
              disconnect: multichain.disconnectNear,
              getBalance: multichain.getNearBalance,
              signAndSendTransaction: multichain.signAndSendNearTransaction,
            },
            eclipse: {
              state: multichain.eclipseState,
              connectPhantom: multichain.connectEclipsePhantom,
              generateWallet: multichain.generateEclipseWallet,
              getBalance: multichain.getEclipseBalance,
              sendTransaction: multichain.sendEclipseTransaction,
            },
          },
          media: {
            perps: {
              state: perps.playerState,
              openPanel: perps.openPanel,
              closePanel: perps.closePanel,
              setPair: perps.setPair,
              refresh: perps.refresh,
            },
            spotify: {
              state: spotify.playerState,
              authState: spotify.authState,
              authenticate: spotify.authenticate,
              logout: spotify.logout,
              searchTracks: spotify.searchTracks,
              getUserPlaylists: spotify.getUserPlaylists,
              playTrack: spotify.playTrack,
              playPlaylist: spotify.playPlaylist,
              togglePlayPause: spotify.togglePlayPause,
              skipNext: spotify.skipNext,
              skipPrevious: spotify.skipPrevious,
              setVolume: spotify.setVolume,
              openPanel: spotify.openPanel,
              closePanel: spotify.closePanel,
            },
            youtube: {
              state: youtube.playerState,
              searchVideos: youtube.searchVideos,
              playVideo: youtube.playVideo,
              togglePlayPause: youtube.togglePlayPause,
              next: youtube.next,
              previous: youtube.previous,
              toggleMute: youtube.toggleMute,
              openPanel: youtube.openPanel,
              closePanel: youtube.closePanel,
            },
            news: {
              state: newsReader.readerState,
              loadNews: newsReader.loadNews,
              refreshNews: newsReader.refreshNews,
              setFilter: newsReader.setFilter,
              openPanel: newsReader.openPanel,
              closePanel: newsReader.closePanel,
            },
            pgt: {
              wallets: pgt.wallets,
              portfolio: pgt.portfolio,
              isLoading: pgt.isLoading,
              addWallet: pgt.addWallet,
              removeWallet: pgt.removeWallet,
              getWallet: pgt.getWallet,
              refreshPortfolio: pgt.refreshPortfolio,
              refreshWallet: pgt.refreshWallet,
            },
          },
          games: {
            state: games.gamesState,
            openGame: games.openGame,
            closeGame: games.closeGame,
            submitLocalScore: games.submitLocalScore,
            getLocalLeaderboard: games.getLocalLeaderboard,
            submitOnChainScore: games.submitOnChainScore,
            fetchOnChainLeaderboard: games.fetchOnChainLeaderboard,
          },
          sound: {
            state: soundEffects.state,
            playSound: soundEffects.playSound,
            stopSound: soundEffects.stopSound,
            stopAllSounds: soundEffects.stopAllSounds,
            setVolume: soundEffects.setVolume,
            setEnabled: soundEffects.setEnabled,
            playWalletConnectSound: soundEffects.playWalletConnectSound,
            playAIToggleSound: soundEffects.playAIToggleSound,
            playBalanceWealthSound: soundEffects.playBalanceWealthSound,
            playChartViewerSound: soundEffects.playChartViewerSound,
            playBasicViewSound: soundEffects.playBasicViewSound,
            playClearTerminalSound: soundEffects.playClearTerminalSound,
            playModernUIThemeSound: soundEffects.playModernUIThemeSound,
            playHelpCommandSound: soundEffects.playHelpCommandSound,
            playFaucetSound: soundEffects.playFaucetSound,
          },
          ui: {
            viewMode: viewModeCtx.viewMode,
            setViewMode: viewModeCtx.setViewMode,
            toggleViewMode: viewModeCtx.toggleViewMode,
            isBasicMode: viewModeCtx.isBasicMode,
            isFuturisticMode: viewModeCtx.isFuturisticMode,
            guiTheme: guiThemeCtx.guiTheme,
            setGUITheme: guiThemeCtx.setGUITheme,
            isTerminalMode: guiThemeCtx.isTerminalMode,
            colorPalette: customizerCtx.colorPalette,
            setColorPalette: customizerCtx.setColorPalette,
            cycleColorPalette: customizerCtx.cycleColorPalette,
            resetColorPalette: () => {
              if (typeof customizerCtx.resetPalette === "function") {
                customizerCtx.resetPalette();
              } else {
                customizerCtx.resetToDefaults();
              }
            },
          },
          terminalMode: {
            mode: terminalModeCtx.mode,
            setTerminalMode: terminalModeCtx.setTerminalMode,
            toggleMode: terminalModeCtx.toggleMode,
            isMultiMode: terminalModeCtx.isMultiMode,
            isSingleMode: terminalModeCtx.isSingleMode,
          },
          telegram: {
            state: telegram.state,
            setupAccount: telegram.setupAccount,
            addContact: telegram.addContact,
            removeContact: telegram.removeContact,
            sendMessage: telegram.sendMessage,
            grantAccessToUser: telegram.grantAccessToUser,
            revokeAccessFromUser: telegram.revokeAccessFromUser,
            refreshContacts: telegram.refreshContacts,
            getContactByLabel: telegram.getContactByLabel,
            updateConfiguration: telegram.updateConfiguration,
            clearError: telegram.clearError,
          },
        };

        if (!commandsInitialized) {
          await executeFallbackCommand(trimmedCommand, context);
          continue;
        }

        try {
          // Pass fromAI flag to registry (matches vanilla terminal.html line 4814)
          // Add command registry to context for enhanced agent
          const enhancedContext = {
            ...context,
            commandRegistry: commandRegistry,
          };
          
          await commandRegistry.execute(trimmedCommand, enhancedContext, fromAI);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          log(`Error: ${errorMessage}`, "error");
        }
      }
    } finally {
      // Release processing flag
      isProcessingQueue.current = false;
    }
  }, [
    addLine,
    log,
    logHtml,
    clearTerminal,
    theme,
    wallet,
    multichain,
    perps,
    spotify,
    youtube,
    newsReader,
    games,
    soundEffects,
    telegram,
    aiProvider,
    miningState,
    stressTestState,
    startMining,
    stopMining,
    startStressTest,
    stopStressTest,
    getContract,
    viewModeCtx,
    guiThemeCtx,
    customizerCtx,
    commandsInitialized,
    executeFallbackCommand,
  ]);

  const setCommandSystemStatus = useCallback(
    (ready: boolean, errors?: string[]) => {
      setCommandsInitialized(ready);
      setCommandSystemErrors(errors ?? []);

      if (ready) {
        commandFailureLoggedRef.current = false;
        return;
      }

      if (!commandFailureLoggedRef.current) {
        commandFailureLoggedRef.current = true;
        addLine(
          "error",
          "Command system initialization failed. Basic fallback commands are active."
        );
        if (errors && errors.length > 0) {
          addLine("warning", `Failed modules: ${errors.join(", ")}`);
        }
        addLine("info", "Fallback commands: help, clear, connect");
      }
    },
    [addLine]
  );

  /**
   * Execute a command (adds to queue and starts processing if not already running)
   */
  const executeCommand = useCallback(
    async (command: string, fromAI: boolean = false): Promise<void> => {
      // Trim command and check if empty
      const trimmedCommand = command.trim();
      if (!trimmedCommand) {
        return;
      }

      if (
        trimmedCommand.toLowerCase() === "connect" &&
        !hasUserGestureRef.current &&
        !fromAI
      ) {
        if (!autoConnectBlockedRef.current) {
          autoConnectBlockedRef.current = true;
          addLine(
            "warning",
            "Awaiting user interaction before opening the wallet selector."
          );
        }
        if (process.env.NODE_ENV !== "production") {
          try {
            // eslint-disable-next-line no-console
            console.warn("[CommandQueue][guard] swallowed auto-connect", {
              stack: new Error().stack,
            });
          } catch {
            // ignore logging errors
          }
        }
        return;
      }

      if (process.env.NODE_ENV !== "production") {
        try {
          // eslint-disable-next-line no-console
          console.warn("[CommandQueue][trace] enqueue", {
            command: trimmedCommand,
            fromAI,
            stack: new Error().stack,
          });
        } catch {
          // ignore logging errors
        }
      }

      // Add to queue with metadata (command string and fromAI flag)
      commandQueue.current.push({ command: trimmedCommand, fromAI });

      // Start processing if not already processing
      if (!isProcessingQueue.current) {
        await processQueue();
      }
    },
    [processQueue]
  );

  /**
   * Navigate command history
   */
  const navigateHistory = useCallback(
    (direction: "up" | "down"): string | null => {
      if (direction === "up") {
        // Navigate backwards in history
        if (commandHistory.length === 0) {
          return null;
        }

        let newIndex: number;
        if (historyIndex === -1) {
          // Start from end of history
          newIndex = commandHistory.length - 1;
        } else if (historyIndex > 0) {
          // Move back one
          newIndex = historyIndex - 1;
        } else {
          // Already at start, stay there
          return commandHistory[historyIndex] ?? null;
        }

        setHistoryIndex(newIndex);
        return commandHistory[newIndex] ?? null;
      } else {
        // Navigate forwards in history
        if (historyIndex === -1) {
          // Not navigating, return null
          return null;
        }

        if (historyIndex < commandHistory.length - 1) {
          // Move forward one
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          return commandHistory[newIndex] ?? null;
        } else {
          // Reached end, reset to current
          setHistoryIndex(-1);
          return "";
        }
      }
    },
    [commandHistory, historyIndex]
  );

  /**
   * Get autocomplete matches for partial command
   */
  const autocomplete = useCallback((partial: string): string[] => {
    if (!partial) {
      // Return all unique command names (no aliases) if no partial
      return commandRegistry.getUniqueCommandNames();
    }

    // Filter unique command names that start with partial (case-insensitive)
    const matches = commandRegistry
      .getUniqueCommandNames()
      .filter((cmd) => cmd.toLowerCase().startsWith(partial.toLowerCase()));

    return matches;
  }, []);

  /**
   * Update AI provider in localStorage when it changes
   */
  const setAiProvider = useCallback((provider: AIProvider): void => {
    setAiProviderState(provider);
    if (typeof window !== "undefined") {
      localStorage.setItem("omega-ai-mode", provider);
    }
  }, []);

  /**
   * Cleanup on unmount - stop mining and stress test
   */
  useEffect(() => {
    return () => {
      if (miningInterval.current) {
        clearInterval(miningInterval.current);
      }
      if (miningTimeoutRef.current !== null) {
        clearTimeout(miningTimeoutRef.current);
      }
      if (stressTestInterval.current) {
        clearInterval(stressTestInterval.current);
      }
      if (stressTestTimeoutRef.current !== null) {
        clearTimeout(stressTestTimeoutRef.current);
      }
    };
  }, []);

  // Expose refs and state updaters for commands to use
  // Store in a ref that commands can access
  const miningIntervalRef = miningInterval;
  const stressTestIntervalRef = stressTestInterval;
  const stressWalletRef = stressWallet;

  // Make updater functions available through context
  useEffect(() => {
    // Attach updater functions to window for command access
    if (typeof window !== "undefined") {
      (window as any).__omegaMiningUpdaters = {
        incrementMineCount,
        addToTotalEarned,
        updateStressTestStats,
        incTransactionsSent,
        incSuccessfulTxs,
        incFailedTxs,
        miningIntervalRef,
        miningTimeoutRef,
        miningActiveRef,
        stressTestIntervalRef,
        stressTestTimeoutRef,
        stressActiveRef,
        stressWalletRef,
      };
    }
  }, [
    incrementMineCount,
    addToTotalEarned,
    updateStressTestStats,
    incTransactionsSent,
    incSuccessfulTxs,
    incFailedTxs,
  ]);

  return {
    executeCommand,
    terminalLines,
    clearTerminal,
    commandHistory,
    historyIndex,
    navigateHistory,
    autocomplete,
    aiProvider,
    setAiProvider,
    miningState,
    stressTestState,
    commandsInitialized,
    commandSystemErrors,
    setCommandSystemStatus,
    isCommandAvailable,
  };
}

export default useCommandExecution;
