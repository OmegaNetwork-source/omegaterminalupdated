/**
 * Stable Network Continuous Transactions
 * Sends transactions continuously at regular intervals
 */

import type { CommandContext } from "@/types/commands";
import { parseEther } from "ethers";

// Global state for continuous transactions
let transactionInterval: NodeJS.Timeout | null = null;
let transactionContext: CommandContext | null = null;
let transactionCount = 0;
let isRunning = false;

// Configuration
const TRANSACTION_INTERVAL_MS = 60 * 1000; // 1 minute
const TRANSACTION_AMOUNT = "0.001"; // Small amount in gUSDT

/**
 * Send a single transaction
 */
async function sendSingleTransaction(context: CommandContext): Promise<boolean> {
  try {
    console.log("[Stable Transactions] sendSingleTransaction called");
    const signer = await context.wallet.getSigner();
    if (!signer || !signer.provider) {
      context.log("❌ Wallet not connected", "error");
      console.log("[Stable Transactions] No signer or provider");
      return false;
    }

    console.log("[Stable Transactions] Signer obtained, sending transaction...");
    
    // Get the sender address (send to self)
    const fromAddress = await signer.getAddress();
    console.log("[Stable Transactions] From address:", fromAddress);
    console.log("[Stable Transactions] Sending to self (same address)");
    
    // Send to self (same address) - this creates a transaction without losing tokens
    const tx = await signer.sendTransaction({
      to: fromAddress,
      value: parseEther(TRANSACTION_AMOUNT),
    });

    console.log("[Stable Transactions] Transaction sent:", tx.hash);
    transactionCount++;
    context.log(
      `✅ Transaction #${transactionCount} sent: ${tx.hash}`,
      "success"
    );
    context.log(
      `   View on explorer: https://testnet.stablescan.xyz/tx/${tx.hash}`,
      "output"
    );

    // Wait for confirmation (non-blocking)
    tx.wait()
      .then((receipt) => {
        console.log("[Stable Transactions] Transaction confirmed:", receipt.blockNumber);
        context.log(
          `   ✓ Confirmed in block ${receipt.blockNumber}`,
          "output"
        );
      })
      .catch((error) => {
        console.error("[Stable Transactions] Confirmation error:", error);
        context.log(`   ⚠️ Confirmation error: ${error.message}`, "warning");
      });

    return true;
  } catch (error: any) {
    console.error("[Stable Transactions] Transaction error:", error);
    context.log(
      `❌ Transaction failed: ${error?.message || error}`,
      "error"
    );
    if (error?.message?.includes("insufficient funds")) {
      context.log("💡 Get testnet tokens from: https://faucet.stable.xyz", "info");
    }
    return false;
  }
}

/**
 * Start continuous transactions
 */
export async function startContinuousTransactions(
  context: CommandContext
): Promise<void> {
  console.log("[Stable Transactions] startContinuousTransactions called");
  
  if (isRunning) {
    context.log("⚠️ Continuous transactions are already running", "warning");
    context.log(`   Total transactions sent: ${transactionCount}`, "output");
    return;
  }

  if (!context.wallet.state.isConnected || !context.wallet.state.address) {
    context.log("❌ Please connect your wallet first", "error");
    context.log("💡 Use 'connect' command to connect your wallet", "info");
    return;
  }

  // Check network
  try {
    const signer = await context.wallet.getSigner();
    if (signer?.provider) {
      const network = await signer.provider.getNetwork();
      if (network.chainId !== 2201n) {
        context.log(
          "⚠️ Warning: Not connected to Stable Network (Chain ID: 2201)",
          "warning"
        );
        context.log("Please switch to Stable Network testnet", "info");
      }
    }
  } catch (error) {
    // Continue anyway
  }

  isRunning = true;
  transactionContext = context;
  transactionCount = 0;

  context.log("🚀 Starting continuous transactions...", "info");
  context.log(`   Interval: Every ${TRANSACTION_INTERVAL_MS / 1000} seconds`, "output");
  context.log(`   Amount: ${TRANSACTION_AMOUNT} gUSDT per transaction`, "output");
  context.log(`   To: Your own wallet (self-transfer)`, "output");
  context.log("", "info");
  context.log("💡 Use 'stable transactions stop' to stop", "info");
  context.log("", "info");

  // Send first transaction immediately
  console.log("[Stable Transactions] Sending first transaction...");
  try {
    const firstTxSuccess = await sendSingleTransaction(context);
    if (!firstTxSuccess) {
      isRunning = false;
      transactionContext = null;
      context.log("❌ Failed to send first transaction. Stopping.", "error");
      return;
    }
  } catch (error: any) {
    console.error("[Stable Transactions] Error sending first transaction:", error);
    isRunning = false;
    transactionContext = null;
    context.log(`❌ Error: ${error?.message || error}`, "error");
    return;
  }

  // Set up interval for subsequent transactions
  console.log("[Stable Transactions] Setting up interval...");
  transactionInterval = setInterval(async () => {
    console.log("[Stable Transactions] Interval triggered, isRunning:", isRunning);
    if (transactionContext && isRunning) {
      await sendSingleTransaction(transactionContext);
    } else {
      console.log("[Stable Transactions] Not sending - context or running state issue");
    }
  }, TRANSACTION_INTERVAL_MS);
  
  console.log("[Stable Transactions] Interval set up, will send every", TRANSACTION_INTERVAL_MS, "ms");
}

