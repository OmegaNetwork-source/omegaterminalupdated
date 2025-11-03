"use client";

import { useCallback } from "react";
import { useTerminal } from "@/providers/TerminalProvider";
import styles from "../DashboardSidebar.module.css";

/**
 * Network Section - Complete multi-chain network management
 * Matches vanilla js/futuristic/futuristic-dashboard-transform.js network section
 */
export function NetworkSection(): JSX.Element {
  const { executeCommand } = useTerminal();

  const handleCommand = useCallback(
    (command: string) => {
      void executeCommand(command);
    },
    [executeCommand]
  );

  return (
    <div className={styles.sectionContent}>
      {/* EVM Networks Subsection */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z" />
          </svg>
          <span>EVM Networks</span>
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
            onClick={() => handleCommand("connect")}
          >
            <span>→ 🔗 Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("disconnect")}
          >
            <span>→ 🔌 Disconnect</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("balance")}
          >
            <span>→ 💰 Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("send")}
          >
            <span>→ 📤 Send Tokens</span>
          </button>
          <div
            style={{
              borderTop: "1px solid rgba(0, 212, 255, 0.2)",
              margin: "8px 0",
              paddingTop: "4px",
            }}
          />
          <button
            className={styles.subButton}
            style={{ fontSize: "0.85em", color: "rgba(255,255,255,0.7)" }}
            disabled
          >
            <span>⟠ Ethereum • 🟡 BSC • 🟣 Polygon</span>
          </button>
          <button
            className={styles.subButton}
            style={{ fontSize: "0.85em", color: "rgba(255,255,255,0.7)" }}
            disabled
          >
            <span>🔵 Arbitrum • 🔴 Optimism • 🔷 Base</span>
          </button>
        </div>
      </details>

      {/* Omega Network Subsection */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
          <span>Omega Network</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          {/* Ambassador Program Subsection */}
          <div className={styles.subSectionHeader}>
            <span>Ambassador Program</span>
          </div>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral create")}
          >
            <span>→ 🎯 Create Referral Code</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral stats")}
          >
            <span>→ 📊 View Stats</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral leaderboard")}
          >
            <span>→ 🏆 Leaderboard</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral share twitter")}
          >
            <span>→ 🐦 Share on Twitter</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral share discord")}
          >
            <span>→ 💬 Share on Discord</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral dashboard")}
          >
            <span>→ 📈 Open Dashboard</span>
          </button>

          {/* Network Tools Subsection */}
          <div className={styles.subSectionHeader}>
            <span>Network Tools</span>
          </div>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("faucet")}
          >
            <span>→ 💧 Claim Faucet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("balance")}
          >
            <span>→ 💰 Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome help")}
          >
            <span>→ 🏛️ Rome Commands</span>
          </button>

          {/* External Links Subsection */}
          <div className={styles.subSectionHeader}>
            <span>External Links</span>
          </div>
          <button
            className={styles.subButton}
            onClick={() =>
              window.open("https://omeganetwork.co/landing", "_blank")
            }
          >
            <span>→ 🌐 Omega Network</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() =>
              window.open("https://discord.com/invite/omeganetwork", "_blank")
            }
          >
            <span>→ 💬 Discord</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => window.open("https://x.com/omega_netw0rk", "_blank")}
          >
            <span>→ 🐦 X (Twitter)</span>
          </button>
        </div>
      </details>

      {/* Solana Network Subsection */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>Solana</span>
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
            onClick={() => handleCommand("solana connect")}
          >
            <span>→ 👛 Connect Phantom</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("solana generate")}
          >
            <span>→ 🔑 Generate Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("solana status")}
          >
            <span>→ 📊 Wallet Status</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("solana swap")}
          >
            <span>→ 🔄 Token Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("solana search")}
          >
            <span>→ 🔍 Search Tokens</span>
          </button>
        </div>
      </details>

      {/* NEAR Protocol Subsection */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M17,8L12,17L7,8H9.5L12,13.29L14.5,8M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11Z" />
          </svg>
          <span>NEAR Protocol</span>
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
            onClick={() => handleCommand("near connect")}
          >
            <span>→ 👛 Connect NEAR Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near disconnect")}
          >
            <span>→ 🔌 Disconnect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("balance")}
          >
            <span>→ 💰 Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near account")}
          >
            <span>→ 📋 Account Info</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near swap")}
          >
            <span>→ 🔄 Token Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near quote")}
          >
            <span>→ 💱 Get Swap Quote</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near validators")}
          >
            <span>→ ✅ View Validators</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near help")}
          >
            <span>→ ❓ NEAR Help</span>
          </button>
        </div>
      </details>

      {/* ROME Network Subsection */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>ROME Network</span>
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
            onClick={() => handleCommand("rome help")}
          >
            <span>→ ❓ ROME Help</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome token create")}
          >
            <span>→ 🪙 Create Token</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome network status")}
          >
            <span>→ 📊 Network Status</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome balance")}
          >
            <span>→ 💰 Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome transactions")}
          >
            <span>→ 📋 View Transactions</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome validators")}
          >
            <span>→ ✅ Validators</span>
          </button>
        </div>
      </details>

      {/* FAIR Blockchain Subsection */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>FAIR Blockchain</span>
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
            onClick={() => handleCommand("fair help")}
          >
            <span>→ ❓ FAIR Help</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fair generate")}
          >
            <span>→ 🔑 Generate Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fair connect")}
          >
            <span>→ 🔗 Connect MetaMask</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fair balance")}
          >
            <span>→ 💰 Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fair network")}
          >
            <span>→ 🌐 Network Info</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fair transactions")}
          >
            <span>→ 📋 View Transactions</span>
          </button>
        </div>
      </details>

      {/* MONAD Network Subsection */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>MONAD Network</span>
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
            onClick={() => handleCommand("monad help")}
          >
            <span>→ ❓ MONAD Help</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad connect")}
          >
            <span>→ 🔗 Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad balance")}
          >
            <span>→ 💰 Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad network")}
          >
            <span>→ 🌐 Network Info</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad validators")}
          >
            <span>→ ✅ Validators</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad transactions")}
          >
            <span>→ 📋 View Transactions</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad staking")}
          >
            <span>→ 🏦 Staking</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad governance")}
          >
            <span>→ 🗳️ Governance</span>
          </button>
        </div>
      </details>
    </div>
  );
}

export default NetworkSection;
