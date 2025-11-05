/**
 * Aptos Commands
 * Commands for Aptos blockchain operations including wallet management and token creation
 */

import type { Command } from "@/types/commands";
import { Aptos, AptosConfig, Network, getAccountAPTAmount } from "@aptos-labs/ts-sdk";

const APTOS_CONFIG = new AptosConfig({ network: Network.MAINNET });
const aptosClient = new Aptos(APTOS_CONFIG);
const DEFAULT_FACTORY_ADDRESS =
  "0x3df5482f5555633e5f0dfbe189eff42c24779fdc73d6bc4649733003eb1ef566";

async function getConnectedAddress(): Promise<string | null> {
  const provider = (window as any).aptos;
  if (!provider) return null;
  try {
    const account = await provider.account?.();
    return account?.address || null;
  } catch {
    return null;
  }
}

function getProvider(): any | null {
  if (typeof window === "undefined") return null;

  const aptosWindow = (window as any).aptos;
  if (!aptosWindow) return null;

  if (typeof aptosWindow.signAndSubmitTransaction === "function") {
    return aptosWindow;
  }

  if (aptosWindow.wallet && typeof aptosWindow.wallet.signAndSubmitTransaction === "function") {
    return aptosWindow.wallet;
  }

  return aptosWindow;
}

async function signAndSubmit(payload: any, context?: any): Promise<string | null> {
  const provider = getProvider();
  if (!provider) {
    throw new Error("Aptos wallet provider not available.");
  }

  if (context) {
    context.log(`Checking wallet provider methods...`, "info");
    context.log(`Available methods: ${JSON.stringify(Object.keys(provider || {}))}`, "info");
  }

  let signAndSubmitMethod: any = null;

  if (typeof provider.signAndSubmitTransaction === "function") {
    signAndSubmitMethod = provider.signAndSubmitTransaction.bind(provider);
  } else if (typeof provider.signAndSubmit === "function") {
    signAndSubmitMethod = provider.signAndSubmit.bind(provider);
  } else if (typeof provider.signTransaction === "function" && typeof provider.submitTransaction === "function") {
    if (context) {
      context.log(`Using separate sign and submit methods...`, "info");
    }
    try {
      const signedTx = await provider.signTransaction(payload);
      const res = await provider.submitTransaction(signedTx);
      return res?.hash || res?.txHash || null;
    } catch (err: any) {
      if (context) {
        context.log(`Separate sign/submit error: ${err?.message ?? err}`, "error");
      }
      throw err;
    }
  } else {
    throw new Error(`Wallet provider missing signAndSubmitTransaction method. Available: ${Object.keys(provider || {}).join(", ")}`);
  }

  if (context) {
    context.log(`Calling wallet signAndSubmitTransaction...`, "info");
    context.log(`Payload type: ${payload?.type}, function: ${payload?.function}`, "info");
  }

  try {
    const res = await signAndSubmitMethod(payload);
    const txHash = res?.hash || res?.txHash || res?.transactionHash || null;
    if (context) {
      if (!txHash) {
        context.log(`Warning: Transaction response: ${JSON.stringify(res)}`, "warning");
      } else {
        context.log(`Transaction hash received: ${txHash}`, "success");
      }
    }
    return txHash;
  } catch (err: any) {
    if (context) {
      context.log(`Wallet error: ${err?.message ?? err}`, "error");
      if (err?.code) {
        context.log(`Error code: ${err.code}`, "error");
      }
    }
    throw err;
  }
}

async function handleConnect(context: any) {
  if (typeof window === "undefined") {
    context.log("Aptos wallet connection is only available in the browser.", "error");
    return;
  }

  context.log("Attempting to connect your Aptos wallet (Petra)...", "info");
  try {
    const provider = (window as any).aptos;
    if (provider && typeof provider.connect === "function") {
      const res = await provider.connect();
      const acct = res?.address || (await provider.account?.())?.address;
      context.log("Aptos wallet connected!", "success");
      if (acct) context.log(`Address: ${acct}`, "output");
    } else {
      context.log(
        "No Aptos wallet (Petra) extension detected. Install Petra Wallet: https://petra.app/",
        "error"
      );
    }
  } catch (err: any) {
    context.log(`Aptos wallet connection failed: ${err?.message ?? err}`, "error");
  }
}

