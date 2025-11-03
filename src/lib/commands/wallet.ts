/**
 * Wallet Commands (Phase 2)
 * Minimal wallet command implementations migrated from js/commands/wallet-commands.js
 */

import type { Command, CommandContext } from "@/types/commands";
import { isValidEthereumAddress, shortenAddress } from "@/lib/utils";
import { config } from "@/lib/config";
import { parseEther } from "ethers";
import { openNetworkSelector } from "@/lib/wallet/networkSelector";

function requireConnection(context: CommandContext): boolean {
  if (!context.wallet.state.isConnected || !context.wallet.state.address) {
    context.log("No wallet connected. Use `connect` first.", "warning");
    return false;
  }
  return true;
}

export const connectCommand: Command = {
  name: "connect",
  description: "Connect MetaMask wallet",
  category: "wallet",
  handler: async (context: CommandContext) => {
    context.log("🌐 Opening multi-network selector…", "info");
    if (typeof window === "undefined") {
      context.log(
        "Environment does not support wallet connection (SSR).",
        "error"
      );
      return;
    }

    openNetworkSelector({
      log: context.log,
      logHtml: context.logHtml,
      wallet: context.wallet,
      sound: context.sound,
      source: "command",
    });
  },
};

export const disconnectCommand: Command = {
  name: "disconnect",
  description: "Disconnect wallet",
  category: "wallet",
  handler: async (context: CommandContext) => {
    if (!context.wallet.state.isConnected) {
      context.log("No wallet connection to terminate.", "info");
      return;
    }

    await context.wallet.disconnect();
    context.log("Wallet disconnected.", "success");
  },
};

