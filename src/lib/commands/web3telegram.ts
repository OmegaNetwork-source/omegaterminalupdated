/**
 * Web3Telegram Commands
 * Decentralized Telegram messaging through iExec infrastructure
 * Allows secure messaging to Telegram accounts using on-chain protected data
 */

import type { Command, CommandContext } from "@/types/commands";
import {
  createClickableCommand,
  createCommandLine,
  createUsageError,
  createHelpOutput,
  createHelpTextLine,
  createEmptyLine,
} from "./command-output-helpers";

// ============================================================================
// Network Configuration
// ============================================================================

// Using Arbitrum Sepolia for testing (free testnet ETH available)
// TODO: Switch to Bellecour (134) for production
const REQUIRED_CHAIN_ID = 421614; // Arbitrum Sepolia Testnet
const REQUIRED_CHAIN_ID_HEX = "0x66eee"; // 421614 in hex

const REQUIRED_NETWORK = {
  chainId: REQUIRED_CHAIN_ID_HEX,
  chainName: "Arbitrum Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://sepolia.arbiscan.io"],
};

/**
 * Check if user is on the correct network for Web3Telegram
 */
async function checkAndSwitchNetwork(
  context: CommandContext
): Promise<boolean> {
  try {
    const provider = context.wallet.getProvider();
    if (!provider) {
      context.log("❌ No provider available", "error");
      return false;
    }

    // Get current network
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);

    // If already on required network, we're good
    if (currentChainId === REQUIRED_CHAIN_ID) {
      return true;
    }

    // User is on wrong network - prompt to switch
    const networkNames: Record<number, string> = {
      1: "Ethereum Mainnet",
      5: "Goerli",
      11155111: "Sepolia",
      137: "Polygon",
      80001: "Mumbai",
      1313161768: "Aurora",
      134: "iExec Bellecour",
      421614: "Arbitrum Sepolia",
    };

    const currentNetwork =
      networkNames[currentChainId] || `Chain ${currentChainId}`;
    const requiredNetwork =
      networkNames[REQUIRED_CHAIN_ID] || `Chain ${REQUIRED_CHAIN_ID}`;

    context.log("⚠️ WRONG NETWORK DETECTED", "warning");
    context.log("", "output");
    context.log(
      `📍 Current Network: ${currentNetwork} (${currentChainId})`,
      "output"
    );
    context.log(
      `🎯 Required Network: ${requiredNetwork} (${REQUIRED_CHAIN_ID})`,
      "output"
    );
    context.log("", "output");
    context.log("🔄 Attempting to switch networks automatically...", "info");
    context.log("💡 Please approve the network switch in your wallet.", "info");

    // Try to switch network
    try {
      // First try switching to existing network
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: REQUIRED_CHAIN_ID_HEX }],
      });

      context.log("", "output");
      context.log(`✅ Successfully switched to ${requiredNetwork}!`, "success");
      context.log("", "output");

      // Wait a moment for the switch to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return true;
    } catch (switchError: any) {
      // If network doesn't exist (error code 4902), add it
      if (switchError.code === 4902) {
        context.log("", "output");
        context.log(
          `📝 ${requiredNetwork} not found. Adding it to your wallet...`,
          "info"
        );

        try {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [REQUIRED_NETWORK],
          });

          context.log(
            `✅ ${requiredNetwork} network added and switched!`,
            "success"
          );
          context.log("", "output");

          // Wait a moment for the add to complete
          await new Promise((resolve) => setTimeout(resolve, 1000));

          return true;
        } catch (addError: any) {
          context.log("", "output");
          context.log(`❌ Failed to add ${requiredNetwork} network`, "error");
          context.log("", "output");
          context.log("💡 MANUAL SETUP REQUIRED:", "info");
          context.log("Add this network to MetaMask:", "output");
          context.log(
            `  Network Name: ${REQUIRED_NETWORK.chainName}`,
            "output"
          );
          context.log(`  RPC URL: ${REQUIRED_NETWORK.rpcUrls[0]}`, "output");
          context.log(`  Chain ID: ${REQUIRED_CHAIN_ID}`, "output");
          context.log(
            `  Symbol: ${REQUIRED_NETWORK.nativeCurrency.symbol}`,
            "output"
          );
          context.log(
            `  Explorer: ${REQUIRED_NETWORK.blockExplorerUrls[0]}`,
            "output"
          );
          return false;
        }
      } else if (switchError.code === 4001) {
        // User rejected the request
        context.log("", "output");
        context.log("❌ Network switch rejected", "error");
        context.log(
          `💡 Please switch to ${requiredNetwork} manually and try again.`,
          "info"
        );
        return false;
      } else {
        throw switchError;
      }
    }
  } catch (error: any) {
    context.log("", "output");
    context.log(`❌ Error checking network: ${error.message}`, "error");
    context.log("", "output");
    context.log(
      `💡 Please switch to ${REQUIRED_NETWORK.chainName} network manually:`,
      "info"
    );
    context.log("  1. Open MetaMask", "output");
    context.log("  2. Click network dropdown", "output");
    context.log(`  3. Select or add '${REQUIRED_NETWORK.chainName}'`, "output");
    return false;
  }
}

/**
 * Common checks for all Web3Telegram commands
 */
async function performCommonChecks(
  context: CommandContext,
  skipNetworkCheck: boolean = false
): Promise<{ success: boolean; telegram?: any; wallet?: any }> {
  // Check wallet connection
  if (!context.wallet.state.isConnected) {
    context.log("❌ Please connect your wallet first.", "error");
    const helpHtml = createCommandLine("connect", "Connect your wallet");
    context.logHtml(helpHtml);
    return { success: false };
  }

  // Check network and auto-switch if needed (skip for balance/deposit commands that work on any network)
  if (!skipNetworkCheck) {
    const onCorrectNetwork = await checkAndSwitchNetwork(context);
    if (!onCorrectNetwork) {
      return { success: false };
    }
  }

  // Check telegram context
  if (!(context as any).telegram) {
    context.log("❌ Web3Telegram provider not available.", "error");
    context.log("💡 Please refresh the page and try again.", "info");
    return { success: false };
  }

  return { 
    success: true, 
    telegram: (context as any).telegram,
    wallet: context.wallet 
  };
}

/**
 * Main tg command - Web3Telegram help and overview
 */
