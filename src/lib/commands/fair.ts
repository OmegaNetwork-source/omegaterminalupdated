/**
 * Fair Blockchain Commands
 * FULL IMPLEMENTATION from vanilla terminal.html
 */

import type { Command, CommandContext } from "@/types/commands";
import { Wallet, JsonRpcProvider, formatEther } from "ethers";

// Fair Network Configuration
const FAIR_CONFIG = {
  chainId: "0x3a7", // 935 in hex
  chainIdDecimal: 935,
  chainName: "FAIR Testnet Beta",
  nativeCurrency: {
    name: "FAIR",
    symbol: "FAIR",
    decimals: 18,
  },
  rpcUrls: ["https://testnet-rpc.fair.cloud"],
  blockExplorerUrls: ["https://testnet-explorer.fair.cloud"],
  faucetUrl: "https://faucet.fairchain.ai",
};

/**
 * Generate Fair Wallet
 */
async function generateFairWallet(context: CommandContext): Promise<void> {
  try {
    const wallet = Wallet.createRandom();

    // Store in window (for vanilla compatibility)
    if (typeof window !== "undefined") {
      (window as any).fairWallet = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        wallet: wallet,
        network: "FAIR Testnet",
        chainId: 935,
        rpcUrl: "https://testnet-rpc.fair.cloud",
      };
    }

    context.log("✅ New FAIR Wallet Generated!", "success");
    context.log("", "output");
    context.log(
      "⚠️  SECURITY WARNING: Save your private key securely!",
      "error"
    );
    context.log("Anyone with this key can access your funds!", "error");
    context.log("", "output");
    context.log("📋 WALLET DETAILS:", "info");
    context.logHtml(
      `<b>Address:</b> <span class="copyable" style="cursor:pointer;color:#00d4ff" onclick="navigator.clipboard.writeText('${wallet.address}').then(() => alert('✅ Address copied!'))">${wallet.address}</span>`
    );
    context.logHtml(
      `<b>Private Key:</b> <span class="copyable" style="cursor:pointer;color:#ff6b6b" onclick="navigator.clipboard.writeText('${wallet.privateKey}').then(() => alert('✅ Private key copied!'))">${wallet.privateKey}</span>`
    );
    if (wallet.mnemonic) {
      context.log(`Mnemonic: ${wallet.mnemonic.phrase}`, "output");
    }
    context.log(`Network: FAIR Testnet Beta`, "output");
    context.log(`Chain ID: 935`, "output");
    context.log(`RPC URL: https://testnet-rpc.fair.cloud`, "output");
    context.logHtml(
      `<a href="https://testnet-explorer.fair.cloud" target="_blank" style="color:#00d4ff">🔍 Explorer: testnet-explorer.fair.cloud</a>`
    );
    context.log("", "output");
    context.logHtml(
      '<a href="https://faucet.fairchain.ai" target="_blank" style="color:#00ff80">💡 Get testnet FAIR from the FAIR Faucet</a>'
    );
    context.log('💡 Use "fair balance" to check your balance', "info");
  } catch (error: any) {
    context.log(`❌ Failed to generate FAIR wallet: ${error.message}`, "error");
  }
}

/**
 * Connect to Fair Network with MetaMask
 */
async function connectToFairNetwork(context: CommandContext): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) {
    context.log("❌ MetaMask not detected. Please install MetaMask.", "error");
    return;
  }

  try {
    context.log("🔌 Connecting to FAIR Network...", "info");

    // Try to switch to Fair network first
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: FAIR_CONFIG.chainId }],
      });
      context.log("✅ Switched to FAIR Testnet Beta", "success");
    } catch (switchError: any) {
      // Network not added, add it
      if (switchError.code === 4902) {
        context.log("📡 Adding FAIR Network to MetaMask...", "info");
        // Only send the fields MetaMask accepts
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: FAIR_CONFIG.chainId,
              chainName: FAIR_CONFIG.chainName,
              nativeCurrency: FAIR_CONFIG.nativeCurrency,
              rpcUrls: FAIR_CONFIG.rpcUrls,
              blockExplorerUrls: FAIR_CONFIG.blockExplorerUrls,
            },
          ],
        });
        context.log("✅ FAIR Network added to MetaMask", "success");
      } else {
        throw switchError;
      }
    }

    // Request account access
    const accounts: string[] = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    if (accounts && accounts.length > 0) {
      context.log("✅ Connected to FAIR Network!", "success");
      context.log("", "output");
      context.log(`👤 Address: ${accounts[0]}`, "output");
      context.log(`🌐 Network: ${FAIR_CONFIG.chainName}`, "output");
      context.log(`🔗 Chain ID: 935`, "output");
      context.log("", "output");
      context.log('💡 Use "fair balance" to check your balance', "info");
      context.log('💡 Use "fair faucet" to get testnet tokens', "info");
    }
  } catch (error: any) {
    context.log(
      `❌ Error connecting to FAIR Network: ${error.message}`,
      "error"
    );
    if (error.code === 4001) {
      context.log("💡 Connection rejected by user", "info");
    }
  }
}