export const balanceCommand: Command = {
  name: "balance",
  description: "Show all wallet balances across all chains",
  category: "wallet",
  handler: async (context: CommandContext) => {
    context.log("💰 Checking all connected wallets...", "info");

    // Play balance sound effect if available
    if (context.sound) {
      context.sound.playWalletConnectSound().catch(() => {
        // Ignore sound errors
      });
    }

    let hasAnyWallet = false;
    const totalBalances: Array<{
      type: string;
      amount: number;
      symbol: string;
    }> = [];

    // 1. Check EVM Wallet (Works with ALL EVM networks: ETH, BNB, MATIC, etc.)
    if (context.wallet.state.isConnected && context.wallet.state.address) {
      hasAnyWallet = true;
      try {
        const balance = await context.wallet.getBalance();
        if (balance) {
          // Get network info - use chainId to determine network
          let networkName = "EVM";
          let currencySymbol = "OMEGA";

          const chainId = context.wallet.state.chainId;
          const chainIdNum =
            typeof chainId === "string" ? parseInt(chainId, 16) : chainId || 0;

          if (chainIdNum === 1) {
            networkName = "Ethereum";
            currencySymbol = "ETH";
          } else if (chainIdNum === 56) {
            networkName = "Binance Smart Chain";
            currencySymbol = "BNB";
          } else if (chainIdNum === 137) {
            networkName = "Polygon";
            currencySymbol = "MATIC";
          } else if (chainIdNum === 43114) {
            networkName = "Avalanche";
            currencySymbol = "AVAX";
          } else if (chainIdNum === 42161) {
            networkName = "Arbitrum";
            currencySymbol = "ETH";
          } else if (chainIdNum === 10) {
            networkName = "Optimism";
            currencySymbol = "ETH";
          } else if (chainIdNum === 8453) {
            networkName = "Base";
            currencySymbol = "ETH";
          } else if (chainIdNum === 324) {
            networkName = "zkSync Era";
            currencySymbol = "ETH";
          }

          const balanceNum = parseFloat(balance);
          context.log(
            `💰 ${networkName} Wallet Balance: ${balanceNum.toFixed(
              4
            )} ${currencySymbol}`,
            "success"
          );
          totalBalances.push({
            type: networkName,
            amount: balanceNum,
            symbol: currencySymbol,
          });
        }
      } catch (error) {
        context.log(
          `Failed to get EVM balance: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "error"
        );
      }
    }

    // 2. Check Solana Wallet
    if (
      context.multichain?.solana.state.connected &&
      context.multichain?.solana.state.publicKey
    ) {
      hasAnyWallet = true;
      try {
        const solBalance = await context.multichain.solana.getBalance(
          context.multichain.solana.state.publicKey
        );
        if (solBalance !== null) {
          context.log(
            `🟣 Solana Wallet Balance: ${solBalance.toFixed(4)} SOL`,
            "success"
          );
          totalBalances.push({
            type: "Solana",
            amount: solBalance,
            symbol: "SOL",
          });
        }
      } catch (error) {
        context.log(
          `Failed to get Solana balance: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "error"
        );
      }
    }

    // 3. Check NEAR Wallet
    if (
      context.multichain?.near.state.connected &&
      context.multichain?.near.state.accountId
    ) {
      hasAnyWallet = true;
      try {
        const nearBalance = await context.multichain.near.getBalance(
          context.multichain.near.state.accountId
        );
        if (nearBalance !== null) {
          context.log(`🔵 NEAR Wallet Balance: ${nearBalance} NEAR`, "success");
          totalBalances.push({
            type: "NEAR",
            amount: parseFloat(nearBalance),
            symbol: "NEAR",
          });
        }
      } catch (error) {
        context.log(
          `Failed to get NEAR balance: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "error"
        );
      }
    }

    // 4. Check Eclipse Wallet
    if (
      context.multichain?.eclipse.state.connected &&
      context.multichain?.eclipse.state.publicKey
    ) {
      hasAnyWallet = true;
      try {
        const eclipseBalance = await context.multichain.eclipse.getBalance(
          context.multichain.eclipse.state.publicKey
        );
        if (eclipseBalance !== null) {
          context.log(
            `🌘 Eclipse Wallet Balance: ${eclipseBalance.toFixed(4)} ETH`,
            "success"
          );
          totalBalances.push({
            type: "Eclipse",
            amount: eclipseBalance,
            symbol: "ETH",
          });
        }
      } catch (error) {
        context.log(
          `Failed to get Eclipse balance: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "error"
        );
      }
    }

    // Summary
    if (totalBalances.length > 1) {
      context.log("", "info");
      context.log(`📊 Total Wallets: ${totalBalances.length}`, "info");
      const totalValue = totalBalances.reduce((sum, b) => sum + b.amount, 0);
      context.log(
        `💎 Combined Balance: ${totalValue.toFixed(4)} tokens`,
        "info"
      );
    }

    if (!hasAnyWallet) {
      context.log("", "info");
      context.log("💡 No wallets connected", "warning");
      context.log('Use "connect" to connect a wallet', "info");
      context.log('Or use "solana connect" for Solana', "info");
      context.log('Or use "near connect" for NEAR Protocol', "info");
    }
  },
};

export const sendCommand: Command = {
  name: "send",
  description: "Send OMEGA to address",
  usage: "send <amount> <address>",
  category: "wallet",
  handler: async (context: CommandContext, args: string[]) => {
    if (!requireConnection(context)) {
      return;
    }

    if (args.length < 3 || !args[1] || !args[2]) {
      context.log("Usage: send <amount> <address>", "error");
      return;
    }

    const amountArg = args[1];
    const addressArg = args[2];

    if (!isValidEthereumAddress(addressArg)) {
      context.log(`Invalid Ethereum address: ${addressArg}`, "error");
      return;
    }

    const amount = parseFloat(amountArg);
    if (isNaN(amount) || amount <= 0) {
      context.log(`Invalid amount: ${amountArg}`, "error");
      return;
    }

    const address = addressArg.toLowerCase();

    context.log(`Sending ${amount} OMEGA to ${address}…`, "info");

    try {
      const signer = await context.wallet.getSigner();
      if (!signer) {
        context.log("Failed to obtain signer for transaction.", "error");
        return;
      }

      const tx = await signer.sendTransaction({
        to: address,
        value: parseEther(amountArg),
      });

      context.log(`Transaction sent: ${tx.hash}`, "success");
      const receipt = await tx.wait();
      context.log(
        `Transaction confirmed in block ${receipt.blockNumber ?? "unknown"}.`,
        "success"
      );
    } catch (error: any) {
      context.log(
        `Failed to send transaction: ${error?.message ?? error}`,
        "error"
      );
    }
  },
};