export const tgCommand: Command = {
  name: "tg",
  description: "Web3Telegram - Decentralized Telegram messaging",
  usage: "tg [help]",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    context.log("📱 WEB3TELEGRAM - DECENTRALIZED MESSAGING", "info");
    context.log("══════════════════════════════════════════", "output");
    context.log("", "output");

    context.log("🎯 OVERVIEW:", "info");
    context.log(
      "Web3Telegram enables secure, decentralized Telegram messaging through",
      "output"
    );
    context.log(
      "iExec's confidential computing infrastructure. Your Telegram Chat ID is",
      "output"
    );
    context.log(
      "encrypted and stored on-chain, and you control who can send you messages.",
      "output"
    );
    context.log("", "output");

    context.log("📋 GETTING STARTED:", "info");
    context.log(
      "1. Get your Chat ID from @IExecWeb3TelegramBot on Telegram",
      "output"
    );
    context.log("2. Setup your account with 'tg-setup'", "output");
    context.log("3. Get xRLC tokens and deposit with 'tg-deposit'", "output");
    context.log("4. Add contacts with 'tg-add-contact'", "output");
    context.log("5. Send messages with 'tg-send'", "output");
    context.log("", "output");

    context.log("🔧 SETUP & ACCOUNT:", "info");
    const setupHtml = createCommandLine(
      "tg-setup <chatId> <name>",
      "Setup your Telegram account"
    );
    const statusHtml = createCommandLine("tg-status", "View account status");
    const recoverHtml = createCommandLine(
      "tg-recover",
      "Recover account from blockchain"
    );
    const resetHtml = createCommandLine(
      "tg-reset",
      "Clear local data and reset"
    );

    context.logHtml(setupHtml);
    context.logHtml(statusHtml);
    context.logHtml(recoverHtml);
    context.logHtml(resetHtml);
    context.log("", "output");

    context.log("💬 MESSAGING:", "info");
    const sendHtml = createCommandLine(
      "tg-send <label> <message>",
      "Send a message to a contact"
    );
    const contactsHtml = createCommandLine(
      "tg-contacts",
      "View your contact list"
    );
    const addHtml = createCommandLine(
      "tg-add-contact <label> <address>",
      "Add a new contact"
    );
    const removeHtml = createCommandLine(
      "tg-remove-contact <label>",
      "Remove a contact"
    );
    const refreshHtml = createCommandLine(
      "tg-refresh",
      "Refresh contact list"
    );

    context.logHtml(sendHtml);
    context.logHtml(contactsHtml);
    context.logHtml(addHtml);
    context.logHtml(removeHtml);
    context.logHtml(refreshHtml);
    context.log("", "output");

    context.log("🔐 ACCESS CONTROL:", "info");
    const grantHtml = createCommandLine(
      "tg-grant <address> [count]",
      "Grant sending access to someone"
    );
    const accessHtml = createCommandLine(
      "tg-access",
      "View who can message you"
    );
    const revokeHtml = createCommandLine(
      "tg-revoke <address>",
      "Revoke access from someone"
    );

    context.logHtml(grantHtml);
    context.logHtml(accessHtml);
    context.logHtml(revokeHtml);
    context.log("", "output");

    context.log("💰 WALLET & BALANCE:", "info");
    const balanceHtml = createCommandLine(
      "tg-balance",
      "Check xRLC balance and stake"
    );
    const depositHtml = createCommandLine(
      "tg-deposit <amount>",
      "Deposit xRLC to send messages"
    );

    context.logHtml(balanceHtml);
    context.logHtml(depositHtml);
    context.log("", "output");

    context.log("⚙️ CONFIGURATION & DEBUG:", "info");
    const configHtml = createCommandLine(
      "tg-config [key] [value]",
      "View or update settings"
    );
    const debugHtml = createCommandLine(
      "tg-debug",
      "Diagnostic information"
    );

    context.logHtml(configHtml);
    context.logHtml(debugHtml);
    context.log("", "output");

    context.log("💡 CROSS-DEVICE SUPPORT:", "info");
    context.log(
      "Your account is stored on-chain and automatically recovered when you",
      "output"
    );
    context.log(
      "connect the same wallet on different devices. No need to setup again!",
      "output"
    );
    context.log("", "output");

    context.log("🔐 SECURITY:", "info");
    context.log(
      "Web3Telegram uses iExec's confidential computing to keep your Chat ID",
      "output"
    );
    context.log(
      "encrypted while allowing authorized addresses to send you messages.",
      "output"
    );
  },
};

/**
 * tg-setup command - Setup Telegram account
 */
export const tgSetupCommand: Command = {
  name: "tg-setup",
  description: "Setup your Web3Telegram account",
  usage: "tg-setup <chatId> <name>",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    // Perform common checks (wallet, network, telegram context)
    const checks = await performCommonChecks(context);
    if (!checks.success || !checks.telegram) {
      return;
    }

    const telegram = checks.telegram;

    // Check for --force flag
    const hasForceFlag = args.includes("--force");

    // Check if already setup (unless --force is used)
    if (telegram.state.userProtectedData && !hasForceFlag) {
      context.log("ℹ️ You have an existing Web3Telegram account!", "info");
      context.log("", "output");
      context.log(
        `📱 Protected Data Address: ${telegram.state.userProtectedData.address}`,
        "output"
      );
      context.log(
        `👤 Name: ${telegram.state.userProtectedData.name}`,
        "output"
      );
      context.log("", "output");
      
      // Check if schema is correct
      const hasCorrectSchema = telegram.state.userProtectedData.schema?.telegram_chatId;
      
      if (hasCorrectSchema) {
        context.log("✅ Account has correct schema!", "success");
        context.log("", "output");
        const statusHtml = createCommandLine("tg-status", "View detailed status");
        context.logHtml(statusHtml);
        return;
      } else {
        context.log("⚠️ WARNING: Old account has incorrect schema!", "warning");
        context.log("", "output");
        context.log("💡 TO CREATE NEW ACCOUNT WITH CORRECT SCHEMA:", "info");
        context.log("Add --force flag to create a new protected data:", "output");
        context.log("", "output");
        const forceHtml = createCommandLine(
          "tg-setup 6403690595 Abubaker --force",
          "Create new account"
        );
        context.logHtml(forceHtml);
        context.log("", "output");
        context.log("📝 NOTE: This will create a NEW protected data on-chain.", "info");
        context.log("You'll have multiple protected data, but only the new one will work for messaging.", "output");
        return;
      }
    }

    // Check if parameters provided (filter out --force from args)
    const filteredArgs = args.filter(arg => arg !== "--force");
    if (!filteredArgs[1] || !filteredArgs[2]) {
      context.log("📱 WEB3TELEGRAM ACCOUNT SETUP", "info");
      context.log("══════════════════════════════", "output");
      context.log("", "output");

      context.log("📋 STEP 1: GET YOUR CHAT ID", "info");
      context.log(
        "1. Open Telegram and search for @IExecWeb3TelegramBot",
        "output"
      );
      context.log("2. Start a conversation and send /start", "output");
      context.log(
        "3. The bot will reply with your Chat ID (a number)",
        "output"
      );
      context.log("", "output");

      context.log("📋 STEP 2: RUN SETUP COMMAND", "info");
      context.log("", "output");

      const usageHtml = createUsageError("tg-setup <chatId> <name>", [
        'tg-setup 123456789 "My Telegram"',
        'tg-setup 987654321 "Work Account"',
        'tg-setup 555555555 "Personal Telegram"',
      ]);
      context.logHtml(usageHtml);

      context.log("", "output");
      context.log("⚠️ IMPORTANT:", "warning");
      context.log(
        "• Your Chat ID will be encrypted and stored on-chain",
        "output"
      );
      context.log(
        "• This requires a blockchain transaction (gas fees apply)",
        "output"
      );
      context.log(
        "• The name is a label to identify your protected data",
        "output"
      );
      context.log("", "output");

      context.log("💡 TIP:", "info");
      context.log("If your name has spaces, wrap it in quotes:", "output");
      context.log('  tg-setup 123456789 "My Telegram Account"', "output");

      return;
    }

    const chatId = filteredArgs[1];
    const name = filteredArgs.slice(2).join(" ");
    
    // If --force flag was used, show a note
    if (hasForceFlag && telegram.state.userProtectedData) {
      context.log("⚠️ CREATING NEW ACCOUNT (--force)", "warning");
      context.log("", "output");
      context.log("You already have an account but are creating a new one.", "output");
      context.log(`Old address: ${telegram.state.userProtectedData.address}`, "output");
      context.log("", "output");
    }

    // Validate Chat ID (should be numeric)
    if (!/^\d+$/.test(chatId)) {
      context.log("❌ Invalid Chat ID. It should be a number.", "error");
      context.log("", "output");
      context.log('💡 Example: tg-setup 123456789 "My Telegram"', "info");
      return;
    }

    try {
      context.log("🔄 Setting up your Web3Telegram account...", "info");
      context.log("", "output");
      context.log(`📱 Chat ID: ${chatId}`, "output");
      context.log(`👤 Name: ${name}`, "output");
      context.log("", "output");
      context.log("⏳ Please wait while we:", "info");
      context.log("  1. Encrypt your Chat ID", "output");
      context.log("  2. Create protected data on-chain", "output");
      context.log("  3. Store the encrypted data", "output");
      context.log("", "output");
      context.log(
        "💡 You'll need to confirm the transaction in your wallet...",
        "info"
      );

      const result = await telegram.setupAccount({
        chatId,
        name,
      });

      if (result.success) {
        context.log("", "output");
        context.log("✅ SUCCESS! Your account is now setup!", "success");
        context.log("", "output");
        context.log("📊 ACCOUNT DETAILS:", "info");
        context.log(
          `🔗 Protected Data Address: ${result.protectedDataAddress}`,
          "output"
        );
        context.log(`👤 Name: ${name}`, "output");
        context.log("", "output");

        context.log("🎉 WHAT YOU CAN DO NOW:", "info");
        context.log("", "output");

        const html = `
          <div style="padding-left: 20px;">
            <div style="margin: 8px 0;">
              <span class="omega-help-command" data-command="tg-status" 
                    style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; 
                           font-family: 'Courier New', monospace; padding: 4px 8px; border-radius: 4px; 
                           background: rgba(0, 255, 136, 0.1); transition: all 0.2s ease;"
                    onmouseover="this.style.background = 'rgba(0, 255, 136, 0.2)';"
                    onmouseout="this.style.background = 'rgba(0, 255, 136, 0.1)';">
                📊 tg-status
              </span>
              <span style="color: var(--palette-text, #ccd4e0); margin-left: 10px;">→ View your account details</span>
            </div>
            <div style="margin: 8px 0;">
              <span class="omega-help-command" data-command="tg-add-contact " 
                    style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; 
                           font-family: 'Courier New', monospace; padding: 4px 8px; border-radius: 4px; 
                           background: rgba(0, 255, 136, 0.1); transition: all 0.2s ease;"
                    onmouseover="this.style.background = 'rgba(0, 255, 136, 0.2)';"
                    onmouseout="this.style.background = 'rgba(0, 255, 136, 0.1)';">
                📇 tg-add-contact
              </span>
              <span style="color: var(--palette-text, #ccd4e0); margin-left: 10px;">→ Add contacts to send messages</span>
            </div>
            <div style="margin: 8px 0;">
              <span class="omega-help-command" data-command="tg-grant " 
                    style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; 
                           font-family: 'Courier New', monospace; padding: 4px 8px; border-radius: 4px; 
                           background: rgba(0, 255, 136, 0.1); transition: all 0.2s ease;"
                    onmouseover="this.style.background = 'rgba(0, 255, 136, 0.2)';"
                    onmouseout="this.style.background = 'rgba(0, 255, 136, 0.1)';">
                🔐 tg-grant
              </span>
              <span style="color: var(--palette-text, #ccd4e0); margin-left: 10px;">→ Let others send you messages</span>
            </div>
          </div>
        `;

        context.logHtml(html);

        context.log("", "output");
        context.log("💡 SHARE THIS ADDRESS:", "info");
        context.log(
          `Others need your protected data address to add you as a contact:`,
          "output"
        );

        const addressHtml = `
          <div style="margin: 12px 0; padding: 12px; background: rgba(0, 212, 255, 0.1); 
                      border: 1px solid var(--palette-primary, #00d4ff); border-radius: 8px;">
            <div style="font-family: monospace; color: var(--palette-primary, #00d4ff); 
                        cursor: pointer; word-break: break-all;" 
                 onclick="navigator.clipboard.writeText('${result.protectedDataAddress}'); 
                          this.style.color='#00ff88'; 
                          setTimeout(() => this.style.color='var(--palette-primary, #00d4ff)', 1000);"
                 title="Click to copy">
              ${result.protectedDataAddress}
            </div>
            <div style="font-size: 0.85em; color: var(--palette-text, #ccd4e0); opacity: 0.8; margin-top: 6px;">
              Click to copy to clipboard
            </div>
          </div>
        `;

        context.logHtml(addressHtml);
      } else {
        context.log("", "output");
        context.log(`❌ Setup failed: ${result.error}`, "error");
        context.log("", "output");
        context.log("💡 TROUBLESHOOTING:", "info");
        context.log("• Make sure your wallet is connected", "output");
        context.log("• Ensure you have enough ETH for gas fees", "output");
        context.log("• Check that you're on the correct network", "output");
        context.log(
          "• Verify your Chat ID is correct (numbers only)",
          "output"
        );
        context.log("", "output");
        context.log("Try again with:", "info");
        context.log(`  tg-setup ${chatId} "${name}"`, "output");
      }
    } catch (error: any) {
      context.log("", "output");
      context.log(
        `❌ Error: ${error.message || "Failed to setup account"}`,
        "error"
      );
      context.log("", "output");
      context.log(
        "💡 Please try again or check your wallet connection.",
        "info"
      );
    }
  },
};

