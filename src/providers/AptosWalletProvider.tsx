'use client';

/**
 * Aptos Wallet Provider Component
 *
 * Provides Aptos wallet adapter context to the entire application.
 * Wraps the app with AptosWalletAdapterProvider from @aptos-labs/wallet-adapter-react.
 *
 * IMPORTANT: Must include 'use client' directive at the top for Next.js client components.
 *
 * Usage:
 * ```tsx
 * <AptosWalletProvider>
 *   <YourApp />
 * </AptosWalletProvider>
 * ```
 */

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { Network, AptosConfig } from '@aptos-labs/ts-sdk';
import React from 'react';

const APTOS_CONFIG = new AptosConfig({ network: Network.MAINNET });

export function AptosWalletProvider({ children }: { children: React.ReactNode }) {
  // Add other wallets to this array if desired
  const wallets = [new PetraWallet()];

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={false}
      network={Network.MAINNET} // Explicit network
      aptosConfig={APTOS_CONFIG}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