export const importCommand: Command = {
  name: "import",
  description: "Import session wallet via private key",
  usage: "import <private-key>",
  category: "wallet",
  handler: async (context: CommandContext, args: string[]) => {
    const privateKey = args[1];
    if (!privateKey) {
      context.log("Usage: import <private-key>", "error");
      return;
    }

    context.log("Importing session wallet…", "info");
    try {
      const success = await context.wallet.importSessionWallet(privateKey);
      if (success) {
        context.log("Session wallet imported.", "success");
        const address = context.wallet.state.address;
        if (address) {
          context.log(`Address: ${shortenAddress(address, 6)}`, "output");
        }
      } else {
        context.log(
          "Failed to import wallet. Check your private key.",
          "error"
        );
      }
    } catch (error: any) {
      context.log(`Import failed: ${error?.message ?? error}`, "error");
    }
  },
};

export const exportCommand: Command = {
  name: "export",
  description: "Show session wallet details",
  category: "wallet",
  handler: (context: CommandContext) => {
    if (!context.wallet.state.isConnected || !context.wallet.state.address) {
      context.log("No session wallet connected.", "warning");
      return;
    }

    context.log("=== Session Wallet ===", "info");
    context.log(`Address: ${context.wallet.state.address}`, "output");

    if (typeof window !== "undefined") {
      const privateKey = sessionStorage.getItem("omega-session-wallet-key");
      if (privateKey) {
        context.log(`Private Key: ${privateKey}`, "warning");
        context.log(
          "Copy this key carefully. It resets when the tab closes.",
          "info"
        );
      }
    }
  },
};

// Test Wallet Command
export const testWalletCommand: Command = {
  name: "test-wallet",
  description: "Create temporary test wallet (session only)",
  category: "wallet",
  handler: async (context: CommandContext) => {
    context.log("🧪 Creating temporary test wallet...", "info");

    try {
      const walletInfo = await context.wallet.createSessionWallet();
      if (!walletInfo) {
        context.log("Test wallet creation failed.", "error");
        return;
      }

      context.log("✅ Test wallet created!", "success");
      context.log(`Address: ${walletInfo.address}`, "output");
      context.log("", "info");
      context.log("⚠️  WARNING: This is a test wallet", "warning");
      context.log("• Private key stored in session storage only", "info");
      context.log("• Will be cleared when you close this tab", "info");
      context.log("• Do NOT use for real funds", "info");
      context.log("", "info");
      context.log(
        "💡 Use 'export' to view private key (save it if needed)",
        "info"
      );
    } catch (error: any) {
      context.log(`Test wallet error: ${error?.message ?? error}`, "error");
    }
  },
};