/**
 * tg-send command - Send a message to a contact
 */
export const tgSendCommand: Command = {
  name: "tg-send",
  description: "Send a Telegram message to a contact",
  usage: "tg-send <label> <message>",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!args[1] || args.length < 3) {
      const usageHtml = createUsageError("tg-send <label> <message>", [
        "tg-send alice Hello, how are you?",
        "tg-send bob Check out this new feature!",
        "tg-send team Meeting at 3pm today",
      ]);
      context.logHtml(usageHtml);
      return;
    }

    // Perform common checks (wallet, network, telegram context)
    const checks = await performCommonChecks(context);
    if (!checks.success || !checks.telegram) {
      return;
    }

    const telegram = checks.telegram;

    if (!telegram.state.isInitialized) {
      context.log("❌ Web3Telegram SDK not initialized.", "error");
      context.log("💡 Please wait for initialization to complete.", "info");
      return;
    }

    const label = args[1];
    const message = args.slice(2).join(" ");

    try {
      // First, check if the contact exists
      const contact = telegram.getContactByLabel(label);

      if (!contact) {
        context.log(`❌ Contact "${label}" not found!`, "error");
        context.log("", "output");
        context.log("💡 You need to add this contact first.", "info");
        context.log("", "output");

        // Check if they have any contacts
        const contactCount = telegram.state.contacts?.length || 0;

        if (contactCount === 0) {
          context.log("📭 You don't have any contacts yet.", "info");
          context.log("", "output");
          context.log("🎯 TO ADD A CONTACT:", "info");
          context.log("1. Get their protected data address", "output");
          context.log("2. Run: tg-add-contact <label> <address>", "output");
          context.log("", "output");
          const addHtml = createCommandLine(
            "tg-add-contact alice 0x123...",
            "Example: Add a contact"
          );
          context.logHtml(addHtml);
        } else {
          context.log(`📇 You have ${contactCount} contact(s).`, "info");
          context.log("", "output");
          const contactsHtml = createCommandLine(
            "tg-contacts",
            "View your contacts"
          );
          context.logHtml(contactsHtml);
        }

        return;
      }

      context.log(`📤 Sending message to "${label}"...`, "info");
      context.log("", "output");
      context.log(`👤 Recipient: ${label}`, "output");
      context.log(
        `🔗 Protected Data: ${contact.protectedDataAddress}`,
        "output"
      );
      context.log(`💬 Message: "${message}"`, "output");
      context.log("", "output");
      context.log("⏳ Processing through iExec infrastructure...", "info");

      const result = await telegram.sendMessage({
        label,
        message,
      });

      if (result.success) {
        context.log("", "output");
        context.log("✅ Message sent successfully!", "success");
        context.log("", "output");
        if (result.taskId) {
          context.log("📊 DELIVERY INFO:", "info");
          context.log(`🔗 Task ID: ${result.taskId}`, "output");
          context.log("", "output");
          context.log("💡 Your message is being delivered!", "info");
          context.log(
            "The recipient will receive it on Telegram shortly.",
            "output"
          );
        }
      } else {
        context.log("", "output");
        context.log(`❌ Failed to send message: ${result.error}`, "error");
        context.log("", "output");

        // Provide specific troubleshooting based on error
        context.log("💡 POSSIBLE CAUSES:", "info");

        if (
          result.error?.includes("not granted") ||
          result.error?.includes("access")
        ) {
          context.log("• The recipient hasn't granted you access", "output");
          context.log("• Ask them to run: tg-grant <your-address>", "output");
        } else if (
          result.error?.includes("insufficient") ||
          result.error?.includes("balance")
        ) {
          context.log("• You may not have enough xRLC for gas fees", "output");
          context.log("• Get xRLC at: https://bridge.iex.ec", "output");
        } else if (
          result.error?.includes("protectedData") ||
          result.error?.includes("address")
        ) {
          context.log("• The protected data address may be invalid", "output");
          context.log("• Verify the contact address is correct", "output");
        } else {
          context.log(
            "• Make sure you're on Bellecour network (134)",
            "output"
          );
          context.log("• Ensure you have xRLC for gas fees", "output");
          context.log(
            "• Check that the recipient granted you access",
            "output"
          );
          context.log(
            "• Verify the protected data address is correct",
            "output"
          );
        }

        context.log("", "output");
        const statusHtml = createCommandLine("tg-status", "Check your status");
        const contactsHtml = createCommandLine("tg-contacts", "View contacts");
        context.logHtml(statusHtml);
        context.logHtml(contactsHtml);
      }
    } catch (error: any) {
      context.log("", "output");
      context.log(
        `❌ Error: ${error.message || "Failed to send message"}`,
        "error"
      );
      context.log("", "output");
      context.log("💡 Check your network connection and try again.", "info");
    }
  },
};

/**
 * tg-contacts command - View contact list
 */
