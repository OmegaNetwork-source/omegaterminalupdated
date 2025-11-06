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
import { createCommandLine, createUsageError } from "./command-output-helpers";
import { SVG_ICONS } from "@/lib/utils/svg-icons";

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
 * Create mining status HTML with visual feedback
 */
function createMiningStatusHtml(
  blockNumber: number,
  hash: string,
  spinner: string
): string {
  return `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
      border-radius: 8px;
      padding: 12px 16px;
      margin: 8px 0;
      font-family: 'Courier New', monospace;
      display: flex;
      align-items: center;
      gap: 12px;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--palette-primary, #00d4ff);
        animation: pulse 2s ease-in-out infinite;
      ">
        ${SVG_ICONS.pickaxe.replace('style="display: inline-block; vertical-align: middle;"', 'style="display: inline-block; vertical-align: middle; animation: rotate 2s linear infinite;"')}
        <span style="font-weight: 600; font-size: 0.9em;">Block #${blockNumber}</span>
      </div>
      <div style="
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--palette-text, #ccd4e0);
        font-size: 0.85em;
      ">
        <span style="
          display: inline-block;
          width: 20px;
          text-align: center;
          font-weight: bold;
          color: var(--palette-secondary, #00ff88);
        ">${spinner}</span>
        <span style="
          font-family: 'Courier New', monospace;
          color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
          word-break: break-all;
        ">${hash.substring(0, 16)}...</span>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
  `;
}

/**
 * Create mining success HTML
 */
function createMiningSuccessHtml(reward: string, txHash?: string): string {
  let txLink = "";
  if (txHash) {
    const explorerUrl = `https://0x4e454228.explorer.aurora-cloud.dev/tx/${txHash}`;
    txLink = `
      <div style="margin-top: 8px;">
        <a href="${explorerUrl}" target="_blank" style="
          color: var(--palette-primary, #00d4ff);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9em;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        " onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent)';" onmouseout="this.style.background = 'transparent';">
          ${SVG_ICONS.search}
          View Transaction
        </a>
      </div>
    `;
  }

  return `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 12%, transparent), color-mix(in srgb, var(--palette-success, #00ff88) 8%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
      border-radius: 8px;
      padding: 14px 16px;
      margin: 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    ">
      <div style="color: var(--palette-secondary, #00ff88);">
        ${SVG_ICONS.success}
      </div>
      <div style="flex: 1;">
        <div style="
          font-weight: 600;
          color: var(--palette-secondary, #00ff88);
          font-size: 1em;
          margin-bottom: 4px;
        ">Mining Successful!</div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          font-size: 0.95em;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          ${SVG_ICONS.coin}
          <span>Reward: <strong style="color: var(--palette-secondary, #00ff88);">+${reward} OMEGA</strong></span>
        </div>
        ${txLink}
      </div>
    </div>
  `;
}

/**
 * Create mining start HTML
 */
