"use client";

/**
 * DashboardTerminalHeader Component
 * Terminal header specifically for dashboard/futuristic view mode
 * Matches the vanilla futuristic-dashboard-transform.js terminal-header structure
 */

import type { AIProvider } from "@/types";
import { APP_VERSION, SOCIAL_LINKS } from "@/lib/constants";
import styles from "./DashboardTerminalHeader.module.css";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useWallet } from "@/hooks/useWallet";

interface DashboardTerminalHeaderProps {
  onThemeCycle: () => void;
  onPaletteCycle: () => void;
  onLightDarkToggle: () => void;
  onDashboardToggle: () => void;
  aiProvider: AIProvider;
  onAiProviderChange: (provider: AIProvider) => void;
  connectionStatus: "connected" | "connecting" | "disconnected";
  walletAddress?: string;
}

export function DashboardTerminalHeader({
  onThemeCycle,
  onPaletteCycle,
  onLightDarkToggle,
  onDashboardToggle,
  aiProvider,
  onAiProviderChange,
  connectionStatus,
  walletAddress,
}: DashboardTerminalHeaderProps) {
  const soundEffects = useSoundEffects();
  const wallet = useWallet();

  return (
    <div className={styles.terminalHeader}>
      <div className={styles.terminalTitle}>
        <span id="omega-title-symbol">Ω</span>
        <span>OMEGA TERMINAL v{APP_VERSION}</span>
      </div>
      <div className={styles.terminalControls}>
        {/* Status Indicators */}
        <div className={styles.statusIndicator}>
          <div
            className={`${styles.statusDot} ${
              connectionStatus === "connected"
                ? styles.statusConnected
                : connectionStatus === "connecting"
                ? styles.statusConnecting
                : styles.statusDisconnected
            }`}
          ></div>
          <span>
            {connectionStatus === "connected"
              ? "CONNECTED"
              : connectionStatus === "connecting"
              ? "CONNECTING"
              : "INITIALIZING"}
          </span>
        </div>

        <div className={styles.statusIndicator}>
          <span>
            {wallet.state.isConnected && wallet.state.address
              ? `${wallet.state.address.slice(
                  0,
                  6
                )}...${wallet.state.address.slice(-4)}`
              : "NO WALLET"}
          </span>
        </div>

        {/* Network status display - if connected */}
        {wallet.state.isConnected && wallet.state.network && (
          <div className={styles.statusIndicator}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className={styles.networkLogo}>Ω</div>
              <span>{wallet.state.network}</span>
            </div>
            {wallet.state.address && (
              <span>
                {wallet.state.address.slice(0, 6)}...
                {wallet.state.address.slice(-4)}
              </span>
            )}
          </div>
        )}

        <div className={styles.terminalDivider}></div>

        {/* AI Provider Select */}
        <label htmlFor="wrapperAiProviderSelect" className={styles.aiLabel}>
          AI:
        </label>
        <select
          id="wrapperAiProviderSelect"
          title="Select AI Provider"
          value={aiProvider}
          onChange={async (e) => {
            onAiProviderChange(e.target.value as AIProvider);
            try {
              await soundEffects.playAIToggleSound();
            } catch {}
          }}
          className={styles.aiSelect}
        >
          <option value="off">Off</option>
          <option value="near">NEAR AI</option>
          <option value="openai">OpenAI</option>
        </select>

        {/* Theme Toggle */}
        <button
          className={styles.terminalIconBtn}
          onClick={onLightDarkToggle}
          title="Toggle Dark/Light Mode"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
          </svg>
        </button>

        {/* Color Palette Toggle */}
        <button
          className={styles.terminalIconBtn}
          onClick={onPaletteCycle}
          title="Cycle Color Palette"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
        </button>

        {/* Theme Cycle Toggle */}
        <button
          className={styles.terminalIconBtn}
          onClick={onThemeCycle}
          title="Cycle Theme"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12,2C6.5,2 2,6.5 2,12C2,17.5 6.5,22 12,22C17.5,22 22,17.5 22,12C22,6.5 17.5,2 12,2M12,4C16.4,4 20,7.6 20,12C20,16.4 16.4,20 12,20C7.6,20 4,16.4 4,12C4,7.6 7.6,4 12,4M12,6C8.7,6 6,8.7 6,12C6,15.3 8.7,18 12,18C15.3,18 18,15.3 18,12C18,8.7 15.3,6 12,6M12,8C14.2,8 16,9.8 16,12C16,14.2 14.2,16 12,16C9.8,16 8,14.2 8,12C8,9.8 9.8,8 12,8M12,10C10.9,10 10,10.9 10,12C10,13.1 10.9,14 12,14C13.1,14 14,13.1 14,12C14,10.9 13.1,10 12,10Z" />
          </svg>
        </button>

        {/* View Mode Toggle */}
        <button
          className={styles.terminalIconBtn}
          onClick={onDashboardToggle}
          title="Toggle Basic/Dashboard View"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3,3H9V7H3V3M15,10H21V14H15V10M15,17H21V21H15V17M13,13H7V18H13V13Z" />
          </svg>
        </button>

        <div className={styles.terminalDivider}></div>

        {/* External Links */}
        <a
          href={SOCIAL_LINKS.website}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.terminalIconBtn}
          title="Omega Network"
        >
          <svg viewBox="0 0 24 24">
            <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
        </a>
        <a
          href={SOCIAL_LINKS.discord}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.terminalIconBtn}
          title="Discord"
        >
          <svg viewBox="0 0 24 24">
            <path d="M22,24L16.75,19L17.38,21H4.5A2.5,2.5 0 0,1 2,18.5V3.5A2.5,2.5 0 0,1 4.5,1H19.5A2.5,2.5 0 0,1 22,3.5V24M12,6.8C9.32,6.8 7.44,7.95 7.44,7.95C8.47,7.03 10.27,6.5 10.27,6.5L10.1,6.33C8.41,6.36 6.88,7.53 6.88,7.53C5.16,11.12 5.27,14.22 5.27,14.22C6.67,16.03 8.75,15.9 8.75,15.9L9.46,15C8.21,14.73 7.42,13.62 7.42,13.62C7.42,13.62 9.3,14.9 12,14.9C14.7,14.9 16.58,13.62 16.58,13.62C16.58,13.62 15.79,14.73 14.54,15L15.25,15.9C15.25,15.9 17.33,16.03 18.73,14.22C18.73,14.22 18.84,11.12 17.12,7.53C17.12,7.53 15.59,6.36 13.9,6.33L13.73,6.5C13.73,6.5 15.53,7.03 16.56,7.95C16.56,7.95 14.68,6.8 12,6.8Z" />
          </svg>
        </a>
        <a
          href={SOCIAL_LINKS.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.terminalIconBtn}
          title="Twitter"
        >
          <svg viewBox="0 0 24 24">
            <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.70,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
          </svg>
        </a>
        <a
          href={SOCIAL_LINKS.docs}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.terminalIconBtn}
          title="Documentation"
        >
          <svg viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
