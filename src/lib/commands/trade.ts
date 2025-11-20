/**
 * Trading Commands for Polymarket and Kalshi
 * Allows users to place orders, manage positions, and check balances
 */

import type { Command, CommandContext } from "@/types/commands";

/**
 * Connect to Polymarket or Kalshi for trading
 */
async function handleConnect(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  // args[0] = "trade", args[1] = "connect", args[2] = platform
  const platform = args[2]?.toLowerCase();
  
  if (!platform || (platform !== "polymarket" && platform !== "kalshi")) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Usage Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">
            <strong>Usage:</strong> trade connect &lt;polymarket|kalshi&gt;
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-bottom: 12px;">
            <strong>Example:</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade connect polymarket</code>
          </div>
          <div style="
            margin-top: 12px;
            padding: 8px;
            background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
            border-radius: 4px;
            font-size: 11px;
            color: var(--palette-primary, #00d4ff);
          ">
            💡 <strong>Quick Start:</strong><br/>
            • Polymarket: Requires wallet connection (use <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">connect</code> first)<br/>
            • Kalshi: Requires API keys (use <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade set-keys kalshi &lt;apiKey&gt; &lt;privateKey&gt;</code>)
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        🔗 Connecting to ${platform}...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  if (platform === "polymarket") {
    await connectPolymarket(ctx);
  } else if (platform === "kalshi") {
    await connectKalshi(ctx);
  }
}

/**
 * Connect to Polymarket (requires wallet connection)
 */
async function connectPolymarket(ctx: CommandContext): Promise<void> {
  // Polymarket uses wallet-based authentication
  if (!ctx.wallet?.address) {
    const connectHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 100%);
          border: 1px solid var(--palette-primary, #00d4ff);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        ">
          <div style="color: var(--palette-primary, #00d4ff); font-weight: bold; font-size: 16px; margin-bottom: 16px;">
            🔐 Wallet Required for Polymarket Trading
          </div>
          <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 16px;">
            To start trading on Polymarket, you need to connect your wallet first.
          </div>
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
            border-radius: 4px;
          padding: 12px;
          margin-bottom: 12px;
        ">
            <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 8px; font-weight: bold;">
              📋 Setup Steps:
            </div>
            <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 6px;">
              1. Connect your wallet using: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px; cursor: pointer;" class="omega-help-command" data-command="connect">connect</code>
            </div>
            <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 6px;">
              2. Select your network (Ethereum, Polygon, etc.)
            </div>
            <div style="color: var(--palette-text, #e0e0e0);">
              3. Approve the connection in your wallet
          </div>
        </div>
        <div style="
            margin-top: 12px;
          padding: 8px;
            background: color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent);
            border-radius: 4px;
            font-size: 11px;
            color: var(--palette-secondary, #00ff88);
        ">
            💡 <strong>Don't have a wallet?</strong> Use <code style="background: color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent); padding: 2px 6px; border-radius: 3px; cursor: pointer;" class="omega-help-command" data-command="connect">connect</code> to create a new Omega Wallet or connect MetaMask
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(connectHtml);
    return;
  }

  const successHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-success, #16c782) 10%, transparent) 0%, color-mix(in srgb, var(--palette-success, #16c782) 5%, transparent) 100%);
        border: 1px solid var(--palette-success, #16c782);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-success, #16c782); font-weight: bold; font-size: 16px; margin-bottom: 12px;">
          ✅ Connected to Polymarket
        </div>
        <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 8px;">
          <strong>📍 Wallet:</strong> <span style="color: var(--palette-primary, #00d4ff);">${ctx.wallet.address}</span>
        </div>
        <div style="
          margin-top: 12px;
          padding: 8px;
          background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
          border-radius: 4px;
          font-size: 11px;
          color: var(--palette-primary, #00d4ff);
        ">
          💡 You can now place orders using: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade buy polymarket &lt;marketId&gt; &lt;outcome&gt; &lt;amount&gt;</code>
        </div>
      </div>
    </div>
  `;
  ctx.logHtml(successHtml);
}

/**
 * Connect to Kalshi (requires API credentials)
 */
async function connectKalshi(ctx: CommandContext): Promise<void> {
  const walletAddress = ctx.wallet?.address;
  if (!walletAddress) {
    const connectHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 100%);
          border: 1px solid var(--palette-primary, #00d4ff);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        ">
          <div style="color: var(--palette-primary, #00d4ff); font-weight: bold; font-size: 16px; margin-bottom: 16px;">
            🔐 Wallet Required for Kalshi Trading
          </div>
          <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 16px;">
            To start trading on Kalshi, you need to connect your wallet first. This is used to securely store your API credentials.
          </div>
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
            border-radius: 4px;
          padding: 12px;
            margin-bottom: 12px;
        ">
            <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 8px; font-weight: bold;">
              📋 Setup Steps:
          </div>
            <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 6px;">
              1. Connect your wallet: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px; cursor: pointer;" class="omega-help-command" data-command="connect">connect</code>
            </div>
            <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 6px;">
              2. Get your Kalshi API keys from <a href="https://kalshi.com/account/profile" target="_blank" rel="noopener noreferrer" style="color: var(--palette-primary, #00d4ff);">kalshi.com/account/profile</a>
            </div>
            <div style="color: var(--palette-text, #e0e0e0);">
              3. Set your API keys: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade set-keys kalshi &lt;apiKey&gt; &lt;privateKey&gt;</code>
            </div>
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(connectHtml);
    return;
  }

  try {
    // Check if API keys are stored on server
    const response = await fetch(
      `${ctx.config.RELAYER_URL}/api/keys/${walletAddress}/kalshi`
    );

    if (!response.ok || response.status === 404) {
      const infoHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 100%);
            border: 1px solid var(--palette-primary, #00d4ff);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
          ">
            <div style="color: var(--palette-primary, #00d4ff); font-weight: bold; font-size: 16px; margin-bottom: 16px;">
              🔑 Kalshi API Credentials Required
            </div>
            <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 16px;">
              To start trading on Kalshi, you need to set up your API credentials. These are securely stored and encrypted on the server.
            </div>
            <div style="
              background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
              border-radius: 4px;
              padding: 12px;
              margin-bottom: 12px;
            ">
              <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 8px; font-weight: bold;">
                📋 How to Get Your API Keys:
              </div>
              <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 6px;">
                1. Log in to your Kalshi account at <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" style="color: var(--palette-primary, #00d4ff); font-weight: bold;">kalshi.com</a>
              </div>
              <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 6px;">
                2. Go to <a href="https://kalshi.com/account/profile" target="_blank" rel="noopener noreferrer" style="color: var(--palette-primary, #00d4ff);">Account Settings → API Settings</a>
              </div>
              <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 6px;">
                3. Generate a new API Key and Private Key
              </div>
              <div style="color: var(--palette-text, #e0e0e0);">
                4. Copy both keys (you'll need them in the next step)
              </div>
            </div>
            <div style="
              margin-top: 12px;
              padding: 12px;
              background: color-mix(in srgb, var(--palette-secondary, #00ff88) 5%, transparent);
              border: 1px solid var(--palette-secondary, #00ff88);
              border-radius: 4px;
            ">
              <div style="color: var(--palette-secondary, #00ff88); font-weight: bold; margin-bottom: 8px; font-size: 12px;">
                ✅ Next Step: Set Your API Keys
              </div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-bottom: 8px;">
                Once you have your API keys, use this command:
              </div>
              <div style="
                background: color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent);
                padding: 8px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
              font-size: 11px;
              color: var(--palette-secondary, #00ff88);
                margin-bottom: 8px;
            ">
                trade set-keys kalshi &lt;your-api-key&gt; &lt;your-private-key&gt;
              </div>
              <div style="color: var(--palette-text, #e0e0e0); font-size: 10px; font-style: italic;">
                💡 Your keys are encrypted and stored securely. Only you can access them.
              </div>
            </div>
            <div style="
              margin-top: 12px;
              padding: 8px;
              background: color-mix(in srgb, var(--palette-warning, #ffa502) 5%, transparent);
              border-left: 3px solid var(--palette-warning, #ffa502);
              border-radius: 4px;
              font-size: 11px;
              color: var(--palette-warning, #ffa502);
            ">
              ⚠️ <strong>Don't have a Kalshi account?</strong> <a href="https://kalshi.com/signup" target="_blank" rel="noopener noreferrer" style="color: var(--palette-warning, #ffa502); text-decoration: underline;">Sign up here</a> to get started
            </div>
          </div>
        </div>
      `;
      ctx.logHtml(infoHtml);
      return;
    }

    const data = await response.json();
    if (data.has_api_key && data.has_private_key) {
      const successHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: linear-gradient(135deg, color-mix(in srgb, var(--palette-success, #16c782) 10%, transparent) 0%, color-mix(in srgb, var(--palette-success, #16c782) 5%, transparent) 100%);
            border: 1px solid var(--palette-success, #16c782);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
          ">
            <div style="color: var(--palette-success, #16c782); font-weight: bold; font-size: 16px; margin-bottom: 12px;">
              ✅ Connected to Kalshi
            </div>
            <div style="color: var(--palette-text, #e0e0e0); margin-bottom: 8px;">
              <strong>📍 Wallet:</strong> <span style="color: var(--palette-primary, #00d4ff);">${walletAddress}</span>
            </div>
            <div style="
              margin-top: 12px;
              padding: 8px;
              background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
              border-radius: 4px;
              font-size: 11px;
              color: var(--palette-primary, #00d4ff);
            ">
              💡 You can now place orders using: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade buy kalshi &lt;ticker&gt; &lt;side&gt; &lt;count&gt;</code>
            </div>
          </div>
        </div>
      `;
      ctx.logHtml(successHtml);
    } else {
      const errorHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
            border: 1px solid var(--palette-error, #ff4d4f);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
          ">
            <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Kalshi API keys incomplete</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
              Use: <code style="background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade set-keys kalshi &lt;apiKey&gt; &lt;privateKey&gt;</code>
            </div>
          </div>
        </div>
      `;
      ctx.logHtml(errorHtml);
    }
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Error checking Kalshi credentials</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">${error.message}</div>
          <div style="color: var(--palette-primary, #00d4ff); font-size: 11px;">
            💡 Use: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade set-keys kalshi &lt;apiKey&gt; &lt;privateKey&gt;</code>
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

/**
 * Set API keys for trading (stored encrypted on server)
 */
async function handleSetKeys(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const platform = args[1]?.toLowerCase();
  const apiKey = args[2];
  const privateKey = args[3];

  if (!platform || (platform !== "polymarket" && platform !== "kalshi")) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Usage Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            <strong>Usage:</strong> trade set-keys &lt;polymarket|kalshi&gt; &lt;apiKey&gt; [privateKey]
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  if (!apiKey) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ API key is required</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  if (platform === "kalshi" && !privateKey) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Kalshi requires both API key and private key</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  // Get wallet address (required for server-side storage)
  const walletAddress = ctx.wallet?.address;
  if (!walletAddress) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Wallet not connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            💡 Connect your wallet first using 'connect'
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  try {
    // Store keys encrypted on server
    const response = await fetch(`${ctx.config.RELAYER_URL}/api/keys/store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        platform,
        api_key: apiKey,
        private_key: privateKey || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to store API keys");
    }

    const result = await response.json();
    const successHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-success, #16c782) 10%, transparent) 0%, color-mix(in srgb, var(--palette-success, #16c782) 5%, transparent) 100%);
          border: 1px solid var(--palette-success, #16c782);
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="color: var(--palette-success, #16c782); font-weight: bold; font-size: 16px; margin-bottom: 12px;">
            ✅ ${platform.charAt(0).toUpperCase() + platform.slice(1)} API keys stored securely
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            💡 Keys are encrypted and stored server-side
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(successHtml);
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Failed to store API keys</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

/**
 * Place a buy order
 */
async function handleBuy(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const platform = args[1]?.toLowerCase();
  
  if (!platform || (platform !== "polymarket" && platform !== "kalshi")) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Usage Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">
            <strong>Usage:</strong> trade buy &lt;polymarket|kalshi&gt; &lt;marketId&gt; &lt;outcome&gt; &lt;amount&gt;
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-bottom: 4px;">
            <strong>Example:</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade buy polymarket 0x123... YES 10</code>
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
            <strong>Example:</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade buy kalshi KXNFL-25OCT28-BARB yes 5</code>
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  const marketId = args[2];
  const outcome = args[3]?.toUpperCase();
  const amount = parseFloat(args[4] || "0");

  // Check if user provided a market slug instead of market ID
  const isSlug = marketId && !marketId.startsWith("0x") && !marketId.match(/^KX[A-Z0-9-]+$/);

  if (!marketId || !outcome || !amount || amount <= 0) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 12px;">❌ Invalid Parameters</div>
          ${isSlug ? `
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent);
            border: 1px solid var(--palette-primary, #00d4ff);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
          ">
            <div style="color: var(--palette-primary, #00d4ff); font-weight: bold; margin-bottom: 8px; font-size: 13px;">
              ⚠️ Market Slug Detected
            </div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">
              You provided: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 15%, transparent); padding: 2px 6px; border-radius: 3px;">${marketId}</code>
            </div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-bottom: 8px;">
              <strong>Issue:</strong> This looks like a market <strong>slug</strong> (URL-friendly name), but the <code>trade buy</code> command requires a <strong>market ID</strong> (contract address or ticker).
            </div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-bottom: 8px;">
              <strong>For Polymarket:</strong> Market IDs are contract addresses starting with <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 15%, transparent); padding: 2px 6px; border-radius: 3px;">0x...</code>
            </div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-bottom: 8px;">
              <strong>For Kalshi:</strong> Market IDs are tickers like <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 15%, transparent); padding: 2px 6px; border-radius: 3px;">KXNFL-25OCT28-BARB</code>
            </div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
              <strong>💡 How to find the Market ID:</strong>
              <ul style="margin: 8px 0 0 20px; padding: 0;">
                <li style="margin-bottom: 4px;">Use <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 15%, transparent); padding: 2px 6px; border-radius: 3px; cursor: pointer;" class="omega-help-command" data-command="polymarket search ${marketId}">polymarket search ${marketId}</code> to find the market</li>
                <li style="margin-bottom: 4px;">Check the market details page on Polymarket.com</li>
                <li style="margin-bottom: 4px;">The Market ID is shown in the market information</li>
              </ul>
            </div>
          </div>
          ` : ''}
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 8px;">
            <strong>Usage:</strong> trade buy &lt;platform&gt; &lt;marketId&gt; &lt;outcome&gt; &lt;amount&gt;
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px; margin-bottom: 4px;">
            <strong>Example (Polymarket):</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade buy polymarket 0x1234567890abcdef1234567890abcdef12345678 YES 10</code>
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 11px;">
            <strong>Example (Kalshi):</strong> <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade buy kalshi KXNFL-25OCT28-BARB yes 5</code>
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 100%);
        border: 1px solid var(--palette-primary, #00d4ff);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00d4ff); font-weight: bold; font-size: 14px; margin-bottom: 12px;">
          📊 Placing buy order on ${platform}...
        </div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 6px;">
          <strong>Market:</strong> <span style="color: var(--palette-primary, #00d4ff);">${marketId}</span>
        </div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 6px;">
          <strong>Outcome:</strong> <span style="color: var(--palette-secondary, #00ff88);">${outcome}</span>
        </div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
          <strong>Amount:</strong> <span style="color: var(--palette-success, #16c782); font-weight: bold;">$${amount}</span>
        </div>
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  if (platform === "polymarket") {
    await placePolymarketOrder(ctx, marketId, outcome, amount, "buy");
  } else if (platform === "kalshi") {
    await placeKalshiOrder(ctx, marketId, outcome.toLowerCase(), amount, "buy");
  }
}

/**
 * Place a sell order
 */
async function handleSell(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const platform = args[1]?.toLowerCase();
  
  if (!platform || (platform !== "polymarket" && platform !== "kalshi")) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Usage Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            <strong>Usage:</strong> trade sell &lt;polymarket|kalshi&gt; &lt;marketId&gt; &lt;outcome&gt; &lt;amount&gt;
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  const marketId = args[2];
  const outcome = args[3]?.toUpperCase();
  const amount = parseFloat(args[4] || "0");

  if (!marketId || !outcome || !amount || amount <= 0) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Invalid parameters</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            <strong>Usage:</strong> trade sell &lt;platform&gt; &lt;marketId&gt; &lt;outcome&gt; &lt;amount&gt;
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 100%);
        border: 1px solid var(--palette-primary, #00d4ff);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div style="color: var(--palette-primary, #00d4ff); font-weight: bold; font-size: 14px; margin-bottom: 12px;">
          📊 Placing sell order on ${platform}...
        </div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 6px;">
          <strong>Market:</strong> <span style="color: var(--palette-primary, #00d4ff);">${marketId}</span>
        </div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: 6px;">
          <strong>Outcome:</strong> <span style="color: var(--palette-error, #ff4d4f);">${outcome}</span>
        </div>
        <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
          <strong>Amount:</strong> <span style="color: var(--palette-error, #ff4d4f); font-weight: bold;">$${amount}</span>
        </div>
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  if (platform === "polymarket") {
    await placePolymarketOrder(ctx, marketId, outcome, amount, "sell");
  } else if (platform === "kalshi") {
    await placeKalshiOrder(ctx, marketId, outcome.toLowerCase(), amount, "sell");
  }
}

/**
 * Place order on Polymarket
 */
async function placePolymarketOrder(
  ctx: CommandContext,
  marketId: string,
  outcome: string,
  amount: number,
  side: "buy" | "sell"
): Promise<void> {
  if (!ctx.wallet?.address) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Wallet not connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            💡 Use 'connect' to connect your wallet
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  try {
    // Polymarket order placement would go through their API
    // This is a placeholder - actual implementation would call Polymarket's order API
    const infoHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 100%);
          border: 1px solid var(--palette-primary, #00d4ff);
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="color: var(--palette-primary, #00d4ff); font-weight: bold; font-size: 14px; margin-bottom: 12px;">
            ⚠️  Polymarket trading integration in development
          </div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            💡 For now, use the link in market details to trade on <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" style="color: var(--palette-primary, #00d4ff);">Polymarket.com</a>
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(infoHtml);
    
    // In production, this would:
    // 1. Get current market price
    // 2. Create order payload
    // 3. Sign transaction with wallet
    // 4. Submit to Polymarket API
    // 5. Return order confirmation
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Order failed</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

/**
 * Place order on Kalshi
 */
async function placeKalshiOrder(
  ctx: CommandContext,
  ticker: string,
  side: string,
  count: number,
  action: "buy" | "sell"
): Promise<void> {
  const walletAddress = ctx.wallet?.address;
  if (!walletAddress) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Wallet not connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            💡 Connect your wallet first using 'connect'
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  try {
    // Kalshi order placement through relayer (uses stored API keys)
    const response = await fetch(`${ctx.config.RELAYER_URL}/kalshi/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        order_data: {
          ticker,
          side: side === "yes" ? "yes" : "no",
          action: action === "buy" ? "buy" : "sell",
          count,
          type: "limit", // Default to limit order
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Order failed");
    }

    const result = await response.json();
    const successHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-success, #16c782) 10%, transparent) 0%, color-mix(in srgb, var(--palette-success, #16c782) 5%, transparent) 100%);
          border: 1px solid var(--palette-success, #16c782);
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="color: var(--palette-success, #16c782); font-weight: bold; font-size: 16px; margin-bottom: 12px;">
            ✅ Order placed successfully!
          </div>
          ${result.order_id ? `<div style="color: var(--palette-text, #e0e0e0); margin-bottom: 6px;"><strong>Order ID:</strong> <span style="color: var(--palette-primary, #00d4ff);">${result.order_id}</span></div>` : ''}
          ${result.status ? `<div style="color: var(--palette-text, #e0e0e0);"><strong>Status:</strong> <span style="color: var(--palette-primary, #00d4ff);">${result.status}</span></div>` : ''}
        </div>
      </div>
    `;
    ctx.logHtml(successHtml);
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Order failed</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: ${error.message.includes("API keys not configured") ? '8px' : '0'};">${error.message}</div>
          ${error.message.includes("API keys not configured") ? `<div style="color: var(--palette-primary, #00d4ff); font-size: 11px;">💡 Use: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade set-keys kalshi &lt;apiKey&gt; &lt;privateKey&gt;</code></div>` : ''}
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

/**
 * Check trading balance
 */
async function handleBalance(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const platform = args[1]?.toLowerCase() || "polymarket";

  if (platform !== "polymarket" && platform !== "kalshi") {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Usage Error</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            <strong>Usage:</strong> trade balance [polymarket|kalshi]
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        💰 Fetching ${platform} balance...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  if (platform === "polymarket") {
    await getPolymarketBalance(ctx);
  } else {
    await getKalshiBalance(ctx);
  }
}

/**
 * Get Polymarket balance
 */
async function getPolymarketBalance(ctx: CommandContext): Promise<void> {
  if (!ctx.wallet?.address) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Wallet not connected</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  try {
    // Query Polymarket for user balance
    const response = await fetch(
      `${ctx.config.RELAYER_URL}/polymarket/balance/${ctx.wallet.address}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch balance");
    }

    const data = await response.json();
    
    let balanceHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 16px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          padding: 8px;
          border-bottom: 2px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        ">
          💰 Polymarket Balance
        </div>
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="margin-bottom: 12px;">
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Available Balance:</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 18px; font-weight: bold;">$${data.balance || "0.00"}</div>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">In Positions:</div>
            <div style="color: var(--palette-text, #e0e0e0);">$${data.in_positions || "0.00"}</div>
          </div>
          <div>
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Total Value:</div>
            <div style="color: var(--palette-success, #16c782); font-size: 16px; font-weight: bold;">$${data.total_value || "0.00"}</div>
          </div>
        </div>
      </div>
    `;

    ctx.logHtml(balanceHtml);
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Failed to fetch balance</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

/**
 * Get Kalshi balance
 */
async function getKalshiBalance(ctx: CommandContext): Promise<void> {
  const walletAddress = ctx.wallet?.address;
  if (!walletAddress) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Wallet not connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            💡 Connect your wallet first using 'connect'
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  try {
    const response = await fetch(
      `${ctx.config.RELAYER_URL}/kalshi/portfolio/balance?wallet_address=${walletAddress}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch balance");
    }

    const data = await response.json();
    
    let balanceHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 16px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          padding: 8px;
          border-bottom: 2px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        ">
          💰 Kalshi Balance
        </div>
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 16px;
        ">
          <div style="margin-bottom: 12px;">
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">Available Balance:</div>
            <div style="color: var(--palette-text, #e0e0e0); font-size: 18px; font-weight: bold;">$${data.balance || "0.00"}</div>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="color: var(--palette-primary, #00bcf2); font-weight: 600; margin-bottom: 4px;">In Positions:</div>
            <div style="color: var(--palette-text, #e0e0e0);">$${data.in_positions || "0.00"}</div>
          </div>
        </div>
      </div>
    `;

    ctx.logHtml(balanceHtml);
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Failed to fetch balance</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

/**
 * View open positions
 */
async function handlePositions(
  ctx: CommandContext,
  args: string[]
): Promise<void> {
  const platform = args[1]?.toLowerCase() || "polymarket";

  const infoHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        color: var(--palette-primary, #00d4ff);
        font-size: 12px;
        padding: 8px;
        border-left: 3px solid var(--palette-primary, #00d4ff);
        background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
      ">
        📊 Fetching ${platform} positions...
      </div>
    </div>
  `;
  ctx.logHtml(infoHtml);

  if (platform === "polymarket") {
    await getPolymarketPositions(ctx);
  } else {
    await getKalshiPositions(ctx);
  }
}

/**
 * Get Polymarket positions
 */
async function getPolymarketPositions(ctx: CommandContext): Promise<void> {
  if (!ctx.wallet?.address) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Wallet not connected</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  try {
    const response = await fetch(
      `${ctx.config.RELAYER_URL}/polymarket/positions/${ctx.wallet.address}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch positions");
    }

    const positions = await response.json();
    
    if (!positions || positions.length === 0) {
      const noPositionsHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
            border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          ">
            <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">No open positions</div>
          </div>
        </div>
      `;
      ctx.logHtml(noPositionsHtml);
      return;
    }

    // Display positions in HTML format
    let positionsHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 16px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          padding: 8px;
          border-bottom: 2px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        ">
          📊 Open Positions (${positions.length})
        </div>
    `;

    positions.forEach((pos: any, index: number) => {
      positionsHtml += `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        ">
          <div style="font-weight: 600; margin-bottom: 8px;">${pos.market || pos.ticker}</div>
          <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);">
            Outcome: <strong>${pos.outcome}</strong> | 
            Quantity: <strong>${pos.quantity}</strong> | 
            Avg Price: <strong>$${pos.avg_price}</strong>
          </div>
        </div>
      `;
    });

    positionsHtml += `</div>`;
    ctx.logHtml(positionsHtml);
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Failed to fetch positions</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">${error.message}</div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

/**
 * Get Kalshi positions
 */
async function getKalshiPositions(ctx: CommandContext): Promise<void> {
  const walletAddress = ctx.wallet?.address;
  if (!walletAddress) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Wallet not connected</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
            💡 Connect your wallet first using 'connect'
          </div>
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
    return;
  }

  try {
    const response = await fetch(
      `${ctx.config.RELAYER_URL}/kalshi/portfolio/positions?wallet_address=${walletAddress}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch positions");
    }

    const data = await response.json();
    const positions = data.positions || data || [];
    
    if (!positions || positions.length === 0) {
      const noPositionsHtml = `
        <div style="
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          color: var(--palette-text, #e0e0e0);
          padding: 12px;
        ">
          <div style="
            background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
            border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          ">
            <div style="color: var(--palette-text, #e0e0e0); font-size: 14px;">No open positions</div>
          </div>
        </div>
      `;
      ctx.logHtml(noPositionsHtml);
      return;
    }

    // Display positions in HTML format
    let positionsHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          font-size: 16px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 16px;
          padding: 8px;
          border-bottom: 2px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        ">
          📊 Open Positions (${positions.length})
        </div>
    `;

    positions.forEach((pos: any, index: number) => {
      positionsHtml += `
        <div style="
          background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
          border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        ">
          <div style="font-weight: 600; margin-bottom: 8px;">${pos.ticker || pos.market || "Unknown"}</div>
          <div style="font-size: 11px; color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);">
            Side: <strong>${pos.side || pos.outcome}</strong> | 
            Count: <strong>${pos.count || pos.shares || 0}</strong> | 
            Avg Price: <strong>$${pos.average_price || pos.avg_price || "0.00"}</strong>
          </div>
        </div>
      `;
    });

    positionsHtml += `</div>`;
    ctx.logHtml(positionsHtml);
  } catch (error: any) {
    const errorHtml = `
      <div style="
        font-family: 'Courier New', monospace;
        line-height: 1.6;
        color: var(--palette-text, #e0e0e0);
        padding: 12px;
      ">
        <div style="
          background: color-mix(in srgb, var(--palette-error, #ff4d4f) 10%, transparent);
          border: 1px solid var(--palette-error, #ff4d4f);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="color: var(--palette-error, #ff4d4f); font-weight: bold; margin-bottom: 8px;">❌ Failed to fetch positions</div>
          <div style="color: var(--palette-text, #e0e0e0); font-size: 12px; margin-bottom: ${error.message.includes("API keys not configured") ? '8px' : '0'};">${error.message}</div>
          ${error.message.includes("API keys not configured") ? `<div style="color: var(--palette-primary, #00d4ff); font-size: 11px;">💡 Use: <code style="background: color-mix(in srgb, var(--palette-primary, #00bcf2) 10%, transparent); padding: 2px 6px; border-radius: 3px;">trade set-keys kalshi &lt;apiKey&gt; &lt;privateKey&gt;</code></div>` : ''}
        </div>
      </div>
    `;
    ctx.logHtml(errorHtml);
  }
}

/**
 * Show help
 */
function showHelp(ctx: CommandContext): void {
  const helpLines: string[] = [
    "trade",
    "",
    "Unified trading commands for prediction markets",
    "",
    "→ Usage: trade <connect|balance|buy|sell|positions|set-keys|help> [params]",
    "",
    "═ Connection & Setup ═",
    "",
    "trade connect polymarket",
    "Connect to Polymarket (uses wallet)",
    "→ Usage: trade connect <polymarket|kalshi>",
    "",
    "trade connect kalshi",
    "Connect to Kalshi (requires API keys)",
    "→ Usage: trade connect <polymarket|kalshi>",
    "",
    "trade set-keys",
    "Store API keys for trading (encrypted server-side)",
    "→ Usage: trade set-keys <polymarket|kalshi> <apiKey> [privateKey]",
    "  Example: trade set-keys kalshi YOUR_API_KEY YOUR_PRIVATE_KEY",
    "",
    "═ Trading Actions ═",
    "",
    "trade buy",
    "Place a buy order on a prediction market",
    "→ Usage: trade buy <polymarket|kalshi> <marketId> <outcome> <amount>",
    "  Example: trade buy polymarket 0x123... YES 10",
    "  Example: trade buy kalshi KXNFL-25OCT28-BARB yes 5",
    "",
    "trade sell",
    "Place a sell order on a prediction market",
    "→ Usage: trade sell <polymarket|kalshi> <marketId> <outcome> <amount>",
    "  Example: trade sell polymarket 0x123... YES 10",
    "  Example: trade sell kalshi KXNFL-25OCT28-BARB yes 5",
    "",
    "═ Portfolio Management ═",
    "",
    "trade balance",
    "Check your trading balance",
    "→ Usage: trade balance [polymarket|kalshi]",
    "  Example: trade balance kalshi",
    "",
    "trade positions",
    "View your open positions",
    "→ Usage: trade positions [polymarket|kalshi]",
    "  Example: trade positions kalshi",
    "",
    "💡 Tip",
    "",
  ];

  let helpHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 20px;
        text-align: center;
        padding: 8px;
        border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
        border-radius: 4px;
      ">
        ═══ PREDICTION MARKET TRADING ═══
      </div>
  `;

  helpLines.forEach((line) => {
    if (line.trim() === "") {
      helpHtml += `<div style="margin: 4px 0;"></div>`;
    } else if (line.startsWith("═ ")) {
      helpHtml += `
        <div style="
          font-size: 14px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin: 16px 0 8px 0;
          padding: 4px 0;
        ">
          ${line}
        </div>
      `;
    } else if (line.startsWith("→ Usage:")) {
      helpHtml += `
        <div style="
          color: var(--palette-secondary, #00ff88);
          margin-left: 20px;
          margin-top: 2px;
          font-size: 0.9em;
        ">
          ${line}
        </div>
      `;
    } else if (line.startsWith("  Example:")) {
      helpHtml += `
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          margin-left: 40px;
          margin-top: 2px;
          font-size: 0.85em;
        ">
          ${line}
        </div>
      `;
    } else if (line === "💡 Tip") {
      helpHtml += `
        <div style="
          margin-top: 24px;
          padding: 12px;
          border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
          border-radius: 4px;
          text-align: center;
          background: color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent);
        ">
          <div style="
            color: var(--palette-primary, #00d4ff);
            font-weight: bold;
            margin-bottom: 8px;
          ">
            ${line}
          </div>
          <div style="
            color: var(--palette-text, #e0e0e0);
            font-size: 0.9em;
          ">
            Get API keys: <a href="https://kalshi.com/account/profile" target="_blank" rel="noopener noreferrer" style="color: var(--palette-primary, #00d4ff);">Kalshi</a> → kalshi.com/account/profile | Polymarket → Uses wallet connection
          </div>
        </div>
      `;
    } else {
      const isFullCommand = line.startsWith("trade ") && line.length < 100;
      const isSubcommand = line.length > 0 &&
        line.trim().length < 50 &&
        !line.includes(" ") &&
        line === line.toLowerCase() &&
        !line.startsWith("Connect") &&
        !line.startsWith("Store") &&
        !line.startsWith("Place") &&
        !line.startsWith("Check") &&
        !line.startsWith("View") &&
        !line.startsWith("Unified") &&
        !line.startsWith("Get") &&
        line.match(/^[a-z0-9-]+$/);

      if (isFullCommand || isSubcommand) {
        let commandText = line;
        if (isFullCommand) {
          commandText = line.replace(/ <[^>]+>/g, "").replace(/ \[[^\]]+\]/g, "").trim();
        } else if (isSubcommand) {
          commandText = `trade ${line}`;
        }

        const escapedCommand = commandText.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        const displayText = isFullCommand
          ? line.replace(/ <[^>]+>/g, "").replace(/ \[[^\]]+\]/g, "")
          : line;

        helpHtml += `
          <div
            class="omega-help-command"
            data-command="${escapedCommand}"
            style="
              color: var(--palette-secondary, #00ff88);
              font-weight: bold;
              margin-left: 0;
              margin-top: 8px;
              font-family: 'Courier New', monospace;
              cursor: pointer;
              display: inline-block;
              padding: 2px 4px;
              border-radius: 3px;
              transition: all 0.2s ease;
              user-select: none;
            "
            onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
            onmouseout="this.style.background = 'transparent'; this.style.textShadow = 'none';"
            title="Click to add '${escapedCommand}' to terminal input"
          >
            ${displayText}
          </div>
        `;
      } else {
        helpHtml += `
          <div style="
            color: var(--palette-text, #e0e0e0);
            margin-left: 0;
            margin-top: 2px;
            line-height: 1.4;
          ">
            ${line}
          </div>
        `;
      }
    }
  });

  helpHtml += `</div>`;
  ctx.logHtml(helpHtml);
}

async function handler(ctx: CommandContext, args: string[]): Promise<void> {
  const subcommand = args[1]?.toLowerCase();

  switch (subcommand) {
    case "connect":
      await handleConnect(ctx, args);
      break;
    case "set-keys":
      await handleSetKeys(ctx, args);
      break;
    case "buy":
      await handleBuy(ctx, args);
      break;
    case "sell":
      await handleSell(ctx, args);
      break;
    case "balance":
      await handleBalance(ctx, args);
      break;
    case "positions":
      await handlePositions(ctx, args);
      break;
    case "help":
    default:
      showHelp(ctx);
  }
}

export const tradeCommand: Command = {
  name: "trade",
  description: "Trade on Polymarket and Kalshi prediction markets",
  usage: "trade <connect|buy|sell|balance|positions|set-keys|help> [params]",
  category: "markets",
  handler,
};

export const tradeCommands: Command[] = [tradeCommand];

