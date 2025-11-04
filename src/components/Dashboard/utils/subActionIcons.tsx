import styles from "../DashboardSidebar.module.css";

/**
 * Get SVG icon for sub-action buttons based on label text
 */
export function getSubActionIcon(label: string): JSX.Element {
  const iconMap: Record<string, JSX.Element> = {
    // AI Assistant
    "ai toggle": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" fill="currentColor" />
      </svg>
    ),
    "ai help": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" fill="currentColor" />
      </svg>
    ),
    // Cycle actions
    "cycle": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" fill="currentColor" />
      </svg>
    ),
    // News
    "bitcoin": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M17.06,11.57C17.65,10.88 18,9.98 18,9C18,7.14 16.72,5.5 15,4.69V3H13V4.5C12.5,4.5 12,4.58 11.5,4.69V3H9.5V4.69C7.78,5.5 6.5,7.14 6.5,9C6.5,9.98 6.85,10.88 7.44,11.57C6.5,12.14 6,13.14 6,14.25C6,16.08 7.28,17.72 9,18.53V20H10.5V18.47C11,18.47 11.5,18.39 12,18.28V20H13.5V18.53C15.22,17.72 16.5,16.08 16.5,14.25C16.5,13.14 16,12.14 15.06,11.57M9,7.5C9.83,7.5 10.5,8.17 10.5,9C10.5,9.83 9.83,10.5 9,10.5C8.17,10.5 7.5,9.83 7.5,9C7.5,8.17 8.17,7.5 9,7.5M15,13.75C15,14.58 14.33,15.25 13.5,15.25C12.67,15.25 12,14.58 12,13.75C12,12.92 12.67,12.25 13.5,12.25C14.33,12.25 15,12.92 15,13.75Z" fill="currentColor" />
      </svg>
    ),
    "ethereum": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M11.94,2.5L6.5,13.5L11.94,17.5L17.5,13.5L11.94,2.5M11.94,19.5L6.5,15.5L11.94,22.5L17.5,15.5L11.94,19.5Z" fill="currentColor" />
      </svg>
    ),
    "solana": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" fill="currentColor" />
      </svg>
    ),
    "search": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" fill="currentColor" />
      </svg>
    ),
    "news": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z" fill="currentColor" />
      </svg>
    ),
    "sources": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" fill="currentColor" />
      </svg>
    ),
    "expand": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M9,5V9H5V11H9V15H11V11H15V9H11V5H9M19,19H5V5H7V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V17H19V19Z" fill="currentColor" />
      </svg>
    ),
    "collapse": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M19,19H5V5H7V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V17H19V19M15,13V11H11V9H15V7H17V9H19V11H17V13H15M3,13H5V11H3V13M3,17H5V15H3V17M3,9H5V7H3V9M3,5H5V3H3V5Z" fill="currentColor" />
      </svg>
    ),
    "clear": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor" />
      </svg>
    ),
    "help": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" fill="currentColor" />
      </svg>
    ),
    // Music/Media
    "play": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="currentColor" />
      </svg>
    ),
    "pause": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M14,19H18V5H14M6,19H10V5H6V19Z" fill="currentColor" />
      </svg>
    ),
    "next": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M16,18H18V6H16M6,18L14,12L6,6V18Z" fill="currentColor" />
      </svg>
    ),
    "previous": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z" fill="currentColor" />
      </svg>
    ),
    "stop": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M18,18H6V6H18V18Z" fill="currentColor" />
      </svg>
    ),
    "volume": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.01,19.86 21,16.28 21,12C21,7.72 18.01,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z" fill="currentColor" />
      </svg>
    ),
    "mute": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z" fill="currentColor" />
      </svg>
    ),
    // Portfolio
    "track": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z" fill="currentColor" />
      </svg>
    ),
    "portfolio": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" fill="currentColor" />
      </svg>
    ),
    "list": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z" fill="currentColor" />
      </svg>
    ),
    "refresh": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" fill="currentColor" />
      </svg>
    ),
    // Reset
    "reset": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12,4C14.1,4 16.1,4.6 17.7,5.7L19.24,4.16C17.19,2.6 14.7,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22C17.5,22 22,17.5 22,12H20C20,16.4 16.4,20 12,20C7.6,20 4,16.4 4,12C4,7.6 7.6,4 12,4M12,6C8.7,6 6,8.7 6,12C6,15.3 8.7,18 12,18C15.3,18 18,15.3 18,12C18,8.7 15.3,6 12,6Z" fill="currentColor" />
      </svg>
    ),
    // YouTube specific
    "videos": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" fill="currentColor" />
      </svg>
    ),
    "tutorials": (
      <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" fill="currentColor" />
      </svg>
    ),
  };

  // Match based on label text
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("ai:") || lowerLabel.includes("ai toggle")) return iconMap["ai toggle"];
  if (lowerLabel.includes("ai help")) return iconMap["ai help"];
  if (lowerLabel.includes("cycle")) return iconMap["cycle"];
  if (lowerLabel.includes("bitcoin") || lowerLabel.includes("btc")) return iconMap["bitcoin"];
  if (lowerLabel.includes("ethereum") || lowerLabel.includes("eth")) return iconMap["ethereum"];
  if (lowerLabel.includes("solana") || lowerLabel.includes("sol")) return iconMap["solana"];
  if (lowerLabel.includes("search")) return iconMap["search"];
  if (lowerLabel.includes("news articles")) return iconMap["news"];
  if (lowerLabel.includes("sources")) return iconMap["sources"];
  if (lowerLabel.includes("expand all")) return iconMap["expand"];
  if (lowerLabel.includes("collapse all")) return iconMap["collapse"];
  if (lowerLabel.includes("clear & reload") || lowerLabel.includes("clear")) return iconMap["clear"];
  if (lowerLabel.includes("help")) return iconMap["help"];
  if (lowerLabel.includes("play/pause") || lowerLabel.includes("play")) return iconMap["play"];
  if (lowerLabel.includes("pause")) return iconMap["pause"];
  if (lowerLabel.includes("next")) return iconMap["next"];
  if (lowerLabel.includes("previous") || lowerLabel.includes("prev")) return iconMap["previous"];
  if (lowerLabel.includes("stop")) return iconMap["stop"];
  if (lowerLabel.includes("volume")) return iconMap["volume"];
  if (lowerLabel.includes("mute")) return iconMap["mute"];
  if (lowerLabel.includes("track new wallet")) return iconMap["track"];
  if (lowerLabel.includes("view portfolio")) return iconMap["portfolio"];
  if (lowerLabel.includes("list wallets")) return iconMap["list"];
  if (lowerLabel.includes("refresh")) return iconMap["refresh"];
  if (lowerLabel.includes("reset")) return iconMap["reset"];
  if (lowerLabel.includes("videos")) return iconMap["videos"];
  if (lowerLabel.includes("tutorials")) return iconMap["tutorials"];

  // Default arrow icon
  return (
    <svg className={styles.subButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" fill="currentColor" />
    </svg>
  );
}

