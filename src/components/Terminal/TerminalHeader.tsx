"use client";

/**
 * TerminalHeader Component
 * Displays terminal header with title, social links, theme controls, AI selector, and connection status
 */

import Link from "next/link";
import type { TerminalHeaderProps } from "@/types/terminal";
import type { AIProvider } from "@/types";
import { APP_VERSION, SOCIAL_LINKS } from "@/lib/constants";
import styles from "./TerminalHeader.module.css";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export function TerminalHeader({
  onThemeCycle,
  onPaletteCycle,
  onLightDarkToggle,
  onDashboardToggle,
  aiProvider,
  onAiProviderChange,
  connectionStatus,
  walletAddress,
}: TerminalHeaderProps) {
  const soundEffects = useSoundEffects();
  return (
    <header className={styles.header}>
      {/* Left Section: Title */}
      <div className={styles.headerLeft}>
        <h1 className={styles.title}>Ω Terminal v{APP_VERSION}</h1>
        <nav className={styles.routeNav} aria-label="Primary navigation">
          <Link href="/" className={styles.routeLink}>
            Terminal
          </Link>
          <Link href="/dashboard" className={styles.routeLink}>
            Dashboard
          </Link>
          <Link href="/games" className={styles.routeLink}>
            Games
          </Link>
          <Link href="/nft" className={styles.routeLink}>
            NFT
          </Link>
          <Link href="/media" className={styles.routeLink}>
            Media
          </Link>
        </nav>
      </div>

      {/* Center Section: Social Links */}
      <div className={styles.headerCenter}>
        <div className={styles.socialLinks}>
          <a
            href={SOCIAL_LINKS.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Website"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </a>
          <a
            href={SOCIAL_LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Discord"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
          <a
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Twitter"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={SOCIAL_LINKS.docs}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Documentation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Right Section: Controls and Status */}
      <div className={styles.headerRight}>
        <div className={styles.controls}>
          {/* Divider */}
          <div className={styles.divider}></div>

          {/* Palette Cycle Button */}
          <button
            onClick={onPaletteCycle}
            className={styles.controlButton}
            title="Cycle Color Palette"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
            <span>PALETTE</span>
          </button>

          {/* Theme Cycle Button */}
          <button
            onClick={onThemeCycle}
            className={styles.controlButton}
            title="Cycle Theme"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
            </svg>
            <span>CYCLE</span>
          </button>

          {/* Light/Dark Toggle Button */}
          <button
            onClick={onLightDarkToggle}
            className={styles.controlButton}
            title="Toggle Light/Dark Mode"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z" />
            </svg>
            <span>LIGHT</span>
          </button>

          {/* Dashboard Toggle Button */}
          <button
            onClick={onDashboardToggle}
            className={styles.controlButton}
            title="Toggle Dashboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span>DASHBOARD</span>
          </button>
        </div>

        {/* AI Provider Selector */}
        <span className={styles.aiLabel}>AI:</span>
        <select
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

        {/* Connection Status */}
        <div
          className={`${styles.connectionStatus} ${
            connectionStatus === "connected"
              ? styles.connected
              : connectionStatus === "connecting"
              ? styles.connecting
              : styles.disconnected
          }`}
        >
          {connectionStatus === "connected" && walletAddress
            ? walletAddress
            : connectionStatus.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