export const tgContactsCommand: Command = {
  name: "tg-contacts",
  description: "View your Web3Telegram contacts",
  usage: "tg-contacts",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    if (!(context as any).telegram) {
      context.log("❌ Web3Telegram provider not available.", "error");
      return;
    }

    const telegram = (context as any).telegram;
    const contacts = telegram.state.contacts || [];

    context.log("📇 YOUR WEB3TELEGRAM CONTACTS", "info");
    context.log("═══════════════════════════════", "output");
    context.log("", "output");

    if (contacts.length === 0) {
      context.log("📭 No contacts found.", "info");
      context.log("", "output");
      context.log("💡 Add your first contact to start messaging!", "info");
      const addHtml = createCommandLine("tg-add-contact", "Add a contact");
      context.logHtml(addHtml);
      return;
    }

    context.log(`Total Contacts: ${contacts.length}`, "info");
    context.log("", "output");

    contacts.forEach((contact: any, index: number) => {
      const lastSent = contact.lastMessageSent
        ? new Date(contact.lastMessageSent).toLocaleString()
        : "Never";

      const html = `
        <div style="
          border: 1px solid var(--palette-primary, #00d4ff);
          padding: 12px;
          margin: 8px 0;
          border-radius: 8px;
          background: rgba(0, 212, 255, 0.05);
        ">
          <div style="margin-bottom: 4px;">
            <b style="color: var(--palette-secondary, #00ff88); font-size: 1.1em;">${
              contact.label
            }</b>
          </div>
          <div style="margin-bottom: 4px; font-size: 0.9em; opacity: 0.9;">
            <b style="color: var(--palette-primary, #00d4ff);">Protected Data:</b>
            <span style="font-family: monospace; color: #888; cursor: pointer; word-break: break-all;" 
                  onclick="navigator.clipboard.writeText('${
                    contact.protectedDataAddress
                  }')" 
                  title="Click to copy">
              ${contact.protectedDataAddress}
            </span>
          </div>
          ${
            contact.walletAddress
              ? `
            <div style="margin-bottom: 4px; font-size: 0.9em; opacity: 0.9;">
              <b style="color: var(--palette-primary, #00d4ff);">Wallet:</b>
              <span style="font-family: monospace; color: #888;">${contact.walletAddress}</span>
            </div>
          `
              : ""
          }
          <div style="font-size: 0.85em; opacity: 0.8;">
            <span style="color: var(--palette-text, #ccd4e0);">Last Message: ${lastSent}</span>
          </div>
          <div style="margin-top: 8px;">
            <span class="omega-help-command" data-command="tg-send ${
              contact.label
            } " 
                  style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; 
                         font-family: 'Courier New', monospace; padding: 4px 8px; border-radius: 4px; 
                         background: rgba(0, 255, 136, 0.1); transition: all 0.2s ease; font-size: 0.9em;"
                  onmouseover="this.style.background = 'rgba(0, 255, 136, 0.2)';"
                  onmouseout="this.style.background = 'rgba(0, 255, 136, 0.1)';"
                  title="Click to compose message">
              📤 Send Message
            </span>
            <span class="omega-help-command" data-command="tg-remove-contact ${
              contact.label
            }" 
                  style="color: var(--palette-error, #ff4757); font-weight: bold; cursor: pointer; 
                         font-family: 'Courier New', monospace; padding: 4px 8px; border-radius: 4px; 
                         background: rgba(255, 71, 87, 0.1); transition: all 0.2s ease; font-size: 0.9em; margin-left: 8px;"
                  onmouseover="this.style.background = 'rgba(255, 71, 87, 0.2)';"
                  onmouseout="this.style.background = 'rgba(255, 71, 87, 0.1)';"
                  title="Click to remove contact">
              🗑️ Remove
            </span>
          </div>
        </div>
      `;

      context.logHtml(html);
    });

    context.log("", "output");
    const addHtml = createCommandLine("tg-add-contact", "Add another contact");
    context.logHtml(addHtml);
  },
};

/**
 * tg-add-contact command - Add a new contact
 */
export const tgAddContactCommand: Command = {
  name: "tg-add-contact",
  description: "Add a new Web3Telegram contact",
  usage: "tg-add-contact <label> <protectedDataAddress> [walletAddress]",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    if (!(context as any).telegram) {
      context.log("❌ Web3Telegram provider not available.", "error");
      return;
    }

    if (!args[1] || !args[2]) {
      const usageHtml = createUsageError(
        "tg-add-contact <label> <protectedDataAddress> [walletAddress]",
        [
          "tg-add-contact alice 0x123...abc",
          "tg-add-contact bob 0x456...def 0x789...ghi",
        ]
      );
      context.logHtml(usageHtml);
      context.log("", "output");
      context.log(
        "💡 The protected data address is the recipient's Telegram Chat ID on-chain.",
        "info"
      );
      return;
    }

    const telegram = (context as any).telegram;
    const label = args[1];
    const protectedDataAddress = args[2];
    const walletAddress = args[3];

    try {
      context.log(`📝 Adding contact "${label}"...`, "info");

      const result = telegram.addContact({
        label,
        protectedDataAddress,
        walletAddress,
      });

      if (result.success) {
        context.log("✅ Contact added successfully!", "success");
        context.log("", "output");
        context.log(`👤 Label: ${label}`, "output");
        context.log(`🔗 Protected Data: ${protectedDataAddress}`, "output");
        if (walletAddress) {
          context.log(`💼 Wallet: ${walletAddress}`, "output");
        }
        context.log("", "output");
        context.log("💡 You can now send messages to this contact!", "info");
        const sendHtml = createCommandLine(
          `tg-send ${label} `,
          "Send a message"
        );
        context.logHtml(sendHtml);
      } else {
        context.log(`❌ Failed to add contact: ${result.error}`, "error");
      }
    } catch (error: any) {
      context.log(
        `❌ Error: ${error.message || "Failed to add contact"}`,
        "error"
      );
    }
  },
};

/**
 * tg-remove-contact command - Remove a contact
 */
export const tgRemoveContactCommand: Command = {
  name: "tg-remove-contact",
  description: "Remove a Web3Telegram contact",
  usage: "tg-remove-contact <label>",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    if (!(context as any).telegram) {
      context.log("❌ Web3Telegram provider not available.", "error");
      return;
    }

    if (!args[1]) {
      const usageHtml = createUsageError("tg-remove-contact <label>", [
        "tg-remove-contact alice",
        "tg-remove-contact bob",
      ]);
      context.logHtml(usageHtml);
      return;
    }

    const telegram = (context as any).telegram;
    const label = args[1];

    // Find contact first
    const contact = telegram.getContactByLabel(label);
    if (!contact) {
      context.log(`❌ Contact "${label}" not found.`, "error");
      const contactsHtml = createCommandLine(
        "tg-contacts",
        "View your contacts"
      );
      context.logHtml(contactsHtml);
      return;
    }

    try {
      context.log(`🗑️ Removing contact "${label}"...`, "info");

      const result = telegram.removeContact(contact.protectedDataAddress);

      if (result.success) {
        context.log("✅ Contact removed successfully!", "success");
        context.log("", "output");
        context.log(`👤 Removed: ${label}`, "output");
        context.log("", "output");
        const contactsHtml = createCommandLine(
          "tg-contacts",
          "View remaining contacts"
        );
        context.logHtml(contactsHtml);
      } else {
        context.log(`❌ Failed to remove contact: ${result.error}`, "error");
      }
    } catch (error: any) {
      context.log(
        `❌ Error: ${error.message || "Failed to remove contact"}`,
        "error"
      );
    }
  },
};

/**
 * tg-grant command - Grant access to send messages to you
 */
