/**
 * Network Stress Testing Commands Module
 * Migrated from js/commands/network.js to TypeScript
 *
 * Provides commands for network stress testing with multiple transaction types.
 * Creates test wallets and sends various transaction types at high frequency.
 */

import type { Command, CommandContext } from "@/types/commands";
import { config } from "@/lib/config";
import { formatDuration, shortenAddress, randomHex } from "@/lib/utils";
import { Wallet, JsonRpcProvider, parseEther } from "ethers";

/**
 * Request funding for stress wallet via relayer
 */
async function requestStressFunding(
  address: string,
  context: CommandContext
): Promise<void> {
  try {
    context.log("💰 Requesting funding for stress wallet...", "info");

    const response = await fetch(`${config.RELAYER_URL}/fund-stress-wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: address,
        amount: "1.0", // Request 1 OMEGA for stress testing
      }),
    });

    const result = await response.json();

    if (result.success) {
      context.log(`✅ Stress wallet funded: ${result.amount} OMEGA`, "success");
    } else {
      context.log(
        `⚠️ Funding request sent but may have failed: ${
          result.error || "Unknown error"
        }`,
        "warning"
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log(
      `⚠️ Could not request stress funding: ${errorMessage}`,
      "warning"
    );
    context.log(
      "💡 Stress test will continue but transactions may fail due to insufficient funds",
      "info"
    );
  }
}

/**
 * Perform a single stress test transaction
 */
async function performStressTransaction(
  context: CommandContext
): Promise<void> {
  // Get updaters from window
  const updaters = (window as any).__omegaMiningUpdaters;

  // Check if stress test is still running using the boolean ref
  if (!updaters?.stressActiveRef?.current) {
    return;
  }

  // Get stress wallet from window updaters
  const stressWallet = updaters?.stressWalletRef?.current;

  if (!stressWallet) {
    return;
  }

  try {
    // Generate random transaction parameters
    const transactionTypes = ["transfer", "contract_call", "mining"];
    const txType =
      transactionTypes[Math.floor(Math.random() * transactionTypes.length)];

    let tx;

    // Increment transactions sent atomically
    if (updaters?.incTransactionsSent) {
      updaters.incTransactionsSent();
    }

    switch (txType) {
      case "transfer":
        // Create random transfer
        const randomReceiver = Wallet.createRandom().address;
        const randomAmount = (Math.random() * 0.01).toFixed(6); // 0-0.01 OMEGA

        tx = await stressWallet.sendTransaction({
          to: randomReceiver,
          value: parseEther(randomAmount),
        });
        break;

      case "contract_call":
        // Try to call mining contract if available
        if (config.CONTRACT_ADDRESS && context.getContract) {
          const contract = context.getContract(
            config.CONTRACT_ADDRESS,
            config.CONTRACT_ABI,
            stressWallet
          );

          const nonce = Math.floor(Math.random() * 1000000);
          const solution = randomHex(64);

          tx = await contract.mineBlock(nonce, solution);
        } else {
          // Fallback to transfer if no contract
          const fallbackReceiver = Wallet.createRandom().address;
          tx = await stressWallet.sendTransaction({
            to: fallbackReceiver,
            value: parseEther("0.001"),
          });
        }
        break;

      case "mining":
        // Simple mining-like transaction
        const data = randomHex(32);

        tx = await stressWallet.sendTransaction({
          to: stressWallet.address, // Self-transaction
          value: 0,
          data: data,
        });
        break;
    }

    // Don't wait for confirmation to maintain high throughput
    if (updaters?.incSuccessfulTxs) {
      updaters.incSuccessfulTxs();
    }

    // Occasionally log progress
    const txCount = context.stressTestState.stats.transactionsSent;
    if (txCount % 10 === 0) {
      const duration = Math.floor(
        (Date.now() - context.stressTestState.stats.startTime) / 1000
      );
      const rate = txCount / (duration || 1);
      context.log(
        `📊 Progress: ${txCount} txs sent (${rate.toFixed(1)} tx/s)`,
        "info"
      );
    }
  } catch (error) {
    // Increment failed transactions atomically
    if (updaters?.incFailedTxs) {
      updaters.incFailedTxs();
    }

    const failedCount = context.stressTestState.stats.failedTxs;

    // Log occasional errors but don't spam
    if (failedCount % 5 === 1) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      context.log(`⚠️ Stress transaction failed: ${errorMessage}`, "warning");
    }

    // If too many consecutive failures, consider stopping
    const txCount = context.stressTestState.stats.transactionsSent;
    const recentFailureRate = failedCount / Math.max(txCount, 1);
    if (recentFailureRate > 0.8 && txCount > 10) {
      context.log(
        "🛑 High failure rate detected. Consider stopping stress test.",
        "warning"
      );
      context.log(
        "💡 The network may be congested or wallet may be out of funds",
        "info"
      );
    }
  }
}

/**
 * Stress command - Start network stress test
 */
const stressCommand: Command = {
  name: "stress",
  description: "Start network stress test",
  usage: "stress",
  category: "network",
  handler: async (context: CommandContext) => {
    // Check if already running
    if (context.stressTestState?.isStressTesting) {
      context.log(
        '❌ Stress test already running. Use "stopstress" to stop.',
        "error"
      );
      return;
    }

    context.log("🚀 Starting network stress test...", "info");
    context.log(
      "⚠️  This will create many transactions on the Omega network",
      "warning"
    );
    context.log('💡 Use "stopstress" to stop the test at any time', "info");

    try {
      // Initialize stress test state
      context.stressTestState?.startStressTest();

      // Create stress test wallet
      const provider = new JsonRpcProvider(config.OMEGA_RPC_URL);
      const stressWallet = Wallet.createRandom().connect(provider);

      // Store wallet in window updaters
      const updaters = (window as any).__omegaMiningUpdaters;
      if (updaters) {
        updaters.stressWalletRef.current = stressWallet;
        updaters.updateStressTestStats({
          walletsCreated: 1,
        });
      }

      context.log(`📊 Stress wallet created: ${stressWallet.address}`, "info");

      // Request initial funding for stress wallet
      await requestStressFunding(stressWallet.address, context);

      // Start stress test loop (using recursive setTimeout)
      const stressTestLoop = async () => {
        // Check if still running using the boolean ref
        if (!updaters?.stressActiveRef?.current) {
          return;
        }

        await performStressTransaction(context);

        // Continue loop if still active
        if (updaters?.stressActiveRef?.current) {
          const timeoutId = setTimeout(stressTestLoop, 2000); // Transaction every 2 seconds
          if (updaters?.stressTestTimeoutRef) {
            updaters.stressTestTimeoutRef.current =
              timeoutId as unknown as number;
          }
        }
      };

      // Start the loop
      stressTestLoop();

      context.log("✅ Stress test started successfully", "success");
      context.log('📊 Use "stressstats" to view real-time statistics', "info");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      context.log(`❌ Failed to start stress test: ${errorMessage}`, "error");
      context.stressTestState?.stopStressTest();
    }
  },
};

/**
 * Stop stress command - Stop stress test
 */
const stopstressCommand: Command = {
  name: "stopstress",
  description: "Stop network stress test",
  usage: "stopstress",
  category: "network",
  handler: (context: CommandContext) => {
    if (!context.stressTestState?.isStressTesting) {
      context.log("❌ No stress test is currently running", "error");
      return;
    }

    context.log("🛑 Stopping stress test...", "info");

    // Get stats before stopping
    const stats = context.stressTestState.stats;
    const duration = Math.floor((Date.now() - stats.startTime) / 1000);
    const txRate = stats.transactionsSent / (duration || 1);

    // Stop the test
    context.stressTestState.stopStressTest();

    context.log("✅ Stress test stopped", "success");
    context.log("=== FINAL STRESS TEST RESULTS ===", "info");
    context.log(`Duration: ${formatDuration(duration)}`, "info");
    context.log(`Wallets Created: ${stats.walletsCreated}`, "info");
    context.log(`Total Transactions: ${stats.transactionsSent}`, "info");
    context.log(`Successful: ${stats.successfulTxs}`, "success");
    context.log(`Failed: ${stats.failedTxs}`, "error");
    context.log(`Average Rate: ${txRate.toFixed(2)} tx/second`, "info");

    const successRate =
      stats.transactionsSent > 0
        ? (stats.successfulTxs / stats.transactionsSent) * 100
        : 0;
    context.log(
      `Success Rate: ${successRate.toFixed(1)}%`,
      successRate > 80 ? "success" : "warning"
    );
  },
};

/**
 * Stress stats command - Show live stress test statistics
 */
const stressstatsCommand: Command = {
  name: "stressstats",
  description: "Show live stress test statistics",
  usage: "stressstats",
  category: "network",
  handler: (context: CommandContext) => {
    if (!context.stressTestState?.isStressTesting) {
      context.log("❌ No stress test is currently running", "error");
      context.log('💡 Use "stress" to start a stress test', "info");
      return;
    }

    const stats = context.stressTestState.stats;
    const duration = Math.floor((Date.now() - stats.startTime) / 1000);
    const txRate = stats.transactionsSent / (duration || 1);

    context.log("=== LIVE STRESS TEST STATISTICS ===", "info");
    context.log(`⏱️  Duration: ${formatDuration(duration)}`, "info");
    context.log(`👛 Wallets Created: ${stats.walletsCreated}`, "info");
    context.log(`📊 Total Transactions: ${stats.transactionsSent}`, "info");
    context.log(`✅ Successful: ${stats.successfulTxs}`, "success");
    context.log(`❌ Failed: ${stats.failedTxs}`, "error");
    context.log(`⚡ Current Rate: ${txRate.toFixed(2)} tx/second`, "info");

    if (stats.transactionsSent > 0) {
      const successRate = (stats.successfulTxs / stats.transactionsSent) * 100;
      context.log(
        `📈 Success Rate: ${successRate.toFixed(1)}%`,
        successRate > 80 ? "success" : "warning"
      );
    }

    // Show stress wallet address if available
    const updaters = (window as any).__omegaMiningUpdaters;
    const stressWallet = updaters?.stressWalletRef?.current;
    if (stressWallet) {
      context.log(
        `💰 Stress Wallet: ${shortenAddress(stressWallet.address)}`,
        "info"
      );
    }
  },
};

/**
 * ForceAdd Command
 * Force add Omega Network to MetaMask
 */
const forceaddCommand: Command = {
  name: "forceadd",
  description: "Force add Omega Network to MetaMask",
  category: "network",
  handler: async (context: CommandContext) => {
    context.log("🌐 Force Adding Omega Network to MetaMask...", "info");
    context.log("", "output");

    if (typeof window === "undefined" || !window.ethereum) {
      context.log("❌ MetaMask not detected", "error");
      context.log("💡 Please install MetaMask browser extension", "info");
      return;
    }

    try {
      const networkParams = {
        chainId: config.OMEGA_NETWORK.chainId,
        chainName: config.OMEGA_NETWORK.name,
        nativeCurrency: config.OMEGA_NETWORK.currency,
        rpcUrls: [config.OMEGA_RPC_URL],
        blockExplorerUrls: [config.OMEGA_NETWORK.explorerUrl],
      };

      context.log("📡 Adding network with parameters:", "info");
      context.log(`  Chain ID: ${networkParams.chainId}`, "output");
      context.log(`  Name: ${networkParams.chainName}`, "output");
      context.log(`  RPC URL: ${networkParams.rpcUrls[0]}`, "output");
      context.log(
        `  Currency: ${networkParams.nativeCurrency.symbol}`,
        "output"
      );
      context.log("", "output");

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [networkParams],
      });

      context.log("✅ Network added successfully!", "success");
      context.log(
        "💡 MetaMask should now be connected to Omega Network",
        "info"
      );
    } catch (error: any) {
      if (error.code === 4001) {
        context.log("❌ User rejected the request", "error");
      } else {
        context.log(`❌ Failed to add network: ${error.message}`, "error");
      }
    }
  },
};

/**
 * RPCCheck Command
 * Check RPC connection and chain ID
 */
const rpccheckCommand: Command = {
  name: "rpccheck",
  description: "Check RPC connection and chain ID",
  category: "network",
  handler: async (context: CommandContext) => {
    context.log("🔍 Checking RPC Connection...", "info");
    context.log("", "output");

    try {
      const provider = new JsonRpcProvider(config.OMEGA_RPC_URL);

      context.log("📡 RPC Endpoint:", "info");
      context.log(`  ${config.OMEGA_RPC_URL}`, "output");
      context.log("", "output");

      context.log("⏳ Testing connection...", "info");

      // Get network info
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();
      const chainIdHex = "0x" + network.chainId.toString(16);

      context.log("✅ Connection successful!", "success");
      context.log("", "output");

      context.log("📊 Network Information:", "info");
      context.log(`  Chain ID (decimal): ${chainId}`, "output");
      context.log(`  Chain ID (hex): ${chainIdHex}`, "output");
      context.log(`  Network Name: ${network.name}`, "output");
      context.log("", "output");

      // Check if chain ID matches expected
      const expectedChainId = parseInt(config.OMEGA_NETWORK.chainId, 16);
      const actualChainId = Number(chainId);

      if (actualChainId === expectedChainId) {
        context.log("✅ Chain ID matches Omega Network!", "success");
      } else {
        context.log("⚠️ Chain ID mismatch!", "warning");
        context.log(`  Expected: ${expectedChainId}`, "output");
        context.log(`  Got: ${actualChainId}`, "output");
      }

      // Get latest block number
      context.log("", "output");
      context.log("⏳ Fetching latest block...", "info");
      const blockNumber = await provider.getBlockNumber();
      context.log(`  Latest Block: #${blockNumber}`, "success");
    } catch (error: any) {
      context.log("", "output");
      context.log("❌ RPC Connection Failed", "error");
      context.log(`  Error: ${error.message}`, "error");
      context.log("", "output");
      context.log("💡 Possible issues:", "info");
      context.log("  • RPC endpoint is down", "output");
      context.log("  • Network connectivity problems", "output");
      context.log("  • Firewall blocking the connection", "output");
    }
  },
};

/**
 * Export all network commands
 */
export const networkCommands: Command[] = [
  stressCommand,
  stopstressCommand,
  stressstatsCommand,
  forceaddCommand,
  rpccheckCommand,
];
