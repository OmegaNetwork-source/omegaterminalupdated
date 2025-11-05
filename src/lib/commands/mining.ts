/**
 * Mining Commands Module
 * Migrated from js/commands/mining.js to TypeScript
 *
 * Provides commands for mining OMEGA tokens, claiming rewards, and accessing faucet.
 * Uses relayer API for automated mining and direct contract interaction for claims.
 */

import type { Command, CommandContext } from "@/types/commands";
import { config } from "@/lib/config";
import {
  formatBalance,
  formatDuration,
  formatTimestamp,
  escapeHtml,
  randomHex,
} from "@/lib/utils";
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const isExpectedOmegaChain = (
  chainId: string | number | null | undefined
): boolean => {
  if (chainId === null || chainId === undefined) {
    return false;
  }

  const expectedHex = config.OMEGA_NETWORK.chainId.toLowerCase();
  const expectedDecimal = config.OMEGA_NETWORK.chainIdDecimal;

  if (typeof chainId === "number") {
    return chainId === expectedDecimal;
  }

  const value = chainId.toLowerCase();

  if (value === expectedHex) {
    return true;
  }

  const numeric = Number(value);
  return !Number.isNaN(numeric) && numeric === expectedDecimal;
};

/**
 * Generate fake hash for mining animation
 * @returns Random 64-character hex string
 */
function generateFakeHash(): string {
  return randomHex(64);
}

/**
 * Mine command - Start automated mining using relayer
 * Avoids constant MetaMask confirmations by using backend relayer
 */
const mineCommand: Command = {
  name: "mine",
  description: "Start automated mining",
  usage: "mine",
  category: "mining",
  handler: async (context: CommandContext) => {
    // Check wallet connection
    if (!context.wallet.state.isConnected) {
      context.log("❌ No wallet connected. Use 'connect' first.", "error");
      return;
    }

    // Check if already mining
    if (context.miningState?.isMining) {
      context.log(
        "⛏️  Mining is already running. Use 'stop' to stop it.",
        "warning"
      );
      return;
    }

    try {
      context.log("⛏️  Starting automated mining session...", "info");
      context.log(
        "💡 Mining will use relayer to avoid constant MetaMask confirmations",
        "info"
      );

      // Start mining state
      context.miningState?.startMining();

      // Get current address
      const address = context.wallet.state.address;
      if (!address) {
        context.log("❌ No wallet address available", "error");
        context.miningState?.stopMining();
        return;
      }

      // Define mining loop
      const mineLoop = async () => {
        // Get updaters from window
        const updaters = (window as any).__omegaMiningUpdaters;

        // Check if still mining using the boolean ref
        if (!updaters?.miningActiveRef?.current) return;

        try {
          if (updaters) {
            updaters.incrementMineCount();
          }

          const currentCount = context.miningState?.mineCount || 0;
          context.log(`⛏️  Mining block #${currentCount}...`, "info");

          // Show mining animation
          const spinnerFrames = ["|", "/", "-", "\\"];
          let spinnerIndex = 0;
          for (let i = 0; i < 8; i++) {
            if (!updaters?.miningActiveRef?.current) break;
            await new Promise((resolve) => setTimeout(resolve, 100));
            context.log(
              `🔒 [${
                spinnerFrames[spinnerIndex]
              }] Hashing: ${generateFakeHash()}`,
              "output"
            );
            spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
          }

          if (!updaters?.miningActiveRef?.current) return;

          // Send mining request to relayer
          context.log("⛏️  Sending mining request to network...", "info");
          const response = await fetch(`${config.RELAYER_URL}/mine`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          });

          // Check response.ok before parsing JSON
          if (!response.ok) {
            context.log(
              `⚠️  Relayer request failed with status ${response.status}`,
              "warning"
            );
            // Continue mining loop
            if (updaters?.miningActiveRef?.current) {
              const timeoutId = setTimeout(mineLoop, 15000);
              if (updaters?.miningTimeoutRef) {
                updaters.miningTimeoutRef.current =
                  timeoutId as unknown as number;
              }
            }
            return;
          }

          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            context.log("⚠️  Malformed response from relayer", "warning");
            // Continue mining loop
            if (updaters?.miningActiveRef?.current) {
              const timeoutId = setTimeout(mineLoop, 15000);
              if (updaters?.miningTimeoutRef) {
                updaters.miningTimeoutRef.current =
                  timeoutId as unknown as number;
              }
            }
            return;
          }

          if (data.success && data.reward && data.reward > 0) {
            context.log(
              `✅ Mining successful! Reward: +${data.reward} OMEGA`,
              "success"
            );

            // Update total earned
            if (updaters) {
              updaters.addToTotalEarned(parseFloat(data.reward));
            }

            if (data.txHash) {
              context.logHtml(
                `🔍 <a href="https://0x4e454228.explorer.aurora-cloud.dev/tx/${data.txHash}" target="_blank">View transaction</a>`
              );
            }
          } else {
            context.log("⛏️  Block mined (no reward this time)", "output");
          }
        } catch (error) {
          // Handle mining failures gracefully
          context.log("⛏️  Block mined (no reward this time)", "output");
        }

        // Continue mining loop
        if (updaters?.miningActiveRef?.current) {
          const timeoutId = setTimeout(mineLoop, 15000); // 15 second intervals
          if (updaters?.miningTimeoutRef) {
            updaters.miningTimeoutRef.current = timeoutId as unknown as number;
          }
        }
      };

      // Start the mining loop
      mineLoop();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      context.log(`❌ Failed to start mining: ${errorMessage}`, "error");
      context.miningState?.stopMining();
    }
  },
};