export const tgGrantCommand: Command = {
  name: "tg-grant",
  description: "Grant someone access to send you messages",
  usage: "tg-grant <walletAddress> [numberOfAccess]",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    // Perform common checks (wallet, network, telegram context)
    const checks = await performCommonChecks(context);
    if (!checks.success || !checks.telegram) {
      return;
    }

    if (!args[1]) {
      const usageHtml = createUsageError(
        "tg-grant <walletAddress> [numberOfAccess]",
        ["tg-grant 0x123...abc", "tg-grant 0x456...def 5"]
      );
      context.logHtml(usageHtml);
      context.log("", "output");
      context.log("💡 numberOfAccess defaults to 1 if not specified.", "info");
      return;
    }

    const telegram = checks.telegram;
    const walletAddress = args[1];
    const numberOfAccess = args[2] ? parseInt(args[2], 10) : 1;

    if (isNaN(numberOfAccess) || numberOfAccess < 1) {
      context.log(
        "❌ Invalid number of access. Must be a positive number.",
        "error"
      );
      return;
    }

    if (!telegram.state.userProtectedData) {
      context.log("❌ Please setup your account first.", "error");
      context.log("", "output");
      context.log(
        "💡 You need to create your protected Chat ID before granting access.",
        "info"
      );
      const setupHtml = createCommandLine("tg-setup", "Setup your account");
      context.logHtml(setupHtml);
      return;
    }

    try {
      context.log(`🔐 Granting access to ${walletAddress}...`, "info");
      context.log(`📊 Number of accesses: ${numberOfAccess}`, "output");
      context.log("", "output");
      context.log("⏳ Preparing transaction...", "info");
      context.log("💡 You'll need to confirm in your wallet.", "info");
      context.log("", "output");

      // Add diagnostic info
      context.log("📋 TRANSACTION DETAILS:", "info");
      context.log(
        `  Protected Data: ${telegram.state.userProtectedData.address}`,
        "output"
      );
      context.log(`  Authorized User: ${walletAddress}`, "output");
      context.log(`  Number of Access: ${numberOfAccess}`, "output");
      context.log("", "output");

      const result = await telegram.grantAccessToUser(
        walletAddress,
        numberOfAccess
      );

      if (result.success) {
        context.log("✅ Access granted successfully!", "success");
        context.log("", "output");
        context.log("📊 GRANT SUMMARY:", "info");
        context.log(`👤 Granted to: ${walletAddress}`, "output");
        context.log(`🔢 Number of accesses: ${numberOfAccess}`, "output");
        context.log("", "output");
        context.log("🎉 WHAT THIS MEANS:", "info");
        context.log(
          `• The address ${walletAddress.slice(
            0,
            10
          )}... can now send you ${numberOfAccess} message(s)`,
          "output"
        );
        context.log(
          "• They need to add your protected data address as a contact",
          "output"
        );
        context.log(
          "• They'll pay the gas fees when sending messages",
          "output"
        );
        context.log("", "output");
        const accessHtml = createCommandLine(
          "tg-access",
          "View all granted access"
        );
        context.logHtml(accessHtml);
      } else {
        context.log("❌ Failed to grant access!", "error");
        context.log("", "output");
        context.log(`📋 Error: ${result.error}`, "error");
        context.log("", "output");

        // Provide specific troubleshooting
        context.log("💡 TROUBLESHOOTING:", "info");

        if (
          result.error?.includes("insufficient") ||
          result.error?.includes("balance")
        ) {
          context.log("❌ Insufficient xRLC balance", "error");
          context.log("", "output");
          context.log(
            "You need xRLC tokens on Bellecour for gas fees.",
            "output"
          );
          context.log("", "output");
          context.log("🎯 TO GET xRLC:", "info");
          context.log("1. Visit https://bridge.iex.ec", "output");
          context.log("2. Bridge RLC from Ethereum → Bellecour", "output");
          context.log("3. Or check iExec Discord for faucet links", "output");
        } else if (
          result.error?.includes("user rejected") ||
          result.error?.includes("denied")
        ) {
          context.log("❌ Transaction rejected in wallet", "error");
          context.log("", "output");
          context.log(
            "Try running the command again and approve the transaction.",
            "output"
          );
        } else if (result.error?.includes("network")) {
          context.log("❌ Network error", "error");
          context.log("", "output");
          context.log(
            "• Make sure you're on Bellecour network (134)",
            "output"
          );
          context.log("• Try running the command again", "output");
        } else if (
          result.error?.includes("protected data") ||
          result.error?.includes("setup")
        ) {
          context.log("❌ Account not setup properly", "error");
          context.log("", "output");
          const setupHtml = createCommandLine("tg-setup", "Setup your account");
          context.logHtml(setupHtml);
        } else {
          context.log("• Ensure you have xRLC tokens for gas", "output");
          context.log("• Check you're on Bellecour network (134)", "output");
          context.log("• Verify the wallet address is valid", "output");
          context.log("• Try with a smaller number first (e.g., 1)", "output");
        }

        context.log("", "output");
        context.log("🔍 DIAGNOSTIC INFO:", "info");
        context.log(
          `  Your Address: ${context.wallet.state.address || "Unknown"}`,
          "output"
        );
        context.log(
          `  Protected Data: ${
            telegram.state.userProtectedData?.address || "Not setup"
          }`,
          "output"
        );
        context.log(`  Target Address: ${walletAddress}`, "output");
      }
    } catch (error: any) {
      context.log("", "output");
      context.log(
        `❌ Unexpected error: ${error.message || "Failed to grant access"}`,
        "error"
      );
      context.log("", "output");
      context.log("💡 Try these steps:", "info");
      context.log("1. Check your wallet is connected: connect", "output");
      context.log("2. Verify you're on Bellecour: tg-status", "output");
      context.log("3. Check you have xRLC for gas", "output");
      context.log("4. Try again with a smaller number", "output");
    }
  },
};

/**
 * tg-access command - View granted access list
 */
export const tgAccessCommand: Command = {
  name: "tg-access",
  description: "View who can send you messages",
  usage: "tg-access",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    if (!(context as any).telegram) {
      context.log("❌ Web3Telegram provider not available.", "error");
      return;
    }

    const telegram = (context as any).telegram;
    const grantedAccess = telegram.state.grantedAccess || [];

    context.log("🔐 GRANTED ACCESS LIST", "info");
    context.log("══════════════════════", "output");
    context.log("", "output");

    if (grantedAccess.length === 0) {
      context.log("📭 No granted access found.", "info");
      context.log("", "output");
      context.log(
        "💡 Grant access to allow others to send you messages.",
        "info"
      );
      const grantHtml = createCommandLine("tg-grant <address>", "Grant access");
      context.logHtml(grantHtml);
      return;
    }

    context.log(`Total Grants: ${grantedAccess.length}`, "info");
    context.log("", "output");

    grantedAccess.forEach((grant: any, index: number) => {
      const grantedDate = grant.grantedAt
        ? new Date(grant.grantedAt).toLocaleString()
        : "Unknown";

      const html = `
        <div style="
          border: 1px solid var(--palette-secondary, #00ff88);
          padding: 12px;
          margin: 8px 0;
          border-radius: 8px;
          background: rgba(0, 255, 136, 0.05);
        ">
          <div style="margin-bottom: 6px;">
            <b style="color: var(--palette-secondary, #00ff88);">Authorized User:</b>
            <span style="font-family: monospace; color: #888; cursor: pointer; word-break: break-all;" 
                  onclick="navigator.clipboard.writeText('${grant.authorizedUser}')" 
                  title="Click to copy">
              ${grant.authorizedUser}
            </span>
          </div>
          <div style="margin-bottom: 6px; font-size: 0.9em;">
            <b style="color: var(--palette-primary, #00d4ff);">Authorized App:</b>
            <span style="font-family: monospace; color: #888; font-size: 0.85em; word-break: break-all;">${grant.authorizedApp}</span>
          </div>
          <div style="font-size: 0.9em; opacity: 0.9;">
            <span style="color: var(--palette-text, #ccd4e0);">Granted: ${grantedDate}</span>
            <span style="margin-left: 15px; color: var(--palette-text, #ccd4e0);">Accesses: ${grant.numberOfAccess}</span>
          </div>
        </div>
      `;

      context.logHtml(html);
    });

    context.log("", "output");
    context.log("💡 To refresh this list from blockchain, use:", "info");
    const refreshHtml = createCommandLine("tg-refresh", "Refresh access list");
    context.logHtml(refreshHtml);
  },
};

/**
 * tg-revoke command - Revoke access
 */
export const tgRevokeCommand: Command = {
  name: "tg-revoke",
  description: "Revoke message sending access",
  usage: "tg-revoke",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    if (!(context as any).telegram) {
      context.log("❌ Web3Telegram provider not available.", "error");
      return;
    }

    const telegram = (context as any).telegram;
    const grantedAccess = telegram.state.grantedAccess || [];

    if (grantedAccess.length === 0) {
      context.log("📭 No granted access to revoke.", "info");
      const accessHtml = createCommandLine("tg-access", "View granted access");
      context.logHtml(accessHtml);
      return;
    }

    context.log("⚠️ REVOKE ACCESS", "warning");
    context.log("", "output");
    context.log("💡 Interactive revocation coming soon!", "info");
    context.log("For now, view your granted access list:", "output");
    context.log("", "output");
    const accessHtml = createCommandLine("tg-access", "View granted access");
    context.logHtml(accessHtml);
  },
};

/**
 * tg-refresh command - Refresh contacts and access from blockchain
 */