/**
 * Check Fair Balance
 */
async function checkFairBalance(context: CommandContext): Promise<void> {
  try {
    let address: string | undefined;
    let provider: JsonRpcProvider;

    if (typeof window !== "undefined" && (window as any).fairWallet) {
      address = (window as any).fairWallet.address;
      provider = new JsonRpcProvider("https://testnet-rpc.fair.cloud");
    } else if (
      context.wallet.state.isConnected &&
      context.wallet.state.address
    ) {
      address = context.wallet.state.address;
      const signer = await context.wallet.getSigner();
      provider = signer?.provider as JsonRpcProvider;
    } else {
      context.log("❌ No FAIR wallet found. Use: fair generate", "error");
      context.log('💡 Or use "fair connect" to connect MetaMask', "info");
      return;
    }

    if (!address) {
      context.log("❌ No wallet address available", "error");
      return;
    }

    context.log("🔍 Checking FAIR balance...", "info");

    // Play balance sound effect
    if (context.sound) {
      try {
        await context.sound.playBalanceWealthSound();
      } catch {
        // Ignore sound errors
      }
    }

    const balance = await provider.getBalance(address);
    const fairBalance = formatEther(balance);

    context.log("", "output");
    context.log(`💰 FAIR Balance: ${fairBalance} FAIR`, "success");
    context.log(`📍 Address: ${address}`, "output");
    context.log("", "output");
  } catch (error: any) {
    context.log(`❌ Failed to check balance: ${error.message}`, "error");
  }
}

/**
 * Fair Command - Fair Blockchain Integration
 */
export const fairCommand: Command = {
  name: "fair",
  description: "Fair Blockchain operations",
  usage: "fair <generate|connect|balance|wallet|faucet|help>",
  category: "blockchain",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      context.log("🔗 FAIR BLOCKCHAIN COMMANDS", "info");
      context.log("═══════════════════════════", "output");
      context.log("", "output");
      context.log("📋 AVAILABLE COMMANDS:", "info");
      context.log("  fair generate     Generate a new FAIR wallet", "output");
      context.log(
        "  fair connect      Connect MetaMask to FAIR network",
        "output"
      );
      context.log(
        "  fair wallet       Show current FAIR wallet details",
        "output"
      );
      context.log("  fair balance      Check FAIR balance", "output");
      context.log("  fair faucet       Get testnet FAIR tokens", "output");
      context.log("", "output");
      context.log("🌐 NETWORK INFO:", "info");
      context.log("Chain ID: 935", "output");
      context.log("RPC: https://testnet-rpc.fair.cloud", "output");
      context.log("Explorer: https://testnet-explorer.fair.cloud", "output");
      context.log("Faucet: https://faucet.fairchain.ai", "output");
      context.log("", "output");
      context.log('💡 Use "fair generate" to create a new wallet', "info");
      context.log('💡 Use "fair connect" to connect MetaMask', "info");
      context.log('💡 Use "create" command for token creation on FAIR', "info");
      return;
    }

    switch (subcommand) {
      case "generate":
      case "gen":
        await generateFairWallet(context);
        break;

      case "connect":
        await connectToFairNetwork(context);
        break;

      case "wallet":
      case "info":
        if (typeof window !== "undefined" && (window as any).fairWallet) {
          const fw = (window as any).fairWallet;
          context.log("📱 Current FAIR Wallet:", "info");
          context.log("", "output");
          context.logHtml(
            `<b>Address:</b> <span class="copyable" style="cursor:pointer;color:#00d4ff" onclick="navigator.clipboard.writeText('${fw.address}').then(() => alert('Copied!'))">${fw.address}</span>`
          );
          context.log(`Network: ${fw.network}`, "output");
          context.log(`Chain ID: ${fw.chainId}`, "output");
          context.log(`RPC URL: ${fw.rpcUrl}`, "output");
        } else if (context.wallet.state.isConnected) {
          context.log("Connected with MetaMask:", "info");
          context.log(`Address: ${context.wallet.state.address}`, "output");
          context.log("Network: FAIR Testnet Beta", "output");
        } else {
          context.log("❌ No FAIR wallet generated or connected.", "warning");
          context.log('💡 Use "fair generate" to create a wallet', "info");
          context.log('💡 Or use "fair connect" to connect MetaMask', "info");
        }
        break;

      case "balance":
      case "bal":
        await checkFairBalance(context);
        break;

      case "faucet":
        context.log("💧 FAIR Testnet Faucet", "info");
        context.log("", "output");

        let faucetAddress: string | undefined;
        if (typeof window !== "undefined" && (window as any).fairWallet) {
          faucetAddress = (window as any).fairWallet.address;
        } else if (context.wallet.state.address) {
          faucetAddress = context.wallet.state.address;
        }

        if (faucetAddress) {
          context.log(`📍 Your Address: ${faucetAddress}`, "output");
          context.log("✅ Address copied to clipboard!", "success");

          // Copy to clipboard
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            try {
              await navigator.clipboard.writeText(faucetAddress);
            } catch {
              // Ignore clipboard errors
            }
          }

          context.log("", "output");
          context.logHtml(
            '<a href="https://faucet.fairchain.ai" target="_blank" style="color:#00ff80">🌐 Open FAIR Faucet (in new tab)</a>'
          );
          context.log("", "output");
          context.log("📝 Instructions:", "info");
          context.log("  1. Click the faucet link above", "output");
          context.log("  2. Your address is already copied!", "success");
          context.log("  3. Paste it in the faucet form", "output");
          context.log("  4. Request testnet FAIR tokens", "output");
        } else {
          context.log("❌ No wallet found", "error");
          context.log('💡 Use "fair generate" or "fair connect" first', "info");
        }
        break;

      default:
        context.log(`❌ Unknown Fair command: ${subcommand}`, "error");
        context.log('Type "fair help" for available commands', "info");
        context.log("", "output");
        context.log("💡 For token creation, use: create", "info");
        context.log("💡 For NFT minting, use: omega mint", "info");
    }
  },
};