/**
 * Claim command - Claim pending mining rewards
 * Uses direct contract interaction with MetaMask signing
 */
const claimCommand: Command = {
  name: "claim",
  description: "Claim pending mining rewards",
  usage: "claim",
  category: "mining",
  handler: async (context: CommandContext) => {
    // Check wallet connection
    if (!context.wallet.state.isConnected) {
      context.log("❌ No wallet connected. Use 'connect' first.", "error");
      return;
    }

    try {
      // Check if on correct network
      const currentChainId = context.wallet.state.chainId;
      const expectedChainIdHex = config.OMEGA_NETWORK.chainId;
      const expectedChainIdDecimal = config.OMEGA_NETWORK.chainIdDecimal;

      if (!isExpectedOmegaChain(currentChainId)) {
        context.log(
          `⚠️  Wrong network detected. Expected chain ID: ${expectedChainIdHex} (${expectedChainIdDecimal}), Current: ${
            currentChainId ?? "Unknown"
          }`,
          "warning"
        );
        context.log("🔄 Attempting to switch to Omega Network...", "info");

        const switched = await context.wallet.addOmegaNetwork();
        if (!switched) {
          context.log(
            "❌ Failed to switch network. Please switch to Omega Network manually.",
            "error"
          );
          return;
        }

        // Re-check after switch attempt
        const newChainId = context.wallet.state.chainId;
        if (!isExpectedOmegaChain(newChainId)) {
          context.log(
            "❌ Network switch unsuccessful. Please ensure you're on the Omega Network.",
            "error"
          );
          return;
        }

        context.log("✅ Successfully switched to Omega Network", "success");
      }

      // Get signer
      const signer = await context.wallet.getSigner();
      if (!signer) {
        context.log("❌ Failed to get wallet signer", "error");
        return;
      }

      // Get address
      const address = context.wallet.state.address;
      if (!address) {
        context.log("❌ No wallet address available", "error");
        return;
      }

      // Create contract instance
      const contract = context.getContract?.(
        config.CONTRACT_ADDRESS,
        config.CONTRACT_ABI,
        signer
      );

      if (!contract) {
        context.log("❌ Failed to create contract instance", "error");
        return;
      }

      // Check pending rewards
      context.log("🔍 Checking pending rewards...", "info");
      const minerInfo = await contract.getMinerInfo(address);
      const pendingRewards = formatEther(minerInfo[2]); // _pendingRewards is third return value

      if (parseFloat(pendingRewards) === 0) {
        context.log("ℹ️  No pending rewards to claim", "info");
        return;
      }

      // Claim rewards
      context.log(`💰 Claiming ${pendingRewards} OMEGA...`, "info");
      const tx = await contract.claimRewards();
      context.log(`📝 Transaction sent: ${tx.hash}`, "info");
      context.log("⏳ Waiting for confirmation...", "info");

      const receipt = await tx.wait();
      context.log(`✅ Rewards claimed successfully!`, "success");
      context.log(`📦 Block: ${receipt.blockNumber}`, "info");
      context.logHtml(
        `🔍 <a href="https://0x4e454228.explorer.aurora-cloud.dev/tx/${tx.hash}" target="_blank">View transaction</a>`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      context.log(`❌ Failed to claim rewards: ${errorMessage}`, "error");
    }
  },
};

/**
 * Show faucet status helper function
 */
async function showFaucetStatus(context: CommandContext): Promise<void> {
  // Check wallet connection
  if (!context.wallet.state.isConnected) {
    context.log("❌ No wallet connected. Use 'connect' first.", "error");
    return;
  }

  const address = context.wallet.state.address;
  if (!address) {
    context.log("❌ No wallet address available", "error");
    return;
  }

  try {
    // Create direct RPC provider (read-only)
    const provider = new JsonRpcProvider(config.OMEGA_RPC_URL);

    // Create faucet contract with provider
    const faucetContract = new Contract(
      config.FAUCET_ADDRESS,
      config.FAUCET_ABI,
      provider
    );

    context.log("🚰 Checking faucet status...", "info");
    const status = await faucetContract.getFaucetStatus(address);

    context.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "info");
    context.log("          🚰 FAUCET STATUS", "info");
    context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "info");

    const canClaimNow = status[0];
    const timeUntilNextClaim = Number(status[2]);
    const claimAmount = formatEther(status[3]);
    const faucetBalance = formatEther(status[4]);

    context.log(`Can Claim Now: ${canClaimNow ? "✅ Yes" : "❌ No"}`, "info");

    if (!canClaimNow && timeUntilNextClaim > 0) {
      context.log(
        `Time Until Next Claim: ${formatDuration(timeUntilNextClaim)}`,
        "info"
      );
    }

    context.log(`Claim Amount: ${claimAmount} OMEGA`, "info");
    context.log(`Faucet Balance: ${faucetBalance} OMEGA`, "info");
    context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "info");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log(`❌ Failed to get faucet status: ${errorMessage}`, "error");
  }
}