// Fund wallet via relayer
export const fundCommand: Command = {
  name: "fund",
  description: "Request testnet OMEGA from faucet",
  category: "wallet",
  handler: async (context: CommandContext) => {
    if (!requireConnection(context)) {
      return;
    }

    const address = context.wallet.state.address;
    if (!address) {
      context.log("No wallet address found.", "error");
      return;
    }

    context.log("💰 Requesting testnet OMEGA from faucet...", "info");
    context.log(`Sending to: ${address}`, "info");

    try {
      // Call relayer faucet endpoint
      const response = await fetch(`${context.config.RELAYER_URL}/faucet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Faucet request failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        context.log("✅ Faucet request successful!", "success");
        if (data.txHash) {
          context.log(`Transaction: ${data.txHash}`, "info");
        }
        if (data.amount) {
          context.log(`Amount: ${data.amount} OMEGA`, "info");
        }
        context.log("", "info");
        context.log("💡 Check your balance with: balance", "info");
      } else {
        context.log(
          `❌ Faucet error: ${data.error || "Unknown error"}`,
          "error"
        );
      }
    } catch (error: any) {
      context.log(`❌ Faucet request failed: ${error.message}`, "error");
    }
  },
};

// Fund wallet directly from faucet contract
export const fundDirectCommand: Command = {
  name: "fund-direct",
  description: "Request OMEGA directly from faucet contract",
  category: "wallet",
  handler: async (context: CommandContext) => {
    if (!requireConnection(context)) {
      return;
    }

    const address = context.wallet.state.address;
    if (!address) {
      context.log("No wallet address found.", "error");
      return;
    }

    context.log("💰 Requesting OMEGA from faucet contract...", "info");
    context.log(`Recipient: ${address}`, "info");

    try {
      const signer = await context.wallet.getSigner();
      if (!signer) {
        context.log("Failed to get signer.", "error");
        return;
      }

      // Get contract from context if available
      const faucetContract = context.getContract?.(
        config.FAUCET_ADDRESS,
        config.FAUCET_ABI,
        signer
      );

      if (!faucetContract) {
        context.log("Faucet contract not available.", "error");
        return;
      }

      // Check faucet balance
      const faucetBalance = await faucetContract?.getFaucetBalance?.();
      if (faucetBalance) {
        const balanceInEther = parseFloat(faucetBalance.toString()) / 1e18;
        context.log(
          `Faucet Balance: ${balanceInEther.toFixed(4)} OMEGA`,
          "info"
        );
      }

      context.log("🚀 Calling faucet contract...", "info");

      // Call requestTokens function
      const tx = await faucetContract.requestTokens();

      context.log(`✅ Transaction sent: ${tx.hash}`, "success");
      context.log("⏳ Waiting for confirmation...", "info");

      const receipt = await tx.wait();

      context.log(
        `✅ Transaction confirmed in block ${receipt.blockNumber}!`,
        "success"
      );
      context.log("", "info");
      context.log("💰 OMEGA tokens should arrive shortly", "info");
      context.log("💡 Check your balance with: balance", "info");
    } catch (error: any) {
      context.log(`❌ Faucet request failed: ${error.message}`, "error");
      if (error.message.includes("Already claimed")) {
        context.log(
          "You can only claim from the faucet once per address.",
          "warning"
        );
      }
    }
  },
};

/**
 * Enhanced fallback UI for when wallet provider is not ready.
 * Displays helpful instructions in a nicely formatted panel
 */
function showWalletSetupGuide(context: CommandContext): void {
  context.log("=== 🦊 Wallet Setup Guide ===", "info");
  context.log("", "info");
  context.log("No wallet is currently connected.", "warning");
  context.log("Here's how to get started:", "info");
  context.log("", "info");
  context.log("Option 1: Connect MetaMask", "info");
  context.log('  Type "connect" to connect your MetaMask wallet', "output");
  context.log("", "info");
  context.log("Option 2: Create Test Wallet", "info");
  context.log(
    '  Type "test-wallet" to create a temporary test wallet',
    "output"
  );
  context.log(
    "  (For testing only - wallet clears when tab closes)",
    "warning"
  );
  context.log("", "info");
  context.log("After connecting:", "info");
  context.log('  • Use "balance" to check your balance', "output");
  context.log('  • Use "send <amount> <address>" to transfer tokens', "output");
  context.log('  • Use "fund" to get testnet tokens', "output");
  context.log("", "info");
  context.log(
    '💡 You can still use commands like "help", "balance", and "mine"',
    "info"
  );
}

export const walletCommands: Command[] = [
  connectCommand,
  disconnectCommand,
  balanceCommand,
  sendCommand,
  importCommand,
  exportCommand,
  testWalletCommand,
  fundCommand,
  fundDirectCommand,
];

export default walletCommands;