export const tgRefreshCommand: Command = {
  name: "tg-refresh",
  description: "Refresh contacts and access from blockchain",
  usage: "tg-refresh",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    if (!(context as any).telegram) {
      context.log("❌ Web3Telegram provider not available.", "error");
      return;
    }

    const telegram = (context as any).telegram;

    if (!telegram.state.isInitialized) {
      context.log("❌ Web3Telegram SDK not initialized.", "error");
      return;
    }

    try {
      context.log("🔄 Refreshing from blockchain...", "info");

      await telegram.refreshContacts();

      context.log("✅ Refresh complete!", "success");
      context.log("", "output");
      context.log(
        "💡 Your contacts and granted access list have been updated.",
        "info"
      );
      context.log("", "output");
      const contactsHtml = createCommandLine("tg-contacts", "View contacts");
      const accessHtml = createCommandLine("tg-access", "View access");
      context.logHtml(contactsHtml);
      context.logHtml(accessHtml);
    } catch (error: any) {
      context.log(`❌ Error: ${error.message || "Failed to refresh"}`, "error");
    }
  },
};

/**
 * tg-status command - View account status
 */
export const tgStatusCommand: Command = {
  name: "tg-status",
  description: "View your Web3Telegram account status",
  usage: "tg-status",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    if (!(context as any).telegram) {
      context.log("❌ Web3Telegram provider not available.", "error");
      return;
    }

    const telegram = (context as any).telegram;

    context.log("📊 WEB3TELEGRAM STATUS", "info");
    context.log("═══════════════════════", "output");
    context.log("", "output");

    // SDK Status
    context.log("🔧 SDK Status:", "info");
    context.log(
      `  Initialized: ${telegram.state.isInitialized ? "✅ Yes" : "❌ No"}`,
      "output"
    );
    context.log(
      `  Loading: ${telegram.state.isLoading ? "⏳ Yes" : "✅ No"}`,
      "output"
    );
    if (telegram.state.error) {
      context.log(`  Error: ${telegram.state.error}`, "error");
    }
    context.log("", "output");

    // Account Status
    context.log("👤 Account Status:", "info");
    if (telegram.state.userProtectedData) {
      const pd = telegram.state.userProtectedData;
      context.log(`  ✅ Account Setup Complete`, "success");
      context.log(`  Name: ${pd.name}`, "output");
      context.log(`  Address: ${pd.address}`, "output");
      context.log(`  Owner: ${pd.owner}`, "output");
      context.log(`  Granted Access Count: ${pd.grantedAccessCount}`, "output");
      const createdDate = new Date(pd.createdAt).toLocaleString();
      context.log(`  Created: ${createdDate}`, "output");
    } else {
      context.log(`  ❌ Not Setup`, "error");
      context.log("", "output");
      const setupHtml = createCommandLine("tg-setup", "Setup your account");
      context.logHtml(setupHtml);
    }
    context.log("", "output");

    // Contacts
    context.log("📇 Contacts:", "info");
    context.log(`  Total: ${telegram.state.contacts.length}`, "output");
    if (telegram.state.contacts.length > 0) {
      const contactsHtml = createCommandLine("tg-contacts", "View contacts");
      context.logHtml(contactsHtml);
    }
    context.log("", "output");

    // Granted Access
    context.log("🔐 Granted Access:", "info");
    context.log(`  Total: ${telegram.state.grantedAccess.length}`, "output");
    if (telegram.state.grantedAccess.length > 0) {
      const accessHtml = createCommandLine("tg-access", "View access list");
      context.logHtml(accessHtml);
    }
    context.log("", "output");

    // Configuration
    context.log("⚙️ Configuration:", "info");
    context.log(
      `  Default Sender Name: ${telegram.state.config.defaultSenderName}`,
      "output"
    );
    context.log(
      `  Default Max Price: ${telegram.state.config.defaultMaxPrice} nRLC`,
      "output"
    );
    context.log(
      `  Auto Confirm Price: ${
        telegram.state.config.autoConfirmPrice ? "Yes" : "No"
      }`,
      "output"
    );
    if (telegram.state.config.autoConfirmPrice) {
      context.log(
        `  Price Threshold: ${telegram.state.config.priceConfirmThreshold} nRLC`,
        "output"
      );
    }
    context.log("", "output");
    const configHtml = createCommandLine("tg-config", "Configure settings");
    context.logHtml(configHtml);
  },
};

/**
 * tg-config command - Configure settings
 */
export const tgConfigCommand: Command = {
  name: "tg-config",
  description: "Configure Web3Telegram settings",
  usage: "tg-config",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    if (!(context as any).telegram) {
      context.log("❌ Web3Telegram provider not available.", "error");
      return;
    }

    const telegram = (context as any).telegram;

    context.log("⚙️ WEB3TELEGRAM CONFIGURATION", "info");
    context.log("══════════════════════════════", "output");
    context.log("", "output");

    context.log("📋 CURRENT SETTINGS:", "info");
    context.log(
      `  Default Sender Name: ${telegram.state.config.defaultSenderName}`,
      "output"
    );
    context.log(
      `  Default Max Price: ${telegram.state.config.defaultMaxPrice} nRLC`,
      "output"
    );
    context.log(
      `  Auto Confirm Price: ${
        telegram.state.config.autoConfirmPrice ? "Yes" : "No"
      }`,
      "output"
    );
    if (telegram.state.config.autoConfirmPrice) {
      context.log(
        `  Price Threshold: ${telegram.state.config.priceConfirmThreshold} nRLC`,
        "output"
      );
    }
    context.log("", "output");

    context.log("💡 Interactive configuration coming soon!", "warning");
    context.log("Settings will include:", "output");
    context.log("  • Default sender name for messages", "output");
    context.log("  • Maximum price for sending messages", "output");
    context.log("  • Automatic price confirmation settings", "output");
    context.log("", "output");
    context.log(
      "For now, use the Web3Telegram UI to configure settings.",
      "info"
    );
  },
};

/**
 * tg-debug command - Diagnostic information for troubleshooting
 */
