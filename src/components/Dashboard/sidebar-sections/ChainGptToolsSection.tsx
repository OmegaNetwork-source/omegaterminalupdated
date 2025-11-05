"use client";

import { useCallback } from "react";
import { useTerminal } from "@/providers/TerminalProvider";
import styles from "../DashboardSidebar.module.css";

/**
 * ChainGPT Tools Section - AI-powered Web3 tools
 * Matches vanilla js/futuristic/futuristic-dashboard-transform.js chaingpt-tools section
 */
export function ChainGptToolsSection(): JSX.Element {
  const { executeCommand } = useTerminal();

  const handleCommand = useCallback(
    (command: string) => {
      void executeCommand(command);
    },
    [executeCommand]
  );

  return (
    <div className={styles.sectionContent}>
      {/* ChainGPT Chat */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" />
          </svg>
          <span>ChainGPT Chat</span>
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
            onClick={() => handleCommand("chat init")}
          >
            <span>→ 🔑 Custom API Key</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chat ask")}
          >
            <span>→ 💬 Ask Question</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chat stream")}
          >
            <span>→ 🌊 Stream Response</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chat context")}
          >
            <span>→ 🎯 With Context</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chat history")}
          >
            <span>→ 🧠 With Memory</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chat test")}
          >
            <span>→ 🧪 Test API</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("chat help")}
          >
            <span>→ ❓ Chat Help</span>
          </button>
        </div>
      </details>

      {/* NFT Generator */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
          </svg>
          <span>NFT Generator</span>
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
            onClick={() => handleCommand("nftgen init")}
          >
            <span>→ 🔑 Custom API Key</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nftgen generate")}
          >
            <span>→ 🎨 Generate AI NFT</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nftgen models")}
          >
            <span>→ 🤖 AI Models</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nftgen styles")}
          >
            <span>→ 🎭 Art Styles</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nftgen enhance")}
          >
            <span>→ ✨ Enhance Prompt</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nftgen gallery")}
          >
            <span>→ 🖼️ View Gallery</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nftgen test")}
          >
            <span>→ 🧪 Test API</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("opensea trending")}
          >
            <span>→ 📊 Trending NFTs</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nftgen help")}
          >
            <span>→ ❓ NFT Help</span>
          </button>
        </div>
      </details>

      {/* Smart Contract Creator */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <span>Smart Contract Creator</span>
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
            onClick={() => handleCommand("contract init")}
          >
            <span>→ 🔑 Custom API Key</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("contract generate")}
          >
            <span>→ 📜 Generate Contract</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("contract templates")}
          >
            <span>→ 📋 Templates</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("contract chains")}
          >
            <span>→ ⛓️ Supported Chains</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("contract templates")}
          >
            <span>→ 🏗️ Contract Templates</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("contract test")}
          >
            <span>→ 🧪 Test API</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("contract help")}
          >
            <span>→ ❓ Creator Help</span>
          </button>
        </div>
      </details>

      {/* Smart Contract Auditor */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
          </svg>
          <span>Smart Contract Auditor</span>
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
            onClick={() => handleCommand("auditor init")}
          >
            <span>→ 🔑 Custom API Key</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("auditor audit")}
          >
            <span>→ 🔍 Audit Contract</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("auditor severity")}
          >
            <span>→ ⚠️ Severity Levels</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("auditor categories")}
          >
            <span>→ 🛡️ Security Categories</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("auditor test")}
          >
            <span>→ 🧪 Test API</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("auditor help")}
          >
            <span>→ ❓ Auditor Help</span>
          </button>
        </div>
      </details>
    </div>
  );
}

export default ChainGptToolsSection;
