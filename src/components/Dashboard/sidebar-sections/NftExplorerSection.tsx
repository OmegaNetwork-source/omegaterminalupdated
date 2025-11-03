"use client";

import { useCallback } from "react";
import { useTerminal } from "@/providers/TerminalProvider";
import styles from "../DashboardSidebar.module.css";

/**
 * NFT Explorer Section - NFT marketplace integration
 * Matches vanilla js/futuristic/futuristic-dashboard-transform.js nft-explorer section
 */
export function NftExplorerSection(): JSX.Element {
  const { executeCommand } = useTerminal();

  const handleCommand = useCallback(
    (command: string) => {
      void executeCommand(command);
    },
    [executeCommand]
  );

  return (
    <div className={styles.sectionContent}>
      {/* Solana NFTs (Magic Eden) */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21.71,8.71C22.68,7.74 23.5,6.67 24,5.5C22.8,5.56 21.65,6.03 20.68,6.79C19.69,7.56 18.9,8.58 18.4,9.75C17.9,10.92 17.7,12.19 17.84,13.44C18,14.69 18.5,15.87 19.27,16.87C18.32,17.78 17.18,18.46 15.95,18.87C14.72,19.27 13.42,19.39 12.15,19.21C10.88,19.03 9.67,18.56 8.63,17.84C7.6,17.12 6.74,16.16 6.13,15.06C6.53,15.93 7.11,16.7 7.81,17.33C8.5,17.95 9.31,18.42 10.18,18.72C11.05,19.03 11.97,19.16 12.89,19.11C13.8,19.06 14.7,18.83 15.53,18.44C16.36,18.05 17.09,17.5 17.69,16.84C18.29,16.17 18.76,15.4 19.06,14.56C19.37,13.72 19.51,12.83 19.47,11.94C19.44,11.05 19.22,10.18 18.84,9.38L18.85,9.35C19.19,8.94 19.57,8.56 20,8.22C20.65,7.73 21.17,8.21 21.71,8.71M12,2C10.69,2 9.39,2.3 8.18,2.86C6.97,3.42 5.88,4.23 4.95,5.22C3.03,7.2 2,9.88 2,12.67C2,15.47 3.03,18.15 4.95,20.13C5.88,21.12 6.97,21.93 8.18,22.49C9.39,23.05 10.69,23.35 12,23.35C14.78,23.35 17.43,22.25 19.39,20.26C21.35,18.27 22.42,15.56 22.42,12.72C22.42,9.88 21.35,7.17 19.39,5.18C17.43,3.19 14.78,2.09 12,2.09V2M12,4C14.12,4 16.16,4.84 17.66,6.36C19.16,7.89 20,9.96 20,12.11C20,14.27 19.16,16.34 17.66,17.86C16.16,19.39 14.12,20.23 12,20.23C9.88,20.23 7.84,19.39 6.34,17.86C4.84,16.34 4,14.27 4,12.11C4,9.96 4.84,7.89 6.34,6.36C7.84,4.84 9.88,4 12,4Z" />
          </svg>
          <span>Solana NFTs</span>
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
            onClick={() => handleCommand("magiceden view")}
          >
            <span>→ 🖼️ View Collection</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("magiceden trending 7d")}
          >
            <span>→ 🔥 Trending NFTs</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("magiceden activities")}
          >
            <span>→ 📊 Collection Activity</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("magiceden stats")}
          >
            <span>→ 📈 Collection Stats</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("magiceden listings")}
          >
            <span>→ 🏷️ Listings</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("magiceden holders")}
          >
            <span>→ 👥 Holder Stats</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("magiceden attributes")}
          >
            <span>→ 🎨 Attributes</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("magiceden help")}
          >
            <span>→ ❓ Magic Eden Help</span>
          </button>
        </div>
      </details>

      {/* EVM NFTs (Coming Soon) */}
      <button
        className={styles.button}
        style={{ opacity: 0.5, cursor: "not-allowed" }}
        disabled
      >
        <svg
          className={styles.buttonIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6C8.69,6 6,8.69 6,12C6,15.31 8.69,18 12,18C15.31,18 18,15.31 18,12C18,8.69 15.31,6 12,6Z" />
        </svg>
        <span>EVM (Coming Soon)</span>
      </button>
    </div>
  );
}

export default NftExplorerSection;