/**
 * Faucet command - Claim from faucet or check status
 */
const faucetCommand: Command = {
  name: "faucet",
  description: "Claim from faucet or check status",
  usage: "faucet [status]",
  category: "mining",
  handler: async (context: CommandContext, args: string[]) => {
    // Check for status subcommand
    if (args[1] === "status") {
      await showFaucetStatus(context);
      return;
    }

    // Check wallet connection
    if (!context.wallet.state.isConnected) {
      context.log("❌ No wallet connected. Use 'connect' first.", "error");
      return;
    }

    try {
      // Check if on correct network
      const currentChainId = context.wallet.state.chainId;
      const expectedChainIdHex = config.OMEGA_NETWORK.chainId;
      const expectedChainIdDecimal = config.OMEGA_NETWORK.chainIdDecimal;

      if (!isExpectedOmegaChain(currentChainId)) {
        context.log(
          `⚠️  Wrong network detected. Expected chain ID: ${expectedChainIdHex} (${expectedChainIdDecimal}), Current: ${
            currentChainId ?? "Unknown"
          }`,
          "warning"
        );
        context.log("🔄 Attempting to switch to Omega Network...", "info");

        const switched = await context.wallet.addOmegaNetwork();
        if (!switched) {
          context.log(
            "❌ Failed to switch network. Please switch to Omega Network manually.",
            "error"
          );
          return;
        }

        // Re-check after switch attempt
        const newChainId = context.wallet.state.chainId;
        if (!isExpectedOmegaChain(newChainId)) {
          context.log(
            "❌ Network switch unsuccessful. Please ensure you're on the Omega Network.",
            "error"
          );
          return;
        }

        context.log("✅ Successfully switched to Omega Network", "success");
      }

      // Get signer
      const signer = await context.wallet.getSigner();
      if (!signer) {
        context.log("❌ Failed to get wallet signer", "error");
        return;
      }

      // Create faucet contract
      const faucetContract = context.getContract?.(
        config.FAUCET_ADDRESS,
        config.FAUCET_ABI,
        signer
      );

      if (!faucetContract) {
        context.log("❌ Failed to create faucet contract instance", "error");
        return;
      }

      // Play faucet sound effect
      if (context.sound) {
        try {
          await context.sound.playFaucetSound();
        } catch {
          // Ignore sound errors
        }
      }

      context.log("🚰 Claiming from faucet...", "info");
      const tx = await faucetContract.claim({ gasLimit: 100000n });
      context.log(`📝 Transaction sent: ${tx.hash}`, "info");
      context.log("⏳ Waiting for confirmation...", "info");

      const receipt = await tx.wait();
      context.log("✅ Faucet claim successful!", "success");
      context.log("💡 You can claim again in 24 hours", "info");
      context.logHtml(
        `🔍 <a href="https://0x4e454228.explorer.aurora-cloud.dev/tx/${tx.hash}" target="_blank">View transaction</a>`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check for common error messages
      if (errorMessage.includes("cooldown") || errorMessage.includes("wait")) {
        context.log(
          "⏰ Faucet on cooldown. Please wait 24 hours between claims.",
          "warning"
        );
        context.log(
          "💡 Use 'faucet status' to check when you can claim next",
          "info"
        );
      } else {
        context.log(`❌ Failed to claim from faucet: ${errorMessage}`, "error");
      }
    }
  },
};

/**
 * Stats command - Show mining statistics
 */
const statsCommand: Command = {
  name: "stats",
  description: "Show mining statistics",
  usage: "stats",
  category: "mining",
  handler: async (context: CommandContext) => {
    // Check wallet connection
    if (!context.wallet.state.isConnected) {
      context.log("❌ No wallet connected. Use 'connect' first.", "error");
      return;
    }

    const address = context.wallet.state.address;
    if (!address) {
      context.log("❌ No wallet address available", "error");
      return;
    }

    try {
      context.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "info");
      context.log("          ⛏️  MINING STATISTICS", "info");
      context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "info");

      // Check if on correct network
      const currentChainId = context.wallet.state.chainId;
      const expectedChainId = config.OMEGA_NETWORK.chainId;

      if (currentChainId !== expectedChainId) {
        context.log(
          `⚠️  Wrong network detected. Expected chain ID: ${expectedChainId}, Current: ${
            currentChainId || "Unknown"
          }`,
          "warning"
        );
        context.log("🔄 Attempting to switch to Omega Network...", "info");

        const switched = await context.wallet.addOmegaNetwork();
        if (!switched) {
          context.log(
            "❌ Failed to switch network. Please switch to Omega Network manually.",
            "error"
          );
          return;
        }

        // Re-check after switch attempt
        const newChainId = context.wallet.state.chainId;
        if (newChainId !== expectedChainId) {
          context.log(
            "❌ Network switch unsuccessful. Please ensure you're on the Omega Network.",
            "error"
          );
          return;
        }

        context.log("✅ Successfully switched to Omega Network", "success");
      }

      // Get wallet balance
      const balance = await context.wallet.getBalance();
      if (balance) {
        context.log(`💰 Wallet Balance: ${balance}`, "info");
      }

      // Get signer for contract interaction
      const signer = await context.wallet.getSigner();
      if (!signer) {
        context.log("❌ Failed to get wallet signer", "error");
        return;
      }

      // Create contract instance
      const contract = context.getContract?.(
        config.CONTRACT_ADDRESS,
        config.CONTRACT_ABI,
        signer
      );

      if (!contract) {
        context.log("❌ Failed to create contract instance", "error");
        return;
      }

      // Get miner info
      const minerInfo = await contract.getMinerInfo(address);
      const totalMined = formatEther(minerInfo[0]); // _totalMined
      const lastMineTime = Number(minerInfo[1]); // _lastMineTime
      const pendingRewards = formatEther(minerInfo[2]); // _pendingRewards

      context.log(`⛏️  Total Mined: ${totalMined} OMEGA`, "info");
      context.log(`💎 Pending Rewards: ${pendingRewards} OMEGA`, "info");

      if (lastMineTime > 0) {
        context.log(`⏰ Last Mine: ${formatTimestamp(lastMineTime)}`, "info");
      } else {
        context.log("⏰ Last Mine: Never", "info");
      }

      // Get cooldown period
      const cooldownPeriod = Number(await contract.cooldownPeriod());
      context.log(
        `⏱️  Cooldown Period: ${cooldownPeriod / 60} minutes`,
        "info"
      );

      // Check if can mine now
      const currentTime = Math.floor(Date.now() / 1000);
      const canMineNow = currentTime >= lastMineTime + cooldownPeriod;

      if (canMineNow) {
        context.log("✅ Ready to mine!", "success");
      } else {
        const timeUntilMine = lastMineTime + cooldownPeriod - currentTime;
        context.log(
          `⏳ Time until next mine: ${formatDuration(timeUntilMine)}`,
          "warning"
        );
      }

      // Get global stats
      try {
        const totalRewards = await contract.totalRewardsDistributed();
        context.log(
          `🌐 Total Network Rewards: ${formatEther(totalRewards)} OMEGA`,
          "info"
        );
      } catch (error) {
        // Ignore if method doesn't exist
      }

      // Show session earnings if mining
      if (context.miningState && context.miningState.totalEarned > 0) {
        context.log(
          `📊 Session Earnings: ${context.miningState.totalEarned.toFixed(
            4
          )} OMEGA`,
          "success"
        );
      }

      context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "info");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      context.log(`❌ Failed to get mining stats: ${errorMessage}`, "error");
    }
  },
};

/**
 * Sudo Mine Command
 * Super user mining mode with admin bonus
 */
const sudoCommand: Command = {
  name: "sudo",
  description: "Super user mining mode",
  usage: "sudo",
  category: "mining",
  handler: async (context: CommandContext) => {
    context.log("🔐 Sudo access granted!", "info");
    context.log("⚡ Super user mining mode activated!", "success");
    context.log("🚀 Mining with admin privileges...", "output");
    context.log("💰 Admin bonus: +0.1 OMEGA", "success");

    // Play sound effect if available
    if (context.sound) {
      try {
        await context.sound.playBalanceWealthSound();
      } catch {
        // Ignore sound errors
      }
    }
  },
};

/**
 * Export all mining commands
 */
export const miningCommands: Command[] = [
  mineCommand,
  claimCommand,
  faucetCommand,
  statsCommand,
  sudoCommand,
];