/**
 * FNS (Fair Name Service) Command
 */
export const fnsCommand: Command = {
  name: "fns",
  description: "Fair Name Service",
  usage: "fns <register|resolve|help> [name]",
  category: "blockchain",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    if (!subcommand || subcommand === "help") {
      context.log("🔗 FAIR NAME SERVICE (FNS)", "info");
      context.log("═══════════════════════════", "output");
      context.log("", "output");
      context.log("📋 AVAILABLE COMMANDS:", "info");
      context.log("  fns register <name>       Register a Fair name", "output");
      context.log(
        "  fns resolve <name>        Resolve name to address",
        "output"
      );
      context.log("", "output");
      context.log("💡 FNS is the naming system for Fair Blockchain", "info");
      context.log("Similar to ENS for Ethereum", "output");
      context.log("", "output");
      context.log(
        "🔗 FNS Contract: 0x2d06d9568ae99f61f421ea99a46969878986fc2d",
        "output"
      );
      context.log("", "output");
      context.log("Examples:", "info");
      context.log("  fns register myname     # Register myname.fns", "output");
      context.log("  fns resolve myname      # Look up myname.fns", "output");
      context.log("", "output");
      context.log('💡 Connect to FAIR Network first: "fair connect"', "info");
      return;
    }

    switch (subcommand) {
      case "register":
        if (!args[2]) {
          context.log("❌ Usage: fns register <name>", "error");
          context.log("Example: fns register myname", "info");
          return;
        }
        context.log(`🔗 Registering FNS name: ${args[2]}.fns`, "info");
        context.log("", "output");
        context.log("💡 FNS registration requires:", "info");
        context.log("  1. Connection to FAIR Network (fair connect)", "output");
        context.log("  2. FAIR tokens for registration fee", "output");
        context.log("", "output");
        context.log(
          "🔗 FNS Contract: 0x2d06d9568ae99f61f421ea99a46969878986fc2d",
          "output"
        );
        break;

      case "resolve":
        if (!args[2]) {
          context.log("❌ Usage: fns resolve <name>", "error");
          context.log("Example: fns resolve myname", "info");
          return;
        }
        context.log(`🔍 Resolving FNS name: ${args[2]}.fns`, "info");
        context.log("", "output");
        context.log('💡 Connect to FAIR Network first: "fair connect"', "info");
        break;

      default:
        context.log(`❌ Unknown FNS command: ${subcommand}`, "error");
        context.log('Type "fns help" for available commands', "info");
    }
  },
};

export const fairCommands: Command[] = [fairCommand, fnsCommand];