function createMiningStartHtml(): string {
  return `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 10%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 6%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 25%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 12px 0;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      ">
        <div style="color: var(--palette-primary, #00d4ff);">
          ${SVG_ICONS.pickaxe.replace('style="display: inline-block; vertical-align: middle;"', 'style="display: inline-block; vertical-align: middle; animation: rotate 2s linear infinite;"')}
        </div>
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: var(--palette-primary, #00d4ff);
          text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        ">Mining Session Started</div>
      </div>
      <div style="
        background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
        border-radius: 8px;
        padding: 12px;
        margin-top: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--palette-text, #ccd4e0);
        font-size: 0.9em;
      ">
        ${SVG_ICONS.lightbulb}
        <span>Using relayer to avoid constant MetaMask confirmations</span>
      </div>
      <div style="
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
        color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
        font-size: 0.85em;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        ${SVG_ICONS.activity}
        <span>Mining will continue automatically. Use ${createCommandLine("stop", "stop")} to stop.</span>
      </div>
    </div>
    <style>
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
  `;
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
      const errorHtml = `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4757) 15%, transparent), color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent));
          border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
          border-radius: 12px;
          padding: 16px;
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          <div style="color: var(--palette-error, #ff4757);">
            ${SVG_ICONS.error}
          </div>
          <div style="flex: 1;">
            <div style="
              font-size: 16px;
              font-weight: 600;
              color: var(--palette-error, #ff4757);
              margin-bottom: 8px;
            ">No Wallet Connected</div>
            <div style="color: var(--palette-text, #ccd4e0); font-size: 0.95em;">
              ${createCommandLine("connect", "Connect a wallet first")}
            </div>
          </div>
        </div>
      `;
      context.logHtml(errorHtml);
      return;
    }

    // Check if already mining
    if (context.miningState?.isMining) {
      const warningHtml = `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-warning, #ffa502) 12%, transparent), color-mix(in srgb, var(--palette-warning, #ffa502) 8%, transparent));
          border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 30%, transparent);
          border-radius: 8px;
          padding: 14px 16px;
          margin: 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          <div style="color: var(--palette-warning, #ffa502);">
            ${SVG_ICONS.warning}
          </div>
          <div style="flex: 1; color: var(--palette-text, #ccd4e0);">
            Mining is already running. Use ${createCommandLine("stop", "stop")} to stop it.
          </div>
        </div>
      `;
      context.logHtml(warningHtml);
      return;
    }

    try {
      // Show mining start message
      context.logHtml(createMiningStartHtml());

      // Start mining state
      context.miningState?.startMining();

      // Get current address
      const address = context.wallet.state.address;
      if (!address) {
        const errorHtml = `
          <div style="
            background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4757) 15%, transparent), color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent));
            border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
            border-radius: 12px;
            padding: 16px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <div style="color: var(--palette-error, #ff4757);">
              ${SVG_ICONS.error}
            </div>
            <div style="flex: 1;">
              <div style="
                font-size: 16px;
                font-weight: 600;
                color: var(--palette-error, #ff4757);
              ">No Wallet Address Available</div>
            </div>
          </div>
        `;
        context.logHtml(errorHtml);
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

          // Show mining animation
          const spinnerFrames = ["|", "/", "-", "\\"];
          let spinnerIndex = 0;
          for (let i = 0; i < 8; i++) {
            if (!updaters?.miningActiveRef?.current) break;
            await new Promise((resolve) => setTimeout(resolve, 100));
            const hash = generateFakeHash();
            const spinner = spinnerFrames[spinnerIndex] || "|";
            context.logHtml(
              createMiningStatusHtml(currentCount, hash, spinner)
            );
            spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
          }

          if (!updaters?.miningActiveRef?.current) return;

          // Send mining request to relayer
          const sendingHtml = `
            <div style="
              background: color-mix(in srgb, var(--palette-primary, #00d4ff) 8%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
              border-radius: 8px;
              padding: 10px 14px;
              margin: 6px 0;
              display: flex;
              align-items: center;
              gap: 10px;
              color: var(--palette-text, #ccd4e0);
              font-size: 0.9em;
            ">
              ${SVG_ICONS.refresh.replace('style="display: inline-block; vertical-align: middle;"', 'style="display: inline-block; vertical-align: middle; animation: rotate 1s linear infinite; color: var(--palette-primary, #00d4ff);"')}
              <span>Sending mining request to network...</span>
            </div>
            <style>
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            </style>
          `;
          context.logHtml(sendingHtml);
          const response = await fetch(`${config.RELAYER_URL}/mine`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          });

          // Check response.ok before parsing JSON
          if (!response.ok) {
            const warningHtml = `
              <div style="
                background: color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent);
                border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 25%, transparent);
                border-radius: 8px;
                padding: 10px 14px;
                margin: 6px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--palette-text, #ccd4e0);
                font-size: 0.9em;
              ">
                ${SVG_ICONS.warning}
                <span>Relayer request failed (status ${response.status}). Retrying...</span>
              </div>
            `;
            context.logHtml(warningHtml);
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
            const warningHtml = `
              <div style="
                background: color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent);
                border: 1px solid color-mix(in srgb, var(--palette-warning, #ffa502) 25%, transparent);
                border-radius: 8px;
                padding: 10px 14px;
                margin: 6px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--palette-text, #ccd4e0);
                font-size: 0.9em;
              ">
                ${SVG_ICONS.warning}
                <span>Malformed response from relayer. Retrying...</span>
              </div>
            `;
            context.logHtml(warningHtml);
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
            // Update total earned
            if (updaters) {
              updaters.addToTotalEarned(parseFloat(data.reward));
            }

            context.logHtml(createMiningSuccessHtml(data.reward, data.txHash));
          } else {
            const noRewardHtml = `
              <div style="
                background: color-mix(in srgb, var(--palette-text, #ccd4e0) 5%, transparent);
                border: 1px solid color-mix(in srgb, var(--palette-text, #ccd4e0) 15%, transparent);
                border-radius: 8px;
                padding: 10px 14px;
                margin: 6px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
                font-size: 0.9em;
              ">
                ${SVG_ICONS.pickaxe}
                <span>Block mined (no reward this time)</span>
              </div>
            `;
            context.logHtml(noRewardHtml);
          }
        } catch (error) {
          // Handle mining failures gracefully
          const noRewardHtml = `
            <div style="
              background: color-mix(in srgb, var(--palette-text, #ccd4e0) 5%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-text, #ccd4e0) 15%, transparent);
              border-radius: 8px;
              padding: 10px 14px;
              margin: 6px 0;
              display: flex;
              align-items: center;
              gap: 10px;
              color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
              font-size: 0.9em;
            ">
              ${SVG_ICONS.pickaxe}
              <span>Block mined (no reward this time)</span>
            </div>
          `;
          context.logHtml(noRewardHtml);
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
      const errorHtml = `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4757) 15%, transparent), color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent));
          border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
          border-radius: 12px;
          padding: 16px;
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          <div style="color: var(--palette-error, #ff4757);">
            ${SVG_ICONS.error}
          </div>
          <div style="flex: 1;">
            <div style="
              font-size: 16px;
              font-weight: 600;
              color: var(--palette-error, #ff4757);
              margin-bottom: 8px;
            ">Failed to Start Mining</div>
            <div style="color: var(--palette-text, #ccd4e0); font-size: 0.95em;">
              ${escapeHtml(errorMessage)}
            </div>
          </div>
        </div>
      `;
      context.logHtml(errorHtml);
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
      context.log("❌ No wallet connected.", "error");
      const helpHtml = createCommandLine("connect", "Connect a wallet first");
      context.logHtml(helpHtml);
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
    const status = await (faucetContract.getFaucetStatus as (address: string) => Promise<any>)(address);

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
      context.log("❌ No wallet connected.", "error");
      const helpHtml = createCommandLine("connect", "Connect a wallet first");
      context.logHtml(helpHtml);
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
        const helpHtml = createCommandLine("faucet status", "Check when you can claim next");
        context.logHtml(helpHtml);
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
      context.log("❌ No wallet connected.", "error");
      const helpHtml = createCommandLine("connect", "Connect a wallet first");
      context.logHtml(helpHtml);
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