/**
 * Stop continuous transactions
 */
export function stopContinuousTransactions(context: CommandContext): void {
  if (!isRunning) {
    context.log("⚠️ Continuous transactions are not running", "warning");
    return;
  }

  if (transactionInterval) {
    clearInterval(transactionInterval);
    transactionInterval = null;
  }

  isRunning = false;
  context.log("🛑 Stopped continuous transactions", "info");
  context.log(`   Total transactions sent: ${transactionCount}`, "output");
  transactionContext = null;
}

/**
 * Get status of continuous transactions
 */
export function getTransactionStatus(): {
  isRunning: boolean;
  count: number;
} {
  return {
    isRunning,
    count: transactionCount,
  };
}

/**
 * Stable transactions command handler
 */
export async function handleStableTransactions(
  context: CommandContext,
  args: string[]
): Promise<void> {
  console.log("[Stable Transactions] handleStableTransactions called with args:", args);
  const subcommand = args[2]?.toLowerCase(); // args[0] = "stable", args[1] = "transactions", args[2] = "start/stop/status"

  if (subcommand === "start") {
    await startContinuousTransactions(context);
  } else if (subcommand === "stop") {
    stopContinuousTransactions(context);
  } else if (subcommand === "status") {
    const status = getTransactionStatus();
    if (status.isRunning) {
      context.log("🟢 Continuous transactions are running", "success");
      context.log(`   Total transactions sent: ${status.count}`, "output");
    } else {
      context.log("🔴 Continuous transactions are stopped", "info");
      context.log(`   Total transactions sent: ${status.count}`, "output");
    }
  } else {
    // Show help
    const helpHtml = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      ">
        <div style="
          font-size: 18px;
          font-weight: 600;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
        ">📊 CONTINUOUS TRANSACTIONS</div>
        
        <div style="
          font-size: 14px;
          font-weight: 600;
          color: var(--palette-secondary, #00ff88);
          margin: 16px 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">Usage</div>
        
        <div style="
          font-size: 13px;
          color: var(--palette-text, #ccd4e0);
          line-height: 1.8;
          margin-bottom: 12px;
        ">
          <div style="margin-bottom: 8px;">
            <span class="omega-help-command" data-command="stable transactions start" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'stable transactions start' to terminal input">stable transactions start</span> - Start sending transactions every minute
          </div>
          <div style="margin-bottom: 8px;">
            <span class="omega-help-command" data-command="stable transactions stop" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'stable transactions stop' to terminal input">stable transactions stop</span> - Stop sending transactions
          </div>
          <div style="margin-bottom: 8px;">
            <span class="omega-help-command" data-command="stable transactions status" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add 'stable transactions status' to terminal input">stable transactions status</span> - Check if transactions are running
          </div>
        </div>
        
        <div style="
          font-size: 14px;
          font-weight: 600;
          color: var(--palette-secondary, #00ff88);
          margin: 20px 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">Details</div>
        
        <div style="
          font-size: 13px;
          color: var(--palette-text, #ccd4e0);
          line-height: 1.8;
          margin-bottom: 12px;
        ">
          <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Interval:</strong> Every 60 seconds (1 minute)</div>
          <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Amount:</strong> 0.001 gUSDT per transaction</div>
          <div style="margin-bottom: 8px;"><strong style="color: var(--palette-primary, #00d4ff);">Network:</strong> Stable Network Testnet (Chain ID: 2201)</div>
        </div>
        
        <div style="
          margin-top: 20px;
          padding: 12px;
          background: color-mix(in srgb, var(--palette-warning, #ffaa00) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-warning, #ffaa00) 30%, transparent);
          border-radius: 6px;
          font-size: 12px;
          color: var(--palette-text, #ccd4e0);
        ">
          <span style="color: var(--palette-warning, #ffaa00);">⚠️</span>
          <span style="margin-left: 8px;">Make sure you have enough gUSDT for gas fees. Get testnet tokens from: <a href="https://faucet.stable.xyz" target="_blank" style="color: var(--palette-secondary, #00ff88); text-decoration: none;">faucet.stable.xyz</a></span>
        </div>
      </div>
    `;
    context.logHtml(helpHtml);
    context.log("", "output");
  }
}

