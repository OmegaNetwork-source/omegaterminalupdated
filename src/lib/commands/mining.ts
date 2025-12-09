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
import {
  Contract,
  JsonRpcProvider,
  formatEther,
  BrowserProvider,
} from "ethers";
import { createCommandLine, createUsageError, createClickableCommand } from "./command-output-helpers";
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
        ${SVG_ICONS.pickaxe.replace(
          'style="display: inline-block; vertical-align: middle;"',
          'style="display: inline-block; vertical-align: middle; animation: rotate 2s linear infinite;"'
        )}
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
function createMiningSuccessHtml(reward: string, txHash?: string, blockNumber?: number): string {
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
        ">✅ Mining Successful!${blockNumber ? ` - Block #${blockNumber}` : ''}</div>
        <div style="
          color: var(--palette-text, #ccd4e0);
          font-size: 0.95em;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        ">
          ${SVG_ICONS.coin}
          <span>Reward: <strong style="color: var(--palette-secondary, #00ff88);">+${reward} OMEGA</strong></span>
        </div>
        ${txLink}
        <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
          <button onclick="(function() {
            try {
              if (window.__omegaExecuteCommand) {
                window.__omegaExecuteCommand('stop');
                // Auto-scroll terminal to show output
                if (window.__omegaScrollTerminalToBottom) {
                  setTimeout(() => window.__omegaScrollTerminalToBottom(), 100);
                  setTimeout(() => window.__omegaScrollTerminalToBottom(), 500);
                }
              } else if (window.__omegaGuiExecuteCommand) {
                window.__omegaGuiExecuteCommand('stop');
              } else if (window.terminal && window.terminal.executeCommand) {
                window.terminal.executeCommand('stop');
              } else {
                console.error('No command execution method available');
              }
            } catch (error) {
              console.error('Error executing stop command:', error);
            }
          })()" style="
            background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4757) 80%, transparent), color-mix(in srgb, var(--palette-error, #ff4757) 60%, transparent));
            border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 50%, transparent);
            border-radius: 6px;
            color: #fff;
            font-size: 0.85em;
            font-weight: 600;
            padding: 8px 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          " onmouseover="this.style.opacity = '0.9'; this.style.transform = 'translateY(-1px)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'translateY(0)';">
            ⏹️ Stop Mining
          </button>
          <button onclick="(function() {
            try {
              if (window.__omegaExecuteCommand) {
                window.__omegaExecuteCommand('claim');
                // Auto-scroll terminal to show output
                if (window.__omegaScrollTerminalToBottom) {
                  setTimeout(() => window.__omegaScrollTerminalToBottom(), 100);
                  setTimeout(() => window.__omegaScrollTerminalToBottom(), 500);
                }
              } else if (window.__omegaGuiExecuteCommand) {
                window.__omegaGuiExecuteCommand('claim');
              } else if (window.terminal && window.terminal.executeCommand) {
                window.terminal.executeCommand('claim');
              } else {
                console.error('No command execution method available');
              }
            } catch (error) {
              console.error('Error executing claim command:', error);
            }
          })()" style="
            background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 80%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 60%, transparent));
            border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 50%, transparent);
            border-radius: 6px;
            color: #fff;
            font-size: 0.85em;
            font-weight: 600;
            padding: 8px 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          " onmouseover="this.style.opacity = '0.9'; this.style.transform = 'translateY(-1px)';" onmouseout="this.style.opacity = '1'; this.style.transform = 'translateY(0)';">
            💰 Claim Reward
          </button>
        </div>
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
          ${SVG_ICONS.pickaxe.replace(
            'style="display: inline-block; vertical-align: middle;"',
            'style="display: inline-block; vertical-align: middle; animation: rotate 2s linear infinite;"'
          )}
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
        <span>Mining will continue automatically. Use ${createClickableCommand(
          "stop",
          "stop"
        )} to stop.</span>
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
              ${createClickableCommand("connect", "connect", "Connect a wallet first")}
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
            Mining is already running. Use ${createCommandLine(
              "stop",
              "stop"
            )} to stop it.
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
      console.log(`[Mine] Mining for address: ${address}`);
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

      // Show immediate mining status - users see this right away
      const initialMiningStatusHtml = `
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
            ${SVG_ICONS.pickaxe.replace(
              'style="display: inline-block; vertical-align: middle;"',
              'style="display: inline-block; vertical-align: middle; animation: rotate 2s linear infinite;"'
            )}
            <span style="font-weight: 600; font-size: 0.9em;">Initializing Mining...</span>
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
            ">|</span>
            <span style="
              font-family: 'Courier New', monospace;
              color: color-mix(in srgb, var(--palette-text, #ccd4e0) 70%, transparent);
            ">Preparing mining session...</span>
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
      context.logHtml(initialMiningStatusHtml);

      // Wait a moment to ensure updaters are set up, then start mining
      // Use setTimeout to ensure the loop starts asynchronously
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify updaters are available before starting
      const updaters = (window as any).__omegaMiningUpdaters;
      console.log("[Mine] Checking updaters:", {
        hasUpdaters: !!updaters,
        hasMiningActiveRef: !!updaters?.miningActiveRef,
        miningActive: updaters?.miningActiveRef?.current,
      });
      
      if (!updaters) {
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
              ">Mining System Not Ready</div>
              <div style="color: var(--palette-text, #ccd4e0); font-size: 0.95em; margin-top: 8px;">
                Please refresh the page and try again.
              </div>
            </div>
          </div>
        `;
        context.logHtml(errorHtml);
        context.miningState?.stopMining();
        return;
      }

      // Ensure mining is marked as active
      if (!updaters.miningActiveRef?.current) {
        updaters.miningActiveRef.current = true;
        console.log("[Mine] Set miningActiveRef to true");
      }

      // Show that mining is starting
      const startingHtml = `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent), color-mix(in srgb, var(--palette-primary, #00d4ff) 6%, transparent));
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 25%, transparent);
          border-radius: 8px;
          padding: 12px 16px;
          margin: 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          <div style="color: var(--palette-secondary, #00ff88);">
            ${SVG_ICONS.success}
          </div>
          <div style="flex: 1; color: var(--palette-text, #ccd4e0);">
            <strong style="color: var(--palette-secondary, #00ff88);">Mining Started!</strong> The mining process will continue automatically.
          </div>
        </div>
      `;
      context.logHtml(startingHtml);
      console.log("[Mine] Starting mining loop...");

      // Define mining loop
      const mineLoop = async () => {
        // Get updaters from window (refresh on each iteration)
        const updaters = (window as any).__omegaMiningUpdaters;

        // Check if still mining using the boolean ref
        if (!updaters?.miningActiveRef?.current) {
          console.log("[Mine] Mining stopped, exiting loop");
          return;
        }

        console.log("[Mine] Starting mining attempt...");

        try {
          const currentCount = context.miningState?.mineCount || 0;
          const nextBlockNumber = currentCount + 1;

          // Show mining animation with status updates - VISUAL FEEDBACK FOR USERS
          const spinnerFrames = ["|", "/", "-", "\\"];
          let spinnerIndex = 0;
          // Show mining status updates - display progress in terminal LIVE
          // This creates the visual mining effect users see
          for (let i = 0; i < 8; i++) {
            if (!updaters?.miningActiveRef?.current) break;
            await new Promise((resolve) => setTimeout(resolve, 150));
            const hash = generateFakeHash();
            const spinner = spinnerFrames[spinnerIndex] || "|";
            // Show mining status in terminal - LIVE VISUAL FEEDBACK
            // Users see this happening in real-time
            context.logHtml(
              createMiningStatusHtml(nextBlockNumber, hash, spinner)
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
              ${SVG_ICONS.refresh.replace(
                'style="display: inline-block; vertical-align: middle;"',
                'style="display: inline-block; vertical-align: middle; animation: rotate 1s linear infinite; color: var(--palette-primary, #00d4ff);"'
              )}
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
            // Log relayer response for debugging
            console.log("[Mine] Relayer response:", {
              success: data.success,
              reward: data.reward,
              txHash: data.txHash,
              transactionHash: data.transactionHash,
              blockNumber: data.blockNumber,
              status: response.status,
              fullData: data,
            });
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

          if (data.success && data.reward && (typeof data.reward === 'number' ? data.reward > 0 : parseFloat(String(data.reward)) > 0)) {
            // Format reward for display
            const rewardValue = typeof data.reward === 'string' ? parseFloat(data.reward) : Number(data.reward);
            const formattedReward = formatBalance(rewardValue);

            // Increment mine count and update total earned on success
            if (updaters) {
              updaters.incrementMineCount();
              updaters.addToTotalEarned(rewardValue);
            }

            // Get the block number for display
            const blockNumber = data.blockNumber || (context.miningState?.mineCount || 0) + 1;

            // Show success message IMMEDIATELY - this is what users see first
            context.logHtml(
              createMiningSuccessHtml(
                formattedReward,
                data.txHash || data.transactionHash,
                blockNumber
              )
            );

            // Verify transaction exists on-chain if we have a txHash (happens in background)
            if (data.txHash || data.transactionHash) {
              const txHash = data.txHash || data.transactionHash;
              const explorerUrl = `https://0x4e454228.explorer.aurora-cloud.dev/tx/${txHash}`;

              console.log(`[Mine] Verifying transaction ${txHash} on-chain...`);

              // Log network info
              try {
                const provider = context.wallet.getProvider();
                if (provider) {
                  const browserProvider =
                    provider instanceof BrowserProvider
                      ? provider
                      : new BrowserProvider(provider);
                  const network = await browserProvider.getNetwork();
                  const chainId = Number(network.chainId);
                  console.log(`[Mine] Current network: Chain ID ${chainId}`);
                  console.log(
                    `[Mine] Expected network: Chain ID ${config.OMEGA_NETWORK.chainIdDecimal}`
                  );

                  if (chainId !== config.OMEGA_NETWORK.chainIdDecimal) {
                    context.log(
                      `⚠️  Warning: You're on Chain ID ${chainId}, but Omega Network is ${config.OMEGA_NETWORK.chainIdDecimal}`,
                      "warning"
                    );
                    context.log(
                      "💡 The transaction may be on a different network. Check the explorer link below.",
                      "warning"
                    );
                  }
                }
              } catch (networkError) {
                console.warn("[Mine] Could not check network:", networkError);
              }

              // Show explorer link immediately
              context.logHtml(
                `🔍 <a href="${explorerUrl}" target="_blank">View transaction on explorer</a>`
              );

              // Poll for transaction confirmation with retries
              // Use direct RPC provider to ensure we're querying Omega Network
              try {
                // Create direct RPC provider for Omega Network
                const directProvider = new JsonRpcProvider(
                  config.OMEGA_RPC_URL
                );
                console.log(`[Mine] Using direct RPC: ${config.OMEGA_RPC_URL}`);

                // Also try wallet provider as fallback
                let walletProvider = null;
                try {
                  const provider = context.wallet.getProvider();
                  if (provider) {
                    walletProvider =
                      provider instanceof BrowserProvider
                        ? provider
                        : new BrowserProvider(provider);
                  }
                } catch (e) {
                  console.warn("[Mine] Could not get wallet provider:", e);
                }

                // Poll for transaction receipt (max 30 seconds, 15 attempts)
                let receipt = null;
                const maxAttempts = 15;
                const pollInterval = 2000; // 2 seconds

                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                  try {
                    // Try direct RPC provider first (more reliable)
                    receipt = await directProvider.getTransactionReceipt(
                      txHash
                    );
                    if (receipt) {
                      console.log(
                        `[Mine] Found transaction via direct RPC (attempt ${attempt})`
                      );
                      break;
                    }
                  } catch (e) {
                    // Try wallet provider as fallback
                    if (walletProvider) {
                      try {
                        receipt = await walletProvider.getTransactionReceipt(
                          txHash
                        );
                        if (receipt) {
                          console.log(
                            `[Mine] Found transaction via wallet provider (attempt ${attempt})`
                          );
                          break;
                        }
                      } catch (e2) {
                        // Both failed, continue polling
                      }
                    }
                  }

                  if (attempt < maxAttempts) {
                    await new Promise((resolve) =>
                      setTimeout(resolve, pollInterval)
                    );
                  }
                }

                if (receipt) {
                  console.log(`[Mine] Transaction confirmed on-chain:`, {
                    blockNumber: receipt.blockNumber,
                    status: receipt.status,
                    gasUsed: receipt.gasUsed.toString(),
                    to: receipt.to,
                    from: receipt.from,
                    logs: receipt.logs?.length || 0,
                  });

                  // Check if transaction is to the mining contract
                  const isMiningContract =
                    receipt.to?.toLowerCase() ===
                    config.CONTRACT_ADDRESS.toLowerCase();
                  console.log(
                    `[Mine] Transaction to mining contract:`,
                    isMiningContract
                  );
                  console.log(
                    `[Mine] Expected contract: ${config.CONTRACT_ADDRESS}`
                  );
                  console.log(`[Mine] Actual to address: ${receipt.to}`);

                  // Try to decode transaction to see what function was called
                  if (receipt.to && isMiningContract) {
                    try {
                      const tx = await directProvider.getTransaction(txHash);
                      if (tx && tx.data) {
                        console.log(
                          `[Mine] Transaction data (first 10 bytes):`,
                          tx.data.slice(0, 10)
                        );
                        // Check if it's a transfer or contract call
                        if (tx.data === "0x" || tx.data.length === 2) {
                          console.log(
                            `[Mine] This appears to be a native token transfer (not a contract call)`
                          );
                        } else {
                          console.log(
                            `[Mine] This is a contract function call`
                          );
                        }
                      }
                    } catch (e) {
                      console.warn(
                        `[Mine] Could not fetch transaction details:`,
                        e
                      );
                    }
                  }

                  // Check transaction logs for BlockMined event
                  if (receipt.logs && receipt.logs.length > 0) {
                    console.log(
                      `[Mine] Transaction has ${receipt.logs.length} log entries`
                    );
                    // Try to decode logs if we have the contract
                    try {
                      const contract = new Contract(
                        config.CONTRACT_ADDRESS,
                        config.CONTRACT_ABI,
                        directProvider
                      );
                      for (const log of receipt.logs) {
                        try {
                          const parsedLog = contract.interface.parseLog({
                            topics: log.topics as string[],
                            data: log.data,
                          });
                          if (parsedLog) {
                            console.log(
                              `[Mine] Log event:`,
                              parsedLog.name,
                              parsedLog.args
                            );
                            if (parsedLog.name === "BlockMined") {
                              console.log(`[Mine] BlockMined event found!`, {
                                miner: parsedLog.args.miner,
                                reward: parsedLog.args.reward?.toString(),
                              });
                            }
                          }
                        } catch (e) {
                          // Not a contract event we can parse
                        }
                      }
                    } catch (e) {
                      console.warn(`[Mine] Could not parse logs:`, e);
                    }
                  } else {
                    console.log(
                      `[Mine] Transaction has no logs - may be a direct transfer`
                    );
                  }

                  if (receipt.status === 0) {
                    context.log(
                      "❌ Transaction failed on-chain (status: 0)",
                      "error"
                    );
                    context.log(
                      "💡 The relayer reported success but the transaction failed. Check the transaction on the explorer.",
                      "warning"
                    );
                  } else {
                    // Transaction succeeded
                    context.log("✅ Transaction confirmed on-chain", "success");
                    context.log(`📦 Block: ${receipt.blockNumber}`, "info");

                    if (!isMiningContract) {
                      context.log(
                        "💡 Transaction is not to the mining contract - rewards may be sent directly via transfer",
                        "info"
                      );
                    } else if (receipt.logs && receipt.logs.length === 0) {
                      context.log(
                        "💡 Transaction to mining contract but no events - may be using claimTo() directly",
                        "info"
                      );
                    }

                    // Check balance after a short delay to see if it increased
                    setTimeout(async () => {
                      try {
                        const newBalance = await context.wallet.getBalance();
                        if (newBalance) {
                          console.log(
                            `[Mine] Balance after mining: ${newBalance} OMEGA`
                          );
                          context.log(
                            `💰 Current Balance: ${newBalance} OMEGA`,
                            "info"
                          );
                        }
                      } catch (e) {
                        // Ignore balance check errors
                      }
                    }, 2000);
                  }
                } else {
                  console.log(
                    `[Mine] Transaction not found after ${maxAttempts} attempts (${
                      (maxAttempts * pollInterval) / 1000
                    }s)`
                  );
                  context.log(
                    "⏳ Transaction not found on-chain yet. It may still be pending or the transaction hash may be invalid.",
                    "warning"
                  );
                  context.log(
                    "💡 Check the explorer link above to verify the transaction status.",
                    "info"
                  );
                }
              } catch (verifyError) {
                console.warn(
                  "[Mine] Could not verify transaction:",
                  verifyError
                );
                context.log(
                  "⚠️  Could not verify transaction on-chain. Check the explorer link above.",
                  "warning"
                );
              }
            }
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
          console.error("[Mine] Error in mining loop:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorHtml = `
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
              <span>Mining attempt failed: ${escapeHtml(errorMessage)}. Will retry...</span>
            </div>
          `;
          context.logHtml(errorHtml);
        }

        // Continue mining loop - show next attempt immediately with visual feedback
        const currentUpdaters = (window as any).__omegaMiningUpdaters;
        if (currentUpdaters?.miningActiveRef?.current) {
          // Show that we're preparing for next mining attempt
          const nextAttemptHtml = `
            <div style="
              background: color-mix(in srgb, var(--palette-primary, #00d4ff) 5%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent);
              border-radius: 8px;
              padding: 10px 14px;
              margin: 6px 0;
              display: flex;
              align-items: center;
              gap: 10px;
              color: var(--palette-text, #ccd4e0);
              font-size: 0.85em;
            ">
              ${SVG_ICONS.activity}
              <span>Preparing next mining attempt...</span>
            </div>
          `;
          context.logHtml(nextAttemptHtml);
          
          // Schedule next mining attempt
          const timeoutId = setTimeout(() => {
            // Double-check mining is still active before continuing
            const checkUpdaters = (window as any).__omegaMiningUpdaters;
            if (checkUpdaters?.miningActiveRef?.current) {
              mineLoop().catch((error) => {
                console.error("[Mine] Error in mining loop:", error);
                const errorHtml = `
                  <div style="
                    background: color-mix(in srgb, var(--palette-error, #ff4757) 10%, transparent);
                    border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 25%, transparent);
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
                    <span>Mining error occurred. Retrying in 8 seconds...</span>
                  </div>
                `;
                context.logHtml(errorHtml);
                // Retry after error
                if (checkUpdaters?.miningActiveRef?.current) {
                  const retryTimeoutId = setTimeout(mineLoop, 8000);
                  if (checkUpdaters?.miningTimeoutRef) {
                    checkUpdaters.miningTimeoutRef.current = retryTimeoutId as unknown as number;
                  }
                }
              });
            }
          }, 8000); // 8 second intervals (matches vanilla implementation)
          
          if (currentUpdaters?.miningTimeoutRef) {
            currentUpdaters.miningTimeoutRef.current = timeoutId as unknown as number;
          }
        } else {
          console.log("[Mine] Mining stopped, not continuing loop");
        }
      };

      // Start the mining loop IMMEDIATELY - users see mining happening right away
      // Wrap in try-catch to handle any startup errors
      mineLoop().catch((error) => {
        console.error("[Mine] Failed to start mining loop:", error);
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
              ">Failed to Start Mining</div>
              <div style="color: var(--palette-text, #ccd4e0); font-size: 0.95em; margin-top: 8px;">
                ${escapeHtml(error instanceof Error ? error.message : String(error))}
              </div>
            </div>
          </div>
        `;
        context.logHtml(errorHtml);
        context.miningState?.stopMining();
      });
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
 * Uses relayer API endpoint (matches vanilla implementation)
 * Rewards are accumulated on the server in rewardsByAddress, not in the contract
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
      const helpHtml = `<div style="margin: 8px 0;">${createClickableCommand("connect", "connect", "Connect a wallet first")}</div>`;
      context.logHtml(helpHtml);
      return;
    }

    try {
      // Get address
      const address = context.wallet.state.address;
      if (!address) {
        context.log("❌ No wallet address available", "error");
        return;
      }

      // Display info message (matches vanilla implementation)
      context.log("💸 Sending claim request to network...", "info");

      // Send claim request to relayer (matches vanilla implementation)
      const response = await fetch(`${config.RELAYER_URL}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      // Check response status
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Claim request failed";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        context.log(`❌ Claim failed: ${errorMessage}`, "error");
        return;
      }

      // Parse response
      const data = await response.json();

      // Handle response (matches vanilla implementation)
      if (data.success) {
        const amount = data.amount || "0";
        const formattedAmount = formatBalance(parseFloat(amount));
        
        // Show success message with rich HTML formatting
        const claimSuccessHtml = `
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
              ">Claim Successful!</div>
              <div style="
                color: var(--palette-text, #ccd4e0);
                font-size: 0.95em;
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 8px;
              ">
                ${SVG_ICONS.coin}
                <span>Claimed: <strong style="color: var(--palette-secondary, #00ff88);">${formattedAmount}</strong></span>
              </div>
              ${data.txHash ? `
                <div style="margin-top: 8px;">
                  <a href="https://0x4e454228.explorer.aurora-cloud.dev/tx/${data.txHash}" target="_blank" style="
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
              ` : ''}
            </div>
          </div>
        `;
        context.logHtml(claimSuccessHtml);
      } else {
        const errorMessage = data.error || data.message || "Claim failed";
        context.log(`❌ Claim failed: ${errorMessage}`, "error");

        // If no rewards, provide helpful message
        if (
          errorMessage.toLowerCase().includes("no rewards") ||
          errorMessage.toLowerCase().includes("no pending")
        ) {
          context.log(
            "💡 Note: Rewards accumulate on the server after mining.",
            "info"
          );
          context.log("💡 Try mining first using the 'mine' command.", "info");
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      context.log(`❌ Claim error: ${errorMessage}`, "error");
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
    const status = await (
      faucetContract.getFaucetStatus as (address: string) => Promise<any>
    )(address);

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
      const helpHtml = `<div style="margin: 8px 0;">${createClickableCommand("connect", "connect", "Connect a wallet first")}</div>`;
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
        const helpHtml = createCommandLine(
          "faucet status",
          "Check when you can claim next"
        );
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
      const helpHtml = `<div style="margin: 8px 0;">${createClickableCommand("connect", "connect", "Connect a wallet first")}</div>`;
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
