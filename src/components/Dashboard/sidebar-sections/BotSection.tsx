"use client";

import { useCallback } from "react";
import { useTerminal } from "@/providers/TerminalProvider";
import styles from "../DashboardSidebar.module.css";

/**
 * Bot Section - Bot marketplace and management
 * Currently shows "coming soon" placeholders
 */
export function BotSection(): JSX.Element {
  const { executeCommand } = useTerminal();

  const handleCommand = useCallback(
    (command: string) => {
      void executeCommand(command);
    },
    [executeCommand]
  );

  return (
    <div className={styles.sectionContent}>
      {/* Coming Soon Notice */}
      <div
        style={{
          padding: "12px",
          marginBottom: "12px",
          background: "rgba(255, 193, 7, 0.1)",
          border: "1px solid rgba(255, 193, 7, 0.3)",
          borderRadius: "8px",
          fontSize: "0.85em",
          color: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            style={{ width: "16px", height: "16px", fill: "currentColor" }}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5V18H13V16.5H11M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12H10A2,2 0 0,1 12,10A2,2 0 0,1 14,12C14,14 11,13.75 11,17H13C13,14.75 16,14.5 16,12A4,4 0 0,0 12,8Z" />
          </svg>
          <span>Bot marketplace features are coming soon! Commands are available for preview.</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.subSectionHeader}>
        <span>Quick Actions</span>
      </div>

      <button
        className={styles.subButton}
        onClick={() => handleCommand("bot list")}
      >
        <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M9,5V9H21V5H9M9,19H21V15H9V19M3,5H7V9H3V5M3,19H7V15H3V19M3,13H7V11H3V13M9,13H21V11H9V13Z" />
        </svg>
        <span>→ Browse Bots</span>
      </button>

      <button
        className={styles.subButton}
        onClick={() => handleCommand("bot categories")}
      >
        <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />
        </svg>
        <span>→ View Categories</span>
      </button>

      <button
        className={styles.subButton}
        onClick={() => handleCommand("bot search trading")}
      >
        <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
        </svg>
        <span>→ Search Bots</span>
      </button>

      <button
        className={styles.subButton}
        onClick={() => handleCommand("bot status")}
      >
        <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
        </svg>
        <span>→ Bot Status</span>
      </button>

      <button
        className={styles.subButton}
        onClick={() => handleCommand("bot help")}
      >
        <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
        </svg>
        <span>→ Bot Help</span>
      </button>

      {/* Bot Categories */}
      <div
        style={{
          borderTop: "1px solid rgba(0, 212, 255, 0.2)",
          margin: "12px 0",
          paddingTop: "8px",
        }}
      />
      <div className={styles.subSectionHeader}>
        <span>Bot Categories</span>
      </div>

      <details className={styles.expandable}>
        <summary className={styles.expandableButton} style={{ fontSize: "0.9em" }}>
          <svg className={styles.buttonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z" />
          </svg>
          <span>Trading Bots</span>
          <svg className={styles.expandIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("bot list trading")}
          >
            <span>→ View Trading Bots</span>
          </button>
        </div>
      </details>

      <details className={styles.expandable}>
        <summary className={styles.expandableButton} style={{ fontSize: "0.9em" }}>
          <svg className={styles.buttonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
          </svg>
          <span>Scalping Bots</span>
          <svg className={styles.expandIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("bot list scalping")}
          >
            <span>→ View Scalping Bots</span>
          </button>
        </div>
      </details>

      <details className={styles.expandable}>
        <summary className={styles.expandableButton} style={{ fontSize: "0.9em" }}>
          <svg className={styles.buttonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z" />
          </svg>
          <span>Telegram Bots</span>
          <svg className={styles.expandIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("bot list telegram")}
          >
            <span>→ View Telegram Bots</span>
          </button>
        </div>
      </details>

      <details className={styles.expandable}>
        <summary className={styles.expandableButton} style={{ fontSize: "0.9em" }}>
          <svg className={styles.buttonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M20.317,4.3698a19.7913,19.7913,0,0,0-4.8851-1.5152.0741.0741,0,0,0-.0785.0371c-.211.3753-.4447.8648-.6083,1.2495-1.8447-.2762-3.68-.2762-5.4868,0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077,0,0,0-.0785-.037,19.7363,19.7363,0,0,0-4.8852,1.515.0699.0699,0,0,0-.0321.0277C.5334,9.0458-.319,13.5799.0992,18.0578a.0824.0824,0,0,0,.0312.0561c2.0528,1.5076,4.0413,2.4228,5.9929,3.0294a.0777.0777,0,0,0,.0842-.0276c.4616-.6304.8731-1.2952,1.226-1.9942a.076.076,0,0,0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077,0,0,1-.0076-.1277c.1258-.0943.2518-.1913.3718-.2894a.0743.0743,0,0,1 .0776-.0105c3.9278,1.7933,8.18,1.7933,12.0614,0a.0739.0739,0,0,1 .0785.0095c.1202.0976.246.195.3728.2894a.077.077,0,0,1-.0066.1276c-.5979.3428-1.2194.6447-1.8722.8923a.076.076,0,0,0-.0416.1057c.3604.698.7719,1.3628,1.2256,1.9932a.076.076,0,0,0 .0842.0286c1.961-.6067,3.9495-1.5219,6.0023-3.0294a.077.077,0,0,0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604A.061.061,0,0,0,20.317,4.3698ZM8.02,15.3312c-1.1825,0-2.1569-1.0857-2.1569-2.419,0-1.3332.9555-2.4189,2.157-2.4189,1.2108,0,2.1757,1.0952,2.1568,2.419-.0002,1.3332-.9555,2.4189-2.1569,2.4189Zm7.9748,0c-1.1825,0-2.1569-1.0857-2.1569-2.419,0-1.3332.9554-2.4189,2.1569-2.4189,1.2108,0,2.1757,1.0952,2.1568,2.419,0,1.3332-.9555,2.4189-2.1568,2.4189Z" />
          </svg>
          <span>Discord Bots</span>
          <svg className={styles.expandIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("bot list discord")}
          >
            <span>→ View Discord Bots</span>
          </button>
        </div>
      </details>

      <details className={styles.expandable}>
        <summary className={styles.expandableButton} style={{ fontSize: "0.9em" }}>
          <svg className={styles.buttonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z" />
          </svg>
          <span>Prediction Market Bots</span>
          <svg className={styles.expandIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("bot list prediction-market")}
          >
            <span>→ View Prediction Bots</span>
          </button>
        </div>
      </details>

      {/* Popular Bots Preview */}
      <div
        style={{
          borderTop: "1px solid rgba(0, 212, 255, 0.2)",
          margin: "12px 0",
          paddingTop: "8px",
        }}
      />
      <div className={styles.subSectionHeader}>
        <span>Popular Bots</span>
      </div>
      <button
        className={styles.subButton}
        style={{ fontSize: "0.85em", color: "rgba(255,255,255,0.7)" }}
        disabled
      >
        <span>DCA Bot • Grid Trading • Price Tracker</span>
      </button>
      <button
        className={styles.subButton}
        style={{ fontSize: "0.85em", color: "rgba(255,255,255,0.7)" }}
        disabled
      >
        <span>DeFi Analytics • NFT Tracker • Polymarket</span>
      </button>
    </div>
  );
}

export default BotSection;


