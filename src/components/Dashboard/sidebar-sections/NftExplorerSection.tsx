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
      {/* Create NFTs */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
          </svg>
          <span>Create NFTs</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft mint")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
            </svg>
            <span>→ Create & Mint NFT</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("omega mint")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
            </svg>
            <span>→ Create on Omega Network</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("eth nft deploy")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Deploy on Ethereum</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft generate")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
            <span>→ Generate AI NFT</span>
          </button>
        </div>
      </details>

      {/* Mint NFTs */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          <span>Mint NFTs</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft mint")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            <span>→ Mint Single NFT</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("omega mint")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            <span>→ Mint on Omega</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("eth nft mint")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            <span>→ Mint on Ethereum</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("omega collection")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
            </svg>
            <span>→ Batch Mint Collection</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("omega view")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
            </svg>
            <span>→ View Minted NFTs</span>
          </button>
        </div>
      </details>

      {/* Create Collections */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
          </svg>
          <span>Create Collections</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("omega collection")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
            </svg>
            <span>→ Create Collection</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("eth nft deploy")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span>→ Deploy ERC-721 Collection</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("omega contract")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>→ View Collection Contract</span>
          </button>
      <button
            className={styles.subButton}
            onClick={() => handleCommand("nft collection")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
            </svg>
            <span>→ Manage Collections</span>
          </button>
        </div>
      </details>

      {/* Find Collections */}
      <details className={styles.expandable}>
        <summary className={styles.expandableButton}>
        <svg
          className={styles.buttonIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
        >
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <span>Find Collections</span>
          <svg
            className={styles.expandIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </summary>
        <div className={styles.subActions}>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft search")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
            <span>→ Search Collections</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft collection")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
            </svg>
            <span>→ View Collection</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft trending")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            <span>→ Trending Collections</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft analytics")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
            </svg>
            <span>→ Collection Analytics</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft floor")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
            </svg>
            <span>→ Floor Prices</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("eth collections")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H21V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" />
            </svg>
            <span>→ Top Collections</span>
          </button>
          <button
            className={styles.subButton}
            onClick={() => handleCommand("nft assets")}
          >
            <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
        </svg>
            <span>→ Browse Assets</span>
      </button>
        </div>
      </details>
    </div>
  );
}

export default NftExplorerSection;