export const tgDebugCommand: Command = {
  name: "tg-debug",
  description: "Show diagnostic information for troubleshooting",
  usage: "tg-debug",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    context.log("🔍 WEB3TELEGRAM DIAGNOSTICS", "info");
    context.log("══════════════════════════════", "output");
    context.log("", "output");

    // Wallet Check
    context.log("💼 WALLET:", "info");
    context.log(
      `  Connected: ${context.wallet.state.isConnected ? "✅ Yes" : "❌ No"}`,
      "output"
    );
    if (context.wallet.state.isConnected) {
      context.log(
        `  Address: ${context.wallet.state.address || "Unknown"}`,
        "output"
      );
      context.log(
        `  Network: ${context.wallet.state.network || "Unknown"}`,
        "output"
      );
      context.log(
        `  Chain ID: ${context.wallet.state.chainId || "Unknown"}`,
        "output"
      );
    }
    context.log("", "output");

    // Network Check
    context.log("🌐 NETWORK:", "info");
    try {
      const provider = context.wallet.getProvider();
      if (provider) {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        context.log(`  Current Chain ID: ${chainId}`, "output");
        context.log(
          `  Required Chain ID: ${REQUIRED_CHAIN_ID} (${REQUIRED_NETWORK.chainName})`,
          "output"
        );
        context.log(
          `  Status: ${
            chainId === REQUIRED_CHAIN_ID ? "✅ Correct" : "❌ Wrong network"
          }`,
          "output"
        );

        if (chainId !== REQUIRED_CHAIN_ID) {
          context.log("", "output");
          context.log("⚠️ You're on the wrong network!", "warning");
          context.log(
            `Run any tg-* command to auto-switch to ${REQUIRED_NETWORK.chainName}.`,
            "info"
          );
        }
      } else {
        context.log(`  Status: ❌ No provider available`, "error");
      }
    } catch (error: any) {
      context.log(`  Status: ❌ Error: ${error.message}`, "error");
    }
    context.log("", "output");

    // Telegram Context Check
    context.log("📱 TELEGRAM CONTEXT:", "info");
    if (!(context as any).telegram) {
      context.log(`  Available: ❌ No`, "error");
      context.log("", "output");
      context.log("⚠️ TelegramProvider not available!", "warning");
      context.log("This may require a page refresh.", "info");
    } else {
      const telegram = (context as any).telegram;
      context.log(`  Available: ✅ Yes`, "success");
      context.log(
        `  Initialized: ${telegram.state.isInitialized ? "✅ Yes" : "❌ No"}`,
        "output"
      );
      context.log(
        `  Loading: ${telegram.state.isLoading ? "⏳ Yes" : "✅ No"}`,
        "output"
      );

      if (telegram.state.error) {
        context.log(`  Error: ❌ ${telegram.state.error}`, "error");
      }

      context.log("", "output");
      context.log("👤 ACCOUNT:", "info");
      if (telegram.state.userProtectedData) {
        context.log(`  Setup: ✅ Complete`, "success");
        context.log(
          `  Address: ${telegram.state.userProtectedData.address}`,
          "output"
        );
        context.log(
          `  Name: ${telegram.state.userProtectedData.name}`,
          "output"
        );
        context.log(
          `  Owner: ${telegram.state.userProtectedData.owner}`,
          "output"
        );
        context.log(
          `  Granted Access Count: ${telegram.state.userProtectedData.grantedAccessCount}`,
          "output"
        );
      } else {
        context.log(`  Setup: ❌ Not complete`, "error");
        context.log("  Run 'tg-setup' to create your account", "info");
      }

      context.log("", "output");
      context.log("📇 DATA:", "info");
      context.log(
        `  Contacts: ${telegram.state.contacts?.length || 0}`,
        "output"
      );
      context.log(
        `  Granted Access: ${telegram.state.grantedAccess?.length || 0}`,
        "output"
      );
    }
    context.log("", "output");

    // Balance Check (if possible)
    context.log("💰 BALANCE:", "info");
    try {
      const balance = await context.wallet.getBalance();
      if (balance) {
        context.log(`  Balance: ${balance}`, "output");

        // Check if it's xRLC
        const provider = context.wallet.getProvider();
        if (provider) {
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          if (chainId === 134) {
            context.log("  Currency: xRLC", "output");

            // Warn if balance seems low
            const balanceNum = parseFloat(balance.split(" ")[0] || "0");
            if (balanceNum < 0.1) {
              context.log("", "output");
              context.log("⚠️ Low xRLC balance!", "warning");
              context.log("You may need more xRLC for transactions.", "info");
              context.log("Get xRLC at: https://bridge.iex.ec", "info");
            }
          }
        }
      } else {
        context.log(`  Status: ❌ Could not fetch balance`, "error");
      }
    } catch (error: any) {
      context.log(`  Status: ❌ Error: ${error.message}`, "error");
    }
    context.log("", "output");

    // Browser Environment
    context.log("🌍 ENVIRONMENT:", "info");
    context.log(
      `  Browser: ${typeof window !== "undefined" ? "✅ Yes" : "❌ No"}`,
      "output"
    );
    context.log(
      `  MetaMask: ${
        typeof (window as any).ethereum !== "undefined"
          ? "✅ Detected"
          : "❌ Not found"
      }`,
      "output"
    );
    context.log(
      `  LocalStorage: ${
        typeof localStorage !== "undefined"
          ? "✅ Available"
          : "❌ Not available"
      }`,
      "output"
    );
    context.log("", "output");

    // Recommendations
    context.log("💡 RECOMMENDATIONS:", "info");
    const issues = [];

    if (!context.wallet.state.isConnected) {
      issues.push("connect");
    }

    if ((context as any).telegram) {
      const telegram = (context as any).telegram;

      try {
        const provider = context.wallet.getProvider();
        if (provider) {
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          if (chainId !== 134) {
            issues.push("switch to Bellecour");
          }
        }
      } catch {}

      if (!telegram.state.isInitialized) {
        issues.push("wait for initialization");
      }

      if (!telegram.state.userProtectedData) {
        issues.push("run tg-setup");
      }
    }

    if (issues.length > 0) {
      issues.forEach((issue, index) => {
        context.log(`  ${index + 1}. ${issue}`, "output");
      });
    } else {
      context.log("  ✅ Everything looks good!", "success");
      context.log(
        "  You should be able to use Web3Telegram commands.",
        "output"
      );
    }

    context.log("", "output");
    const helpHtml = createCommandLine("tg", "View Web3Telegram help");
    context.logHtml(helpHtml);
  },
};

/**
 * tg-recover command - Recover account from blockchain
 */
export const tgRecoverCommand: Command = {
  name: "tg-recover",
  description: "Recover your Web3Telegram account from blockchain",
  usage: "tg-recover",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    // Perform common checks
    const checks = await performCommonChecks(context);
    if (!checks.success || !checks.telegram) {
      return;
    }

    const telegram = checks.telegram;

    // Check if already have protected data
    if (telegram.state.userProtectedData) {
      context.log("ℹ️ You already have a Web3Telegram account loaded!", "info");
      context.log("", "output");
      context.log(
        `📱 Protected Data Address: ${telegram.state.userProtectedData.address}`,
        "output"
      );
      context.log(
        `👤 Name: ${telegram.state.userProtectedData.name}`,
        "output"
      );
      context.log("", "output");
      context.log(
        "💡 To force re-fetch from blockchain, clear localStorage first:",
        "info"
      );
      context.log(
        "Then refresh the page and run this command again.",
        "output"
      );
      return;
    }

    context.log("🔄 RECOVERING ACCOUNT FROM BLOCKCHAIN", "info");
    context.log("═══════════════════════════════════════", "output");
    context.log("", "output");
    context.log("⏳ Searching blockchain for your protected data...", "info");
    context.log(`📍 Wallet Address: ${context.wallet.state.address}`, "output");
    context.log("", "output");

    // Trigger a refresh which will fetch from blockchain
    try {
      await telegram.refreshContacts();

      // After refresh, check if protected data was found
      if (telegram.state.userProtectedData) {
        context.log("✅ ACCOUNT RECOVERED SUCCESSFULLY!", "success");
        context.log("", "output");
        context.log("📊 ACCOUNT DETAILS:", "info");
        context.log(
          `🔗 Protected Data Address: ${telegram.state.userProtectedData.address}`,
          "output"
        );
        context.log(
          `👤 Name: ${telegram.state.userProtectedData.name}`,
          "output"
        );
        context.log(
          `🔐 Granted Access Count: ${telegram.state.userProtectedData.grantedAccessCount}`,
          "output"
        );
        context.log("", "output");
        context.log(
          "🎉 You can now use Web3Telegram on this device!",
          "success"
        );
        context.log("", "output");
        const statusHtml = createCommandLine("tg-status", "View full status");
        context.logHtml(statusHtml);
      } else {
        context.log("📭 No protected data found on blockchain.", "info");
        context.log("", "output");
        context.log("💡 POSSIBLE REASONS:", "info");
        context.log("• You haven't setup your account yet", "output");
        context.log("• You're using a different wallet address", "output");
        context.log(
          "• You're on the wrong network (must be Bellecour)",
          "output"
        );
        context.log("", "output");
        context.log("🎯 TO SETUP A NEW ACCOUNT:", "info");
        const setupHtml = createCommandLine("tg-setup", "Setup your account");
        context.logHtml(setupHtml);
      }
    } catch (error: any) {
      context.log("❌ Failed to recover account", "error");
      context.log("", "output");
      context.log(`📋 Error: ${error.message || "Unknown error"}`, "error");
      context.log("", "output");
      context.log("💡 Make sure:", "info");
      context.log("• You're connected to Bellecour network (134)", "output");
      context.log("• Your wallet is unlocked", "output");
      context.log("• You have network connectivity", "output");
    }
  },
};

/**
 * tg-deposit command - Deposit xRLC into iExec account for sending messages
 */
