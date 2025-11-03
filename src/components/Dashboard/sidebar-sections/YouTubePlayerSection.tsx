"use client";

import { useCallback } from "react";
import { useTerminal } from "@/providers/TerminalProvider";
import { useYouTube } from "@/hooks/useYouTube";
import styles from "../DashboardSidebar.module.css";

/**
 * YouTube Player Section - Complete YouTube player controls
 * Matches vanilla js/futuristic/futuristic-dashboard-transform.js youtube-player section
 */
export function YouTubePlayerSection(): JSX.Element {
  const { executeCommand } = useTerminal();
  const youtube = useYouTube();

  const handleCommand = useCallback(
    (command: string) => {
      void executeCommand(command);
    },
    [executeCommand]
  );

  return (
    <div className={styles.sectionContent}>
      {/* Main YouTube Open Button */}
      <button className={styles.button} onClick={() => youtube.openPanel()}>
        <svg
          className={styles.buttonIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
        </svg>
        <span>Open YouTube</span>
      </button>

      {/* Search Presets */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <span>Quick Search</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt search bitcoin")}
          >
            <span>→ ₿ Bitcoin Videos</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt search ethereum")}
          >
            <span>→ Ξ Ethereum Videos</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt search crypto news")}
          >
            <span>→ 📰 Crypto News</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt search web3 tutorial")}
          >
            <span>→ 📚 Web3 Tutorials</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt search")}
          >
            <span>→ 🔍 Custom Search</span>
          </button>
        </div>
      </details>

      {/* Playback Controls */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
          </svg>
          <span>Playback Controls</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt pause")}
          >
            <span>→ ⏯️ Play/Pause</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt stop")}
          >
            <span>→ ⏹️ Stop</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt next")}
          >
            <span>→ ⏭️ Next</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt prev")}
          >
            <span>→ ⏮️ Previous</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt volume up")}
          >
            <span>→ 🔊 Volume Up</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt volume down")}
          >
            <span>→ 🔉 Volume Down</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt mute")}
          >
            <span>→ 🔇 Mute</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("yt unmute")}
          >
            <span>→ 🔊 Unmute</span>
          </button>
        </div>
      </details>

      {/* Help */}
      <button
        className={styles.button}
        onClick={() => handleCommand("yt help")}
      >
        <svg
          className={styles.buttonIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
        </svg>
        <span>YouTube Help</span>
      </button>
    </div>
  );
}

export default YouTubePlayerSection;
