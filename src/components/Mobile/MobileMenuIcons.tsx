/**
 * SVG Icon Components for Mobile Menu
 * Replaces emojis with theme-aware SVG icons
 */

import React from "react";

interface IconProps {
  className?: string;
}

export const TerminalIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2M4,4V20H20V4H4M6,6H18V8H6V6M6,10H18V12H6V10M6,14H16V16H6V14Z" />
  </svg>
);

export const DashboardIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M3,13H11V3H3M3,21H11V15H3M13,21H21V11H13M13,3V9H21V3H13Z" />
  </svg>
);

export const GamesIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4H19A2,2 0 0,1 21,6M5,6V18H19V6H5M8.5,8.5H10.5V10.5H12.5V12.5H10.5V14.5H8.5V12.5H6.5V10.5H8.5V8.5M15.5,9.5H17.5V11.5H15.5V9.5M15.5,13.5H17.5V15.5H15.5V13.5Z" />
  </svg>
);

export const NFTIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
  </svg>
);

export const MediaIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
  </svg>
);

export const SpotifyIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.5,15.5C16.3,15.7 16,15.7 15.8,15.5L15.5,15.2C15.3,15 15.3,14.7 15.5,14.5C17.2,13.1 18.2,11.1 18.2,9C18.2,6.9 17.2,4.9 15.5,3.5C15.3,3.3 15.3,3 15.5,2.8L15.8,2.5C16,2.3 16.3,2.3 16.5,2.5C18.5,4.2 19.7,6.5 19.7,9C19.7,11.5 18.5,13.8 16.5,15.5M13.5,13.5C13.3,13.7 13,13.7 12.8,13.5L12.5,13.2C12.3,13 12.3,12.7 12.5,12.5C13.5,11.8 14.2,10.5 14.2,9C14.2,7.5 13.5,6.2 12.5,5.5C12.3,5.3 12.3,5 12.5,4.8L12.8,4.5C13,4.3 13.3,4.3 13.5,4.5C14.8,5.5 15.7,7.1 15.7,9C15.7,10.9 14.8,12.5 13.5,13.5M10.5,11.5C10.3,11.7 10,11.7 9.8,11.5L9.5,11.2C9.3,11 9.3,10.7 9.5,10.5C9.8,10.3 10,10 10,9.5C10,9 9.8,8.7 9.5,8.5C9.3,8.3 9.3,8 9.5,7.8L9.8,7.5C10,7.3 10.3,7.3 10.5,7.5C11.2,8 11.5,8.7 11.5,9.5C11.5,10.3 11.2,11 10.5,11.5Z" />
  </svg>
);

export const YouTubeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
  </svg>
);

export const NewsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4M20,18H4V8H20V18M20,6H4V4H20V6M5,14H11V16H5V14M5,10H15V12H5V10M5,13H15V15H5V13Z" />
  </svg>
);

export const ChartIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
  </svg>
);

export const PerpsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z" />
  </svg>
);

export const WalletIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16V8H21V16H12Z" />
  </svg>
);

export const MiningIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
  </svg>
);

export const ThemeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,3C7.03,3 3,7.03 3,12C3,16.97 7.03,21 12,21C16.97,21 21,16.97 21,12C21,7.03 16.97,3 12,3M12,19C8.13,19 5,15.87 5,12C5,8.13 8.13,5 12,5C15.87,5 19,8.13 19,12C19,15.87 15.87,19 12,19M12,17C14.76,17 17,14.76 17,12C17,9.24 14.76,7 12,7C9.24,7 7,9.24 7,12C7,14.76 9.24,17 12,17Z" />
  </svg>
);

export const PaletteIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.87,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z" />
  </svg>
);

export const DashboardToggleIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M3,11H11V3H3M3,21H11V13H3M13,21H21V11H13M13,3V9H21V3H13Z" />
  </svg>
);

export const AIIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" />
  </svg>
);

export const HelpIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
  </svg>
);

