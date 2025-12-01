/**
 * Wallet Commands (Phase 2)
 * Minimal wallet command implementations migrated from js/commands/wallet-commands.js
 */

import type { Command, CommandContext } from "@/types/commands";
import { isValidEthereumAddress, shortenAddress, escapeHtml } from "@/lib/utils";
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
      
      // Wait a bit for wallet state to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check if wallet was created successfully
      if (!walletInfo) {
        context.log("❌ Test wallet creation failed.", "error");
        context.log("The wallet provider returned null. Please try again.", "info");
        return;
      }

      if (!walletInfo.address) {
        context.log("❌ Test wallet creation failed - no address returned.", "error");
        context.log("Please check the browser console for errors.", "info");
        return;
      }

      // Get balance if available
      let balance = "0.0";
      try {
        const walletBalance = await context.wallet.getBalance();
        if (walletBalance) {
          balance = parseFloat(walletBalance).toFixed(4);
        }
      } catch (e) {
        // Balance fetch is optional, continue without it
      }

      // Create formatted output box with all wallet details
      const walletDetailsHtml = `
        <div style="
          background: linear-gradient(135deg, 
            color-mix(in srgb, var(--palette-success, #00ff88) 15%, transparent), 
            color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent)
          );
          border: 1px solid color-mix(in srgb, var(--palette-success, #00ff88) 30%, transparent);
          border-radius: 12px;
          padding: 20px;
          margin: 12px 0;
          box-shadow: 0 4px 16px rgba(0, 255, 136, 0.15);
        ">
          <div style="
            font-size: 18px;
            font-weight: 600;
            color: var(--palette-success, #00ff88);
            margin-bottom: 16px;
            text-shadow: 0 0 8px color-mix(in srgb, var(--palette-success, #00ff88) 40%, transparent);
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Test Wallet Created Successfully
          </div>
          
          <div style="
            background: color-mix(in srgb, var(--palette-bg, #000) 40%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
            border-radius: 8px;
            padding: 16px;
            margin: 12px 0;
          ">
            <div style="
              display: grid;
              grid-template-columns: auto 1fr;
              gap: 12px 20px;
              align-items: start;
            ">
              <div style="
                color: var(--palette-primary, #00d4ff);
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Address:</div>
              <div style="
                color: var(--palette-text, #ffffff);
                font-family: 'Courier New', monospace;
                font-size: 13px;
                word-break: break-all;
                background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
              ">${escapeHtml(walletInfo.address)}</div>
              
              ${walletInfo.privateKey ? `
                <div style="
                  color: var(--palette-warning, #ffa502);
                  font-weight: 600;
                  font-size: 13px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">Private Key:</div>
                <div style="
                  color: var(--palette-warning, #ffa502);
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  word-break: break-all;
                  background: color-mix(in srgb, var(--palette-warning, #ffa502) 8%, transparent);
                  padding: 8px 12px;
                  border-radius: 4px;
                  border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 20%, transparent);
                ">${escapeHtml(walletInfo.privateKey)}</div>
              ` : ''}
              
              <div style="
                color: var(--palette-primary, #00d4ff);
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Balance:</div>
              <div style="
                color: var(--palette-text, #ffffff);
                font-family: 'Courier New', monospace;
                font-size: 13px;
              ">${balance} OMEGA</div>
              
              <div style="
                color: var(--palette-primary, #00d4ff);
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Network:</div>
              <div style="
                color: var(--palette-text, #ffffff);
                font-size: 13px;
              ">Omega Network (Testnet)</div>
              
              <div style="
                color: var(--palette-primary, #00d4ff);
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Type:</div>
              <div style="
                color: var(--palette-text, #ffffff);
                font-size: 13px;
              ">Session Wallet (Temporary)</div>
            </div>
          </div>
          
          <div style="
            background: color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 25%, transparent);
            border-radius: 8px;
            padding: 12px;
            margin-top: 16px;
          ">
            <div style="
              color: var(--palette-warning, #ffa502);
              font-weight: 600;
              font-size: 13px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Important Warnings
            </div>
            <ul style="
              color: var(--palette-text, #ccd4e0);
              font-size: 12px;
              margin: 0;
              padding-left: 20px;
              line-height: 1.8;
            ">
              <li>Private key is stored in session storage only</li>
              <li>Wallet will be cleared when you close this tab</li>
              <li>Do NOT use for real funds or production use</li>
              <li>This is a test wallet for development purposes</li>
            </ul>
          </div>
          
          <div style="
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
          ">
            <div style="
              color: var(--palette-text, #ccd4e0);
              font-size: 12px;
              margin-bottom: 8px;
            ">Quick Actions:</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${createCommandLine("export", "View wallet details")}
              ${createCommandLine("balance", "Check balance")}
              ${createCommandLine("fund", "Request testnet tokens")}
            </div>
          </div>
        </div>
      `;

      context.logHtml(walletDetailsHtml);
      
    } catch (error: any) {
      const errorHtml = `
        <div style="
          background: linear-gradient(135deg, 
            color-mix(in srgb, var(--palette-error, #ff4757) 15%, transparent), 
            color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent)
          );
          border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
          border-radius: 12px;
          padding: 20px;
          margin: 12px 0;
        ">
          <div style="
            font-size: 16px;
            font-weight: 600;
            color: var(--palette-error, #ff4757);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Test Wallet Creation Failed
          </div>
          <div style="
            color: var(--palette-text, #ccd4e0);
            font-size: 13px;
            margin: 8px 0;
          ">${escapeHtml(error?.message || String(error) || "Unknown error occurred")}</div>
          <div style="
            color: var(--palette-text, #ccd4e0);
            font-size: 12px;
            margin-top: 12px;
            opacity: 0.8;
          ">Please check the browser console for more details and try again.</div>
        </div>
      `;
      context.logHtml(errorHtml);
      console.error("[test-wallet] Error creating session wallet:", error);
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
