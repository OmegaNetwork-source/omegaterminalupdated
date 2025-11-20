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
      {/* Omega Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-omega");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all Omega Network commands"
        >
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
          {/* Network Commands Subsection */}
          <div className={styles.subSectionHeader}>
            <span>Network Commands</span>
          </div>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("connect")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("faucet")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M8.5,8.5C8.5,8.5 11,3 11,3C11,3 13.5,8.5 13.5,8.5C13.5,8.5 18,8.5 18,8.5C18,8.5 13.5,10 13.5,10C13.5,10 13.5,15.5 13.5,15.5C13.5,15.5 11,13 11,13C11,13 8.5,15.5 8.5,15.5C8.5,15.5 8.5,10 8.5,10C8.5,10 4,8.5 4,8.5C4,8.5 8.5,8.5 8.5,8.5Z" />
            </svg>
            <span>→ Claim Faucet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("mine")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
            </svg>
            <span>→ Start Mining</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("claim")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" />
            </svg>
            <span>→ Claim Rewards</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("create")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H14V10H12V11H15A1,1 0 0,1 16,12V16A1,1 0 0,1 15,17H11Z" />
            </svg>
            <span>→ Create Token</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft mint")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
            </svg>
            <span>→ Mint NFT</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ens register")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Register ENS</span>
          </button>

          {/* Ambassador Program Subsection */}
          <div className={styles.subSectionHeader}>
            <span>Ambassador Program</span>
          </div>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral create")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Create Referral Code</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral stats")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
            </svg>
            <span>→ View Stats</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral leaderboard")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,8H9V16H7V8M11,10H13V16H11V10M15,12H17V16H15V12M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z" />
            </svg>
            <span>→ Leaderboard</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral share twitter")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
            </svg>
            <span>→ Share on Twitter</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral share discord")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M20.317,4.3698a19.7913,19.7913,0,0,0-4.8851-1.5152.0741.0741,0,0,0-.0785.0371c-.211.3753-.4447.8648-.6083,1.2495-1.8447-.2762-3.68-.2762-5.4868,0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077,0,0,0-.0785-.037,19.7363,19.7363,0,0,0-4.8852,1.515.0699.0699,0,0,0-.0321.0277C.5334,9.0458-.319,13.5799.0992,18.0578a.0824.0824,0,0,0,.0312.0561c2.0528,1.5076,4.0413,2.4228,5.9929,3.0294a.0777.0777,0,0,0,.0842-.0276c.4616-.6304.8731-1.2952,1.226-1.9942a.076.076,0,0,0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077,0,0,1-.0076-.1277c.1258-.0943.2518-.1913.3718-.2894a.0743.0743,0,0,1 .0776-.0105c3.9278,1.7933,8.18,1.7933,12.0614,0a.0739.0739,0,0,1 .0785.0095c.1202.0976.246.195.3728.2894a.077.077,0,0,1-.0066.1276c-.5979.3428-1.2194.6447-1.8722.8923a.076.076,0,0,0-.0416.1057c.3604.698.7719,1.3628,1.2256,1.9932a.076.076,0,0,0 .0842.0286c1.961-.6067,3.9495-1.5219,6.0023-3.0294a.077.077,0,0,0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604A.061.061,0,0,0,20.317,4.3698ZM8.02,15.3312c-1.1825,0-2.1569-1.0857-2.1569-2.419,0-1.3332.9555-2.4189,2.157-2.4189,1.2108,0,2.1757,1.0952,2.1568,2.419-.0002,1.3332-.9555,2.4189-2.1569,2.4189Zm7.9748,0c-1.1825,0-2.1569-1.0857-2.1569-2.419,0-1.3332.9554-2.4189,2.1569-2.4189,1.2108,0,2.1757,1.0952,2.1568,2.419,0,1.3332-.9555,2.4189-2.1568,2.4189Z" />
            </svg>
            <span>→ Share on Discord</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("referral dashboard")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
            </svg>
            <span>→ Open Dashboard</span>
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
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Omega Network</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() =>
              window.open("https://discord.com/invite/omeganetwork", "_blank")
            }
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M20.317,4.3698a19.7913,19.7913,0,0,0-4.8851-1.5152.0741.0741,0,0,0-.0785.0371c-.211.3753-.4447.8648-.6083,1.2495-1.8447-.2762-3.68-.2762-5.4868,0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077,0,0,0-.0785-.037,19.7363,19.7363,0,0,0-4.8852,1.515.0699.0699,0,0,0-.0321.0277C.5334,9.0458-.319,13.5799.0992,18.0578a.0824.0824,0,0,0,.0312.0561c2.0528,1.5076,4.0413,2.4228,5.9929,3.0294a.0777.0777,0,0,0,.0842-.0276c.4616-.6304.8731-1.2952,1.226-1.9942a.076.076,0,0,0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077,0,0,1-.0076-.1277c.1258-.0943.2518-.1913.3718-.2894a.0743.0743,0,0,1 .0776-.0105c3.9278,1.7933,8.18,1.7933,12.0614,0a.0739.0739,0,0,1 .0785.0095c.1202.0976.246.195.3728.2894a.077.077,0,0,1-.0066.1276c-.5979.3428-1.2194.6447-1.8722.8923a.076.076,0,0,0-.0416.1057c.3604.698.7719,1.3628,1.2256,1.9932a.076.076,0,0,0 .0842.0286c1.961-.6067,3.9495-1.5219,6.0023-3.0294a.077.077,0,0,0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604A.061.061,0,0,0,20.317,4.3698ZM8.02,15.3312c-1.1825,0-2.1569-1.0857-2.1569-2.419,0-1.3332.9555-2.4189,2.157-2.4189,1.2108,0,2.1757,1.0952,2.1568,2.419-.0002,1.3332-.9555,2.4189-2.1569,2.4189Zm7.9748,0c-1.1825,0-2.1569-1.0857-2.1569-2.419,0-1.3332.9554-2.4189,2.1569-2.4189,1.2108,0,2.1757,1.0952,2.1568,2.419,0,1.3332-.9555,2.4189-2.1568,2.4189Z" />
            </svg>
            <span>→ Discord</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => window.open("https://x.com/omega_netw0rk", "_blank")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
            </svg>
            <span>→ X (Twitter)</span>
          </button>
        </div>
      </details>

      {/* Solana Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-solana");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all Solana commands"
        >
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
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Phantom</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("solana generate")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
            </svg>
            <span>→ Generate Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("solana status")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
            </svg>
            <span>→ Wallet Status</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("solana swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Token Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("solana search")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
            <span>→ Search Tokens</span>
          </button>
        </div>
      </details>

      {/* NEAR Protocol Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-near");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all NEAR commands"
        >
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
            onClick={() => handleCommand("connect")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect NEAR Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near disconnect")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
            </svg>
            <span>→ Disconnect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near account")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>→ Account Info</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Token Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near quote")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Get Swap Quote</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("near help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ NEAR Help</span>
          </button>
        </div>
      </details>

      {/* Ethereum Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-ethereum");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all Ethereum commands"
        >
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>Ethereum</span>
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
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ethereum balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ethereum swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Token Swap (CowSwap)</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("ethereum help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ Ethereum Help</span>
          </button>
        </div>
      </details>

      {/* Arbitrum Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-arbitrum");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all Arbitrum commands"
        >
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>Arbitrum</span>
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
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("arbitrum balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("arbitrum swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Token Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("arbitrum help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ Arbitrum Help</span>
          </button>
        </div>
      </details>

      {/* Optimism Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-optimism");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all Optimism commands"
        >
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>Optimism</span>
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
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("optimism balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("optimism swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Token Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("optimism help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ Optimism Help</span>
          </button>
        </div>
      </details>

      {/* Base Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-base");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all Base commands"
        >
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>Base</span>
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
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("base balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("base swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Token Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("base help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ Base Help</span>
          </button>
        </div>
      </details>

      {/* BNB Smart Chain Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-bnb");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all BNB commands"
        >
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>BNB Smart Chain</span>
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
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("bnb balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("bnb swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Token Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("bnb help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ BNB Help</span>
          </button>
        </div>
      </details>

      {/* Uniswap DEX Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-uniswap");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all Uniswap commands"
        >
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>🦄 Uniswap</span>
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
            onClick={() => handleCommand("uniswap ethereum swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Ethereum Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("uniswap arbitrum swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Arbitrum Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("uniswap optimism swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Optimism Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("uniswap base swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Base Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("uniswap polygon swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Polygon Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("uniswap bnb swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ BNB Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("uniswap help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ Uniswap Help</span>
          </button>
        </div>
      </details>

      {/* PancakeSwap DEX Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-pancakeswap");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all PancakeSwap commands"
        >
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>🥞 PancakeSwap</span>
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
            onClick={() => handleCommand("pancakeswap bnb swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ BNB Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("pancakeswap ethereum swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Ethereum Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("pancakeswap arbitrum swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Arbitrum Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("pancakeswap base swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Base Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("pancakeswap polygon swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Polygon Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("pancakeswap optimism swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Optimism Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("pancakeswap help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ PancakeSwap Help</span>
          </button>
        </div>
      </details>

      {/* Polygon Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-polygon");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all Polygon commands"
        >
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>Polygon</span>
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
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("polygon balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("polygon bridge")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Bridge Assets</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("polygon swap")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Token Swap</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("polygon help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ Polygon Help</span>
          </button>
        </div>
      </details>

      {/* Aptos Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-aptos");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all Aptos commands"
        >
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>Aptos</span>
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
            onClick={() => handleCommand("aptos connect")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Petra Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("aptos balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check APT Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("aptos create token")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H14V10H12V11H15A1,1 0 0,1 16,12V16A1,1 0 0,1 15,17H11Z" />
            </svg>
            <span>→ Create Token</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("aptos help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ Aptos Help</span>
          </button>
        </div>
      </details>

      {/* ROME Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-rome");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all ROME commands"
        >
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
            onClick={() => handleCommand("rome connect")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome gen-wallet")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15M12,2A10,10 0 0,1 22,12C22,17.5 17.5,22 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
            </svg>
            <span>→ Generate Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome token create")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H14V10H12V11H15A1,1 0 0,1 16,12V16A1,1 0 0,1 15,17H11Z" />
            </svg>
            <span>→ Create Token</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome nft mint")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
            </svg>
            <span>→ Mint NFT</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome ens register")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Register ENS</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome status")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
            </svg>
            <span>→ Network Status</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("rome help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ ROME Help</span>
          </button>
        </div>
      </details>

      {/* FAIR Blockchain Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-fair");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all FAIR commands"
        >
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
            onClick={() => handleCommand("fair connect")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect MetaMask</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fair generate")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15M12,2A10,10 0 0,1 22,12C22,17.5 17.5,22 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
            </svg>
            <span>→ Generate Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fair balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fair faucet")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M8.5,8.5C8.5,8.5 11,3 11,3C11,3 13.5,8.5 13.5,8.5C13.5,8.5 18,8.5 18,8.5C18,8.5 13.5,10 13.5,10C13.5,10 13.5,15.5 13.5,15.5C13.5,15.5 11,13 11,13C11,13 8.5,15.5 8.5,15.5C8.5,15.5 8.5,10 8.5,10C8.5,10 4,8.5 4,8.5C4,8.5 8.5,8.5 8.5,8.5Z" />
            </svg>
            <span>→ Claim Faucet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("create")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H14V10H12V11H15A1,1 0 0,1 16,12V16A1,1 0 0,1 15,17H11Z" />
            </svg>
            <span>→ Create Token</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft mint")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
            </svg>
            <span>→ Mint NFT</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fns register")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Register ENS</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("fair help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ FAIR Help</span>
          </button>
        </div>
      </details>

      {/* MONAD Network Subsection */}
      <details className={styles.expandable}>
        <summary 
          className={styles.expandableButton}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", "section:network-monad");
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.5";
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
            }
          }}
          style={{ cursor: "grab" }}
          title="Drag to Quick Actions to add all MONAD commands"
        >
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
            onClick={() => handleCommand("monad connect")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Connect Wallet</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad balance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Check Balance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad network")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Network Info</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad staking")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
            </svg>
            <span>→ Staking</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad governance")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9" />
            </svg>
            <span>→ Governance</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("monad help")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
            <span>→ MONAD Help</span>
          </button>
        </div>
      </details>
    </div>
  );
}

export default NetworkSection;
