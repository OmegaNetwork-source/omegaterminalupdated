import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_FULL_TITLE, APP_DESCRIPTION } from "@/lib/constants";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CustomizerProvider } from "@/providers/CustomizerProvider";
import { ViewModeProvider } from "@/providers/ViewModeProvider";
import { GUIThemeProvider } from "@/providers/GUIThemeProvider";
import { SoundEffectsProvider } from "@/providers/SoundEffectsProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import { MultiChainProvider } from "@/providers/MultiChainProvider";
import { ProviderShell } from "@/providers/ProviderShell";
import { MultiNetworkConnectorHost } from "@/components/Wallet/MultiNetworkConnectorHost";
import WebVitals from "./_components/WebVitals";

/**
 * Metadata configuration for the application
 */
export const metadata: Metadata = {
  title: APP_FULL_TITLE,
  description: APP_DESCRIPTION,
  keywords: [
    "web3",
    "terminal",
    "blockchain",
    "crypto",
    "chaingpt",
    "ai",
    "nft",
    "smart-contracts",
    "omega",
    "multi-chain",
  ],
  authors: [{ name: "Omega Terminal Team" }],
  robots: "index, follow",
  openGraph: {
    title: APP_FULL_TITLE,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

/**
 * Viewport configuration
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * Root layout component for the application
 * This is a Server Component that wraps all pages
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Cache Control */}
        <meta
          httpEquiv="Cache-Control"
          content="no-cache, no-store, must-revalidate"
        />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body suppressHydrationWarning data-omega-hydrated="true">
        <WebVitals />
        <SoundEffectsProvider>
          <ThemeProvider>
            <CustomizerProvider>
              <ViewModeProvider>
                <GUIThemeProvider>
                  <WalletProvider>
                    <MultiNetworkConnectorHost />
                    <MultiChainProvider>
                      <ProviderShell>{children}</ProviderShell>
                    </MultiChainProvider>
                  </WalletProvider>
                </GUIThemeProvider>
              </ViewModeProvider>
            </CustomizerProvider>
          </ThemeProvider>
        </SoundEffectsProvider>
      </body>
    </html>
  );
}
