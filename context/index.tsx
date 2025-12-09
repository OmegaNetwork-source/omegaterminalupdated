// context/index.tsx
"use client";

import React, { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
// Import config, networks, projectId, and wagmiAdapter from your config file
import { config, networks, projectId, wagmiAdapter } from "../config";
// Import the default network separately if needed
import { mainnet } from "@reown/appkit/networks";
import { useMobileDetection } from "../src/hooks/useMobileDetection";

const queryClient = new QueryClient();

const metadata = {
  name: "Omega Terminal",
  description: "Advanced Web3 Terminal with AI Integration",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://omega-terminal.com",
  icons: ["https://omega-terminal.com/favicon.ico"],
};

// Initialize AppKit conditionally for mobile only
let appKitInstance: ReturnType<typeof createAppKit> | null = null;

export { appKitInstance };

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null; // Cookies from server for hydration
}) {
  const { isMobile } = useMobileDetection();

  useEffect(() => {
    if (isMobile && !appKitInstance) {
      if (!projectId) {
        console.error("AppKit Initialization Error: Project ID is missing.");
      } else {
        appKitInstance = createAppKit({
          adapters: [wagmiAdapter],
          projectId: projectId!,
          networks: networks,
          defaultNetwork: mainnet,
          metadata,
          features: { analytics: true },
        });
      }
    }
  }, [isMobile]);

  // Calculate initial state for Wagmi SSR hydration
  const initialState = cookieToInitialState(config as Config, cookies);

  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