export const WebsiteIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.34,19.56C15.1,18.45 15.63,17.25 15.93,16H18.41C17.71,17.81 16.33,19.23 14.34,19.56M14.66,4.44C16.33,4.77 17.71,6.19 18.41,8H15.93C15.63,6.75 15.1,5.55 14.34,4.44M9.66,4.44C8.9,5.55 8.37,6.75 8.07,8H5.59C6.29,6.19 7.67,4.77 9.66,4.44M9.64,14H6.26C6.1,13.36 6,12.69 6,12C6,11.31 6.1,10.64 6.26,10H9.64C9.56,10.66 9.5,11.32 9.5,12C9.5,12.68 9.56,13.34 9.64,14M8.07,16C8.37,17.25 8.9,18.45 9.66,19.56C7.67,19.23 6.29,17.81 5.59,16H8.07M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" />
  </svg>
);

export const DiscordIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317,4.37a19.791,19.791 0 0,0-4.885-1.515a.074.074 0 0,0-.079.037c-.21.375-.444.864-.608,1.25a18.27,18.27 0 0,0-5.487,0a12.64,12.64 0 0,0-.617-1.25a.077.077 0 0,0-.079-.037A19.736,19.736 0 0,0 3.677,4.37a.07.07 0 0,0-.032.027C.533,9.046-.32,13.58.099,18.057a.082.082 0 0,0 .031.057a19.9,19.9 0 0,0 5.993,3.03a.078.078 0 0,0 .084-.028a14.09,14.09 0 0,0 1.226-1.994a.076.076 0 0,0-.041-.106a13.107,13.107 0 0,1-1.872-.892a.077.077 0 0,1-.008-.128a10.2,10.2 0 0,0 .372-.292a.074.074 0 0,1 .077-.01c3.928,1.793 8.18,1.793 12.062,0a.074.074 0 0,1 .078.01c.12.098.246.198.373.292a.077.077 0 0,1-.006.127a12.299,12.299 0 0,1-1.873.892a.077.077 0 0,0-.041.107c.36.698.772,1.362 1.225,1.993a.076.076 0 0,0 .084.028a19.839,19.839 0 0,0 6.002-3.03a.077.077 0 0,0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0,0-.031-.03Z" />
  </svg>
);

export const TwitterIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244,2.25h3.308l-7.227,8.26 8.502,11.24H16.17l-5.214-6.817L4.99,21.75H1.68l7.73-8.835L1.254,2.25H8.08l4.713,6.231zm-1.161,17.52h1.833L7.084,4.126H5.117z" />
  </svg>
);

export const DocsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14,2H6C4.9,2 4,2.9 4,4V20C4,21.1 4.89,22 5.99,22H18C19.1,22 20,21.1 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
  </svg>
);

export const ConnectedIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
  </svg>
);

export const DisconnectedIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M13,17H11V15H13V17M13,13H11V7H13V13Z" />
  </svg>
);

// Icon mapping function
export function getMenuIcon(id: string, className?: string, isConnected?: boolean): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    terminal: <TerminalIcon className={className} />,
    dashboard: <DashboardIcon className={className} />,
    games: <GamesIcon className={className} />,
    nft: <NFTIcon className={className} />,
    media: <MediaIcon className={className} />,
    spotify: <SpotifyIcon className={className} />,
    youtube: <YouTubeIcon className={className} />,
    news: <NewsIcon className={className} />,
    chart: <ChartIcon className={className} />,
    perps: <PerpsIcon className={className} />,
    wallet: <WalletIcon className={className} />,
    mining: <MiningIcon className={className} />,
    theme: <ThemeIcon className={className} />,
    palette: <PaletteIcon className={className} />,
    "dashboard-toggle": <DashboardToggleIcon className={className} />,
    ai: <AIIcon className={className} />,
    help: <HelpIcon className={className} />,
    website: <WebsiteIcon className={className} />,
    discord: <DiscordIcon className={className} />,
    twitter: <TwitterIcon className={className} />,
    docs: <DocsIcon className={className} />,
    connection: isConnected ? (
      <ConnectedIcon className={className} />
    ) : (
      <DisconnectedIcon className={className} />
    ),
  };

  return iconMap[id] || null;
}