export const tgDepositCommand: Command = {
  name: "tg-deposit",
  description: "Deposit xRLC into your iExec account to pay for messages",
  usage: "tg-deposit <amount>",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    context.log("💰 DEPOSIT xRLC TO IEXEC ACCOUNT", "info");
    context.log("══════════════════════════════════", "output");
    context.log("", "output");

    // Check wallet connection (skip network check as deposit works on any network)
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    const amount = args[1];
    if (!amount) {
      context.log("📋 USAGE:", "info");
      context.log("  tg-deposit <amount>", "output");
      context.log("", "output");
      context.log("💡 EXAMPLES:", "info");
      context.log("  tg-deposit 1      # Deposit 1 xRLC", "output");
      context.log("  tg-deposit 0.1    # Deposit 0.1 xRLC", "output");
      context.log("  tg-deposit 10     # Deposit 10 xRLC", "output");
      context.log("", "output");
      context.log("ℹ️ WHY DEPOSIT?", "info");
      context.log("• xRLC in your wallet can't be used directly", "output");
      context.log("• You must deposit it into your iExec account", "output");
      context.log("• Each message costs ~0.1 nRLC (very cheap!)", "output");
      context.log("• 1 xRLC = 1,000,000,000 nRLC (lots of messages!)", "output");
      context.log("", "output");
      context.log("⚠️ Current Status:", "warning");
      context.log("Your iExec account stake: 0 xRLC", "output");
      context.log("You need to deposit to send messages!", "output");
      return;
    }

    try {
      const { IExec } = await import("iexec");
      const ethProvider = context.wallet.getProvider();
      const signer = await ethProvider.getSigner();
      const address = await signer.getAddress();
      const network = await ethProvider.getNetwork();
      const chainId = Number(network.chainId);

      context.log(`💸 Depositing ${amount} xRLC...`, "info");
      context.log(`   Network: Chain ID ${chainId}`, "output");
      context.log(`   Address: ${address}`, "output");
      context.log("", "output");

      const iexec = new IExec({
        ethProvider: window.ethereum,
      });
      
      console.log("[tg-deposit] IExec instance created, attempting deposit...");

      // Convert amount to nRLC (1 xRLC = 1e9 nRLC)
      const amountNRLC = (parseFloat(amount) * 1e9).toString();
      
      context.log(`⏳ Depositing ${amount} xRLC (${amountNRLC} nRLC)...`, "output");
      context.log("", "output");
      context.log("⏳ Please confirm the transaction in your wallet...", "output");
      console.log("[tg-deposit] Depositing amount:", amountNRLC, "nRLC");

      const tx = await iexec.account.deposit(amountNRLC);
      console.log("[tg-deposit] Deposit result:", tx);

      context.log("", "output");
      context.log("✅ Deposit successful!", "success");
      context.log("", "output");
      context.log(`💰 Deposited: ${amount} xRLC`, "output");
      if (tx?.txHash) {
        context.log(`🔗 Transaction: ${tx.txHash}`, "output");
      }
      context.log("", "output");
      context.log("🎉 You can now send messages!", "success");
      context.log("", "output");
      const sendHtml = createCommandLine("tg-send Hassan hello", "Send a message");
      context.logHtml(sendHtml);
    } catch (error: any) {
      context.log("❌ Deposit failed!", "error");
      context.log("", "output");
      context.log(`Error: ${error.message}`, "error");
      console.error("[tg-deposit] Full error:", error);
      context.log("", "output");
      context.log("💡 TROUBLESHOOTING:", "info");
      context.log("• Make sure you have xRLC in your wallet", "output");
      context.log("• Check that you're on the correct network", "output");
      context.log("• Try with a smaller amount first (e.g., 0.1)", "output");
      context.log("", "output");
      context.log("💡 Check browser console for detailed error logs", "info");
    }
  },
};

/**
 * tg-balance command - Check iExec account balance and stake
 */
export const tgBalanceCommand: Command = {
  name: "tg-balance",
  description: "Check your xRLC wallet balance and iExec account stake",
  usage: "tg-balance",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    context.log("💰 IEXEC ACCOUNT BALANCE", "info");
    context.log("═════════════════════════", "output");
    context.log("", "output");

    // Check wallet connection (skip network check as balance works on any network)
    if (!context.wallet.state.isConnected) {
      context.log("❌ Please connect your wallet first.", "error");
      const helpHtml = createCommandLine("connect", "Connect your wallet");
      context.logHtml(helpHtml);
      return;
    }

    try {
      const { IExec } = await import("iexec");
      const ethProvider = context.wallet.getProvider();
      const signer = await ethProvider.getSigner();
      const address = await signer.getAddress();
      const network = await ethProvider.getNetwork();
      const chainId = Number(network.chainId);

      context.log("🔍 Checking balances...", "info");
      context.log(`   Network: Chain ID ${chainId}`, "output");
      context.log(`   Address: ${address}`, "output");
      context.log("", "output");

      const iexec = new IExec({
        ethProvider: window.ethereum,
      });
      
      console.log("[tg-balance] IExec instance created, checking balances...");

      // Get wallet balance
      context.log("⏳ Fetching wallet balance...", "output");
      const walletBalance = await iexec.wallet.checkBalances(address);
      console.log("[tg-balance] Wallet balance:", walletBalance);
      
      // Get account stake
      context.log("⏳ Fetching iExec account balance...", "output");
      const accountBalance = await iexec.account.checkBalance(address);
      console.log("[tg-balance] Account balance:", accountBalance);

      context.log("", "output");
      context.log("👛 WALLET BALANCE (not deposited):", "info");
      
      const walletNRLC = walletBalance?.nRLC || "0";
      const walletXRLC = (BigInt(walletNRLC) / BigInt(1e9)).toString();
      context.log(`   ${walletXRLC} xRLC`, "output");
      context.log("", "output");

      context.log("🏦 IEXEC ACCOUNT STAKE (available for orders):", "info");
      
      const stakeNRLC = accountBalance?.stake || "0";
      const stakeXRLC = (BigInt(stakeNRLC) / BigInt(1e9)).toString();
      context.log(`   ${stakeXRLC} xRLC`, "output");
      context.log("", "output");

      const stakeAmount = BigInt(stakeNRLC);
      if (stakeAmount === BigInt(0)) {
        context.log("⚠️ Your iExec account stake is 0!", "warning");
        context.log("", "output");
        context.log("You need to deposit xRLC to send messages:", "output");
        context.log("", "output");
        const depositHtml = createCommandLine("tg-deposit 1", "Deposit 1 xRLC");
        context.logHtml(depositHtml);
      } else if (stakeAmount < BigInt(1e9)) {
        context.log("⚠️ Low balance!", "warning");
        context.log("Consider depositing more xRLC for more messages.", "output");
      } else {
        context.log("✅ You have enough balance to send messages!", "success");
      }
      
      context.log("", "output");
      context.log("💡 INFO:", "info");
      context.log("• Each message costs ~0.1 nRLC", "output");
      const messageCount = Number(stakeAmount / BigInt(1e8));
      context.log(`• You can send ~${messageCount} messages`, "output");
    } catch (error: any) {
      context.log("❌ Failed to check balance!", "error");
      context.log("", "output");
      context.log(`Error: ${error.message}`, "error");
      console.error("[tg-balance] Full error:", error);
    }
  },
};

/**
 * tg-reset command - Clear local data and reset account
 */
export const tgResetCommand: Command = {
  name: "tg-reset",
  description: "Clear local Web3Telegram data (for troubleshooting)",
  usage: "tg-reset",
  category: "communication",
  handler: async (context: CommandContext, args: string[]) => {
    context.log("⚠️ RESET WEB3TELEGRAM DATA", "warning");
    context.log("═══════════════════════════════", "output");
    context.log("", "output");
    context.log("This will clear your local Web3Telegram data:", "output");
    context.log("• Protected data reference", "output");
    context.log("• Contacts list", "output");
    context.log("• Configuration", "output");
    context.log("", "output");
    context.log("⚠️ Your on-chain data is NOT affected!", "warning");
    context.log("You can recover your account with tg-recover", "output");
    context.log("", "output");

    try {
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("web3telegram-protected-data");
        localStorage.removeItem("web3telegram-contacts");
        localStorage.removeItem("web3telegram-config");
      }

      context.log("✅ Local data cleared successfully!", "success");
      context.log("", "output");
      context.log("🔄 Please refresh the page to complete the reset.", "info");
      context.log("", "output");
      context.log("📋 NEXT STEPS:", "info");
      context.log("1. Refresh your browser page", "output");
      context.log("2. Reconnect your wallet: connect", "output");
      context.log("3. Setup your account again: tg-setup 6403690595 Abubaker", "output");
      context.log("", "output");
      context.log("💡 The new account will have the correct schema!", "info");
    } catch (error: any) {
      context.log(`❌ Error clearing data: ${error.message}`, "error");
    }
  },
};

/**
 * Export all Web3Telegram commands
 */
export const web3telegramCommands: Command[] = [
  tgCommand,
  tgSetupCommand,
  tgSendCommand,
  tgContactsCommand,
  tgAddContactCommand,
  tgRemoveContactCommand,
  tgGrantCommand,
  tgAccessCommand,
  tgRevokeCommand,
  tgRefreshCommand,
  tgStatusCommand,
  tgConfigCommand,
  tgBalanceCommand,
  tgDepositCommand,
  tgDebugCommand,
  tgRecoverCommand,
  tgResetCommand,
];
