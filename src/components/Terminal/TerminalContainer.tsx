"use client";

/**
 * TerminalContainer Component
 * Main terminal wrapper managing state and coordinating child components
 *
 * Command execution is now handled by useCommandExecution hook and CommandRegistry.
 * This component focuses on UI state management and integrating the command system
 * with theme and wallet contexts.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { BootAnimation } from "./BootAnimation";
import { TerminalHeader } from "./TerminalHeader";
import { DashboardTerminalHeader } from "./DashboardTerminalHeader";
import { TerminalOutput } from "./TerminalOutput";
import { TerminalInput } from "./TerminalInput";
import { MiningStatus, StressTestStats } from "@/components/Mining";
import { useTheme } from "@/hooks/useTheme";
import { useWallet } from "@/hooks/useWallet";
import { useTerminal } from "@/providers/TerminalProvider";
import { registerAllCommands } from "@/lib/commands";
import type { CommandRegistrationResult } from "@/lib/commands";
import { shortenAddress } from "@/lib/utils";
import { APP_VERSION } from "@/lib/constants";
import type { ConnectionStatus } from "@/types";
import styles from "./TerminalContainer.module.css";
import { useViewMode } from "@/hooks/useViewMode";
import { useCustomizer } from "@/hooks/useCustomizer";

export function TerminalContainer() {
  // State management
  const [showBoot, setShowBoot] = useState(true);
  const [commandsReady, setCommandsReady] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  // Get theme context
  const { currentTheme, toggleTheme } = useTheme();

  // Get wallet context
  const { state: walletState } = useWallet();
  const { isBasicMode, toggleViewMode } = useViewMode();
  const { cycleColorPalette } = useCustomizer();

  // Get command execution context
  const {
    executeCommand,
    terminalLines,
    navigateHistory,
    autocomplete,
    aiProvider,
    setAiProvider,
    miningState,
    stressTestState,
    commandsInitialized,
    commandSystemErrors,
    setCommandSystemStatus,
  } = useTerminal();

  // Register all commands on mount
  const registrationPromiseRef =
    useRef<Promise<CommandRegistrationResult> | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const runRegistration = async () => {
      try {
        if (!registrationPromiseRef.current) {
          registrationPromiseRef.current = registerAllCommands();
        }

        const result = await registrationPromiseRef.current;
        if (!isMounted) {
          return;
        }

        const diagnostics: string[] = [];

        if (result.failedGroups.length > 0) {
          diagnostics.push(
            ...result.failedGroups.map(
              (group) => `Group '${group}' failed to register.`
            )
          );
        }

        if (result.failedCommands.length > 0) {
          diagnostics.push(
            ...result.failedCommands.map(({ group, command, reason }) =>
              reason
                ? `${group} > ${command}: ${reason}`
                : `${group} > ${command}: failed`
            )
          );
        }

        const success = result.registeredGroups.length > 0;
        setCommandSystemStatus(success, diagnostics);
      } catch (error) {
        console.error("[Command System] Failed to register commands", error);
        if (isMounted) {
          setCommandSystemStatus(false, ["core"]);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (isMounted) {
          setCommandsReady(true);
        }
      }
    };

    timeoutId = setTimeout(() => {
      if (!isMounted) {
        return;
      }
      setCommandSystemStatus(false, ["timeout"]);
      setCommandsReady(true);
    }, 4500);

    void runRegistration();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [setCommandSystemStatus]);

  // Update connection status based on wallet state
  useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("disconnected");
    }
  }, [walletState.isConnected, walletState.address]);

  // Boot animation complete handler
  const handleBootComplete = useCallback(() => {
    setShowBoot(false);
  }, []);

  // Theme cycle handler
  const handleThemeCycle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Palette cycle handler
  const handlePaletteCycle = useCallback(() => {
    cycleColorPalette();
  }, [cycleColorPalette]);

  // Light/dark toggle handler (placeholder)
  const handleLightDarkToggle = useCallback(() => {
    console.log("Light/dark toggle not implemented yet");
    executeCommand(""); // Could add a light/dark toggle command in future
  }, [executeCommand]);

  // Dashboard toggle handler
  const handleDashboardToggle = useCallback(() => {
    toggleViewMode();
  }, [toggleViewMode]);

  // AI provider change handler
  const handleAiProviderChange = useCallback(
    (provider: string) => {
      setAiProvider(provider as typeof aiProvider);
    },
    [setAiProvider]
  );

  // Render boot animation
  if (isBasicMode && showBoot) {
    return <BootAnimation onComplete={handleBootComplete} />;
  }

  // Render main terminal interface
  return (
    <div
      className={`${styles.container} ${!isBasicMode ? styles.embedded : ""}`}
    >
      {/* Terminal Header - different for basic vs dashboard view */}
      {isBasicMode ? (
        <TerminalHeader
          onThemeCycle={handleThemeCycle}
          onPaletteCycle={handlePaletteCycle}
          onLightDarkToggle={handleLightDarkToggle}
          onDashboardToggle={handleDashboardToggle}
          aiProvider={aiProvider}
          onAiProviderChange={handleAiProviderChange}
          connectionStatus={connectionStatus}
          walletAddress={
            walletState.isConnected && walletState.address
              ? shortenAddress(walletState.address)
              : undefined
          }
        />
      ) : (
        <DashboardTerminalHeader
          onThemeCycle={handleThemeCycle}
          onPaletteCycle={handlePaletteCycle}
          onLightDarkToggle={handleLightDarkToggle}
          onDashboardToggle={handleDashboardToggle}
          aiProvider={aiProvider}
          onAiProviderChange={handleAiProviderChange}
          connectionStatus={connectionStatus}
          walletAddress={
            walletState.isConnected && walletState.address
              ? shortenAddress(walletState.address)
              : undefined
          }
        />
      )}

      {/* Mining Status Widget - Shows when mining is active */}
      {miningState.isMining && (
        <MiningStatus
          isMining={miningState.isMining}
          mineCount={miningState.mineCount}
          totalEarned={miningState.totalEarned}
          onStop={() => executeCommand("stop")}
        />
      )}

      {/* Stress Test Stats Widget - Shows when stress test is running */}
      {stressTestState.isStressTesting && (
        <StressTestStats
          isActive={stressTestState.isStressTesting}
          stats={stressTestState.stats}
          onStop={() => executeCommand("stopstress")}
        />
      )}

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        <div className={`${styles.tab} ${styles.tabActive}`}>Terminal 1</div>
        <button className={styles.addTabButton} title="Add new terminal tab">
          +
        </button>
      </div>

      {!commandsReady && (
        <div className={styles.commandInitBanner}>
          Initializing command system…
        </div>
      )}

      {commandsReady && !commandsInitialized && (
        <div className={styles.commandErrorBanner}>
          <strong>Command system fallback active.</strong>
          <p>
            Some command modules failed to load. Fallback commands available:
            <code>help</code>, <code>clear</code>, <code>connect</code>.
          </p>
          {commandSystemErrors.length > 0 && (
            <ul>
              {commandSystemErrors.map((group) => (
                <li key={group}>{group}</li>
              ))}
            </ul>
          )}
          <p>
            Check the browser console or recovery plan for guidance on restoring
            missing modules.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className={styles.infoBox}>
        <div>⏳ Faucet cooldown: 24 hours between requests</div>
        <div>📱 Mobile users: Use landscape mode for best experience</div>
      </div>

      {/* Terminal Output */}
      <TerminalOutput lines={terminalLines} isScrolling={true} />

      {/* Terminal Input */}
      <TerminalInput
        onSubmit={executeCommand}
        onHistoryUp={() => navigateHistory("up")}
        onHistoryDown={() => navigateHistory("down")}
        onAutocomplete={autocomplete}
        placeholder={
          !commandsReady
            ? "Initializing command system…"
            : !commandsInitialized
            ? "Fallback mode active: try help, clear, connect"
            : aiProvider !== "off"
            ? "Enter command or ask me anything..."
            : "Enter command..."
        }
        disabled={!commandsReady}
      />
    </div>
  );
}
