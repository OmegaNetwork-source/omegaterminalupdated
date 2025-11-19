/**
 * Wallet Commands (Phase 2)
 * Minimal wallet command implementations migrated from js/commands/wallet-commands.js
 */

import type { Command, CommandContext } from "@/types/commands";
import { isValidEthereumAddress, shortenAddress } from "@/lib/utils";
import { config } from "@/lib/config";
import { parseEther } from "ethers";
import { openNetworkSelector } from "@/lib/wallet/networkSelector";
import { createCommandLine, createUsageError } from "./command-output-helpers";

function requireConnection(context: CommandContext): boolean {
  if (!context.wallet.state.isConnected || !context.wallet.state.address) {
    context.log("No wallet connected.", "warning");
    const helpHtml = createCommandLine("connect", "Connect a wallet first");
    context.logHtml(helpHtml);
    return false;
  }
  return true;
}

export const connectCommand: Command = {
  name: "connect",
  description: "Connect MetaMask wallet",
  category: "wallet",
  handler: async (context: CommandContext) => {
    if (typeof window === "undefined") {
      context.log(
        "Environment does not support wallet connection (SSR).",
        "error"
      );
      return;
    }

    // Open network selector - this will show the modal
    // The selector will handle all logging internally
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

      // Check for claimable mining rewards (Omega Network)
      try {
        const response = await fetch(`${config.RELAYER_URL}/claimable`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: context.wallet.state.address }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.amount && parseFloat(data.amount) > 0) {
            const claimableAmount = parseFloat(data.amount);
            context.log(
              `⛏️  Pending Mining Rewards: ${claimableAmount.toFixed(4)} OMEGA`,
              "info"
            );
            context.logHtml(
              `💡 Use ${createCommandLine("claim", "claim")} to withdraw your rewards`
            );
          }
        }
      } catch (error) {
        // Silently fail - claimable rewards check is optional
        console.warn("Failed to check claimable rewards:", error);
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
      const helpHtml = `
        <div style="margin: 12px 0;">
          ${createCommandLine("connect", "Connect a wallet")}
          ${createCommandLine("solana connect", "Connect Solana wallet")}
          ${createCommandLine("near connect", "Connect NEAR Protocol wallet")}
        </div>
      `;
      context.logHtml(helpHtml);
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
      const usageHtml = createUsageError("send <amount> <address>", [
        "send 10 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "send 0.5 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      ]);
      context.logHtml(usageHtml);
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
      const usageHtml = createUsageError("import <private-key>", [
        "import 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      ]);
      context.logHtml(usageHtml);
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
        const helpHtml = createCommandLine("balance", "Check your balance");
        context.logHtml(helpHtml);
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
      const helpHtml = createCommandLine("balance", "Check your balance");
      context.logHtml(helpHtml);
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
  const helpHtml = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 10px 0;
    ">
      <div style="
        font-size: 18px;
        font-weight: 600;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        text-align: center;
      ">🦊 Wallet Setup Guide</div>
      
      <div style="color: var(--palette-warning, #ffa502); margin-bottom: 12px;">
        No wallet is currently connected.
      </div>
      
      <div style="margin: 16px 0;">
        <div style="
          font-size: 14px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 8px;
        ">Option 1: Connect MetaMask</div>
        ${createCommandLine("connect", "Connect your MetaMask wallet")}
      </div>
      
      <div style="margin: 16px 0;">
        <div style="
          font-size: 14px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 8px;
        ">Option 2: Create Test Wallet</div>
        ${createCommandLine("test-wallet", "Create a temporary test wallet")}
        <div style="
          color: var(--palette-warning, #ffa502);
          margin-top: 4px;
          font-size: 0.9em;
          padding-left: 20px;
        ">(For testing only - wallet clears when tab closes)</div>
      </div>
      
      <div style="margin: 16px 0;">
        <div style="
          font-size: 14px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 8px;
        ">After connecting:</div>
        ${createCommandLine("balance", "Check your balance")}
        ${createCommandLine("send <amount> <address>", "Transfer tokens")}
        ${createCommandLine("fund", "Get testnet tokens")}
      </div>
      
      <div style="
        margin-top: 20px;
        padding-top: 12px;
        border-top: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
        color: var(--palette-text, #ccd4e0);
        font-size: 0.9em;
        text-align: center;
      ">
        💡 You can still use commands like <span class="omega-help-command" data-command="help" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'help' to terminal input">help</span>, <span class="omega-help-command" data-command="balance" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'balance' to terminal input">balance</span>, and <span class="omega-help-command" data-command="mine" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'mine' to terminal input">mine</span>
      </div>
    </div>
  `;
  context.logHtml(helpHtml);
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