async function handleBalance(context: any) {
  if (typeof window === "undefined") {
    context.log("Aptos balance check is only available in the browser.", "error");
    return;
  }

  try {
    const address = await getConnectedAddress();
    if (!address) {
      context.log("Connect wallet first: aptos connect", "warning");
      return;
    }

    context.log(`Checking APT balance for ${address}...`, "info");
    const amount = await getAccountAPTAmount({ aptosConfig: APTOS_CONFIG, accountAddress: address });
    const aptAmount = Number(amount) / 1e8; // APT has 8 decimals
    context.log(`💰 APT Balance: ${aptAmount.toFixed(8)} APT`, "success");
  } catch (err: any) {
    context.log(`Balance error: ${err?.message ?? err}`, "error");
  }
}

// --- Token Factory: create token + optional initial mint ---
async function handleCreateToken(context: any, args: string[]) {
  // Usage: aptos create token [factoryAddress] <name> <symbol> <decimals> <iconUri> <projectUri> [initialMint]
  // If factory address omitted, uses DEFAULT_FACTORY_ADDRESS
  let parts = args.slice(2);

  // If user only typed: aptos create token -> open interactive wizard
  if (parts.length === 1 && parts[0]?.toLowerCase() === "token") {
    const factoryHint = DEFAULT_FACTORY_ADDRESS;
    const html = `
      <div style="border:1px solid rgba(0,188,242,0.4);padding:14px;border-radius:8px;margin:8px 0;background:rgba(255,255,255,0.03)">
        <div style="font-weight:600;color:#00bcf2;margin-bottom:8px">Aptos Token Creator (Mainnet)</div>
        <div style="font-size:12px;color:#aaa;margin-bottom:6px">Factory: ${factoryHint}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <input id="aptos_tok_name" placeholder="Token Name" style="padding:8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff" />
          <input id="aptos_tok_symbol" placeholder="Token Symbol (e.g., MYT)" style="padding:8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff" />
          <input id="aptos_tok_decimals" placeholder="Decimals (e.g., 8)" style="padding:8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff" />
          <input id="aptos_tok_icon" placeholder="Icon URL" style="padding:8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff" />
          <input id="aptos_tok_project" placeholder="Project URL" style="padding:8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff" />
          <input id="aptos_tok_initial" placeholder="Initial Mint (whole tokens, optional)" style="padding:8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff" />
        </div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button id="aptos_tok_submit" style="background:#00bcf2;border:0;color:#000;padding:8px 12px;border-radius:6px;cursor:pointer">Create</button>
          <button id="aptos_tok_cancel" style="background:#333;border:1px solid #555;color:#ddd;padding:8px 12px;border-radius:6px;cursor:pointer">Cancel</button>
        </div>
      </div>`;
    context.logHtml(html);
    if (typeof window !== "undefined") {
      (window as any).__aptosCreateTokenSubmit = async () => {
        const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value?.trim();

        const name = g("aptos_tok_name");
        const symbol = g("aptos_tok_symbol");
        const decimals = g("aptos_tok_decimals");
        const icon = g("aptos_tok_icon");
        const project = g("aptos_tok_project");
        const initial = g("aptos_tok_initial");

        const cmd = `aptos create token ${name} ${symbol} ${decimals} ${icon} ${project}${initial ? " " + initial : ""}`;
        await context.executeCommand(cmd);
      };

      setTimeout(() => {
        const submit = document.getElementById("aptos_tok_submit");
        const cancel = document.getElementById("aptos_tok_cancel");
        if (submit) submit.addEventListener("click", () => (window as any).__aptosCreateTokenSubmit?.());
        if (cancel) cancel.addEventListener("click", () => context.log("Canceled.", "info"));
      }, 0);
    }
    return;
  }
  // If user kept the subkeyword 'token' in the same line, drop it
  if (parts[0]?.toLowerCase() === "token") {
    parts = parts.slice(1);
  }

  let factoryAddress = DEFAULT_FACTORY_ADDRESS;
  if (parts[0] && parts[0].startsWith("0x")) {
    factoryAddress = parts[0];
    parts = parts.slice(1);
  }
  const [name, symbol, decimalsStr, iconUri, projectUri, initialMintStr] = parts;

  if (!name || !symbol || !decimalsStr || !iconUri || !projectUri) {
    context.log(
      "Usage: aptos create token [factoryAddress] <name> <symbol> <decimals> <iconUri> <projectUri> [initialMint]",
      "error"
    );
    return;
  }

  const address = await getConnectedAddress();
  if (!address) {
    context.log("Please connect your Aptos wallet (Petra) first.", "warning");
    return;
  }

  const decimals = Number(decimalsStr);
  if (!Number.isFinite(decimals)) {
    context.log("Invalid decimals value", "error");
    return;
  }

  try {
    context.log("📦 Creating token via token factory...", "info");
    const createPayload = {
      type: "entry_function_payload",
      function: `${factoryAddress}::token_factory_v2::create_token`,
      type_arguments: [],
      arguments: [name, symbol, decimals, iconUri, projectUri],
    };

    const createHash = await signAndSubmit(createPayload, context);
    context.log(`✅ create_token submitted: ${createHash}`, "success");
    context.log(`🔍 View on explorer: https://explorer.aptoslabs.com/txn/${createHash}?network=mainnet`, "info");

    if (initialMintStr) {
      // Support human-friendly whole-token input; auto-scale by decimals
      // If value ends with 'o'/'octas'/'raw', treat as base units
      const raw = /\s*(o|octas|raw)$/i.test(initialMintStr);
      const cleaned = initialMintStr.replace(/[,\s_]/g, "").replace(/(o|octas|raw)$/i, "");
      let amount = BigInt(0);
      if (raw) {
        amount = BigInt(cleaned);
      } else {
        // Scale whole tokens by 10^decimals
        const base = BigInt(cleaned);
        const scale = 10n ** BigInt(decimals);
        amount = base * scale;
      }
      context.log("🪙 Minting initial supply to your address...", "info");
      const mintPayload = {
        type: "entry_function_payload",
        function: `${factoryAddress}::token_factory_v2::mint`,
        type_arguments: [],
        arguments: [symbol, address, amount.toString()],
      };

      const mintHash = await signAndSubmit(mintPayload, context);
      context.log(`✅ mint submitted: ${mintHash}`, "success");
      context.log(`🔍 View on explorer: https://explorer.aptoslabs.com/txn/${mintHash}?network=mainnet`, "info");
      context.log(
        `Note: initial mint interpreted as ${raw ? "base units" : "whole tokens scaled by 10^decimals"}.`,
        "info"
      );
    }
  } catch (err: any) {
    context.log(`Token factory error: ${err?.message ?? err}`, "error");
  }
}

export const aptosCommand: Command = {
  name: "aptos",
  aliases: ["apt"],
  description: "Aptos tools (wallet, token creation)",
  usage: "aptos <connect|balance|create token>",
  category: "aptos",
  handler: async (context, args) => {
    const sub = (args[1] || "help").toLowerCase();

    switch (sub) {
      case "connect":
        await handleConnect(context);
        break;
      case "balance":
        await handleBalance(context);
        break;
      case "create":
        if (args[2]?.toLowerCase() === "token") {
          await handleCreateToken(context, args);
        } else {
          context.log("Usage: aptos create token", "error");
        }
        break;
      case "help":
      default:
        context.log("=== Aptos Commands ===", "info");
        context.log("aptos connect         → Connect Petra wallet (mainnet)", "output");
        context.log("aptos balance         → Show APT balance for connected wallet", "output");
        context.log("aptos create token    → Create fungible token (wizard)", "output");
        break;
    }
  },
};

export const aptosCommands: Command[] = [aptosCommand];

