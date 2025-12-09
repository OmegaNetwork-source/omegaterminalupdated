/**
 * useWallet Hook
 *
 * Custom React hook for accessing wallet context functionality.
 * Must be used within a WalletProvider component.
 *
 * Provides access to:
 * - Wallet state (type, address, isConnected, balance, etc.)
 * - Connection methods (connectMetaMask, createSessionWallet, importSessionWallet)
 * - Wallet operations (disconnect, getBalance, getSigner, getProvider)
 * - Network management (addOmegaNetwork)
 *
 * Usage:
 * ```typescript
 * import { useWallet } from '@/hooks/useWallet';
 *
 * function MyComponent() {
 *   const { state, connectMetaMask, disconnect } = useWallet();
 *
 *   return (
 *     <div>
 *       {state.isConnected ? (
 *         <>
 *           <p>Connected: {state.address}</p>
 *           <p>Balance: {state.balance} OMEGA</p>
 *           <button onClick={disconnect}>Disconnect</button>
 *         </>
 *       ) : (
 *         <button onClick={connectMetaMask}>Connect MetaMask</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import { useContext } from "react";
import { WalletContext } from "@/providers/WalletProvider";
import { WalletContextValue } from "@/types/wallet";

/**
 * Access wallet context
 *
 * @returns Wallet context value with state and methods
 * @throws Error if used outside WalletProvider
 */
export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  return context;
}
