/**
 * ChainGPT Smart Contract Generator Commands Module
 * Migrated from js/commands/chaingpt-smart-contract.js to TypeScript
 *
 * ChainGPT AI Smart Contract Generator:
 * - contract init: Initialize with API key
 * - contract generate: Generate smart contract
 * - contract templates: Show available templates
 * - contract chains: Show supported blockchains
 * - contract test: Test API connection
 * - contract help: Show help and examples
 */

import type { Command, CommandContext } from "@/types/commands";
import { createCommandLine } from "./command-output-helpers";
import { chaingpt } from "@/lib/api";
import { escapeHtml } from "@/lib/utils";
import { config } from "@/lib/config";

/**
 * Supported contract types
 */
const CONTRACT_TYPES: Record<string, string> = {
  token: "ERC-20 Token Contract",
  nft: "ERC-721 NFT Contract",
  nft1155: "ERC-1155 Multi-Token Contract",
  dex: "DEX/AMM Contract",
  staking: "Staking Contract",
  vault: "Vault Contract",
  dao: "DAO Governance Contract",
  auction: "Auction Contract",
  lottery: "Lottery Contract",
  marketplace: "NFT Marketplace Contract",
  bridge: "Cross-Chain Bridge Contract",
  lending: "Lending Protocol Contract",
  farming: "Yield Farming Contract",
  custom: "Custom Contract",
};

/**
 * Supported blockchains
 */
const SUPPORTED_CHAINS: Record<string, string> = {
  ethereum: "Ethereum Mainnet",
  bsc: "BNB Smart Chain",
  arbitrum: "Arbitrum One",
  avalanche: "Avalanche C-Chain",
  polygon: "Polygon",
  optimism: "Optimism",
  base: "Base",
  berachain: "Berachain",
  solana: "Solana",
};

/**
 * Build contract generation prompt with options
 */
function buildContractPrompt(
  prompt: string,
  options: {
    contractType?: string;
    blockchain?: string;
    features?: string[];
    securityLevel?: string;
  }
): string {
  let question = prompt;

  // Add contract type context
  if (options.contractType && options.contractType !== "custom") {
    const typeName =
      CONTRACT_TYPES[options.contractType] || options.contractType;
    question = `Generate a ${typeName}: ${question}`;
  }

  // Add blockchain context
  if (options.blockchain && options.blockchain !== "ethereum") {
    const chainName =
      SUPPORTED_CHAINS[options.blockchain] || options.blockchain;
    question += ` for ${chainName}`;
  }

  // Add features
  if (options.features && options.features.length > 0) {
    question += ` with features: ${options.features.join(", ")}`;
  }

  // Add security level
  if (options.securityLevel && options.securityLevel !== "standard") {
    question += ` with ${options.securityLevel} security level`;
  }

  return question;
}

/**
 * Handle contract initialization
 */
async function handleInit(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const apiKey = args[2]; // Optional API key from user

  try {
    const result = await chaingpt.initialize(apiKey);

    if (result.success) {
      context.log(
        "✅ ChainGPT Smart Contract Generator initialized!",
        "success"
      );
      context.log("", "output");

      if (result.message) {
        context.log(result.message, "info");
      }

      context.log("", "output");
      context.log("📖 NEXT STEPS:", "info");
      context.log("", "output");
      context.log("1. Generate a contract:", "output");
      context.log("   contract generate ERC-20 token with minting", "info");
      context.log("", "output");
      context.log("2. View templates:", "output");
      context.log("   contract templates", "info");
      context.log("", "output");
      context.log("3. Get help:", "output");
      context.log("   contract help", "info");
    } else {
      context.log(`❌ Initialization failed: ${result.error}`, "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Handle contract generation
 */
async function handleGenerate(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // No init required - API will use server keys automatically if available

  // Get prompt - skip 'contract' and 'generate' if present
  let promptParts = args.slice(1);
  if (promptParts[0] === "generate") {
    promptParts = promptParts.slice(1);
  }

  let prompt = promptParts.join(" ").trim();

  if (!prompt) {
    context.log("❌ Please provide a contract description", "error");
    context.log("", "output");
    const exampleHtml = createCommandLine("contract generate ERC-20 token with minting", "Example contract generation");
    context.logHtml(exampleHtml);
    return;
  }

  // Parse options from prompt
  const options: {
    contractType?: string;
    blockchain?: string;
    features?: string[];
    securityLevel?: string;
  } = {};

  // Extract --type option
  const typeMatch = prompt.match(/--type[=\s]+(\w+)/i);
  if (typeMatch) {
    options.contractType = typeMatch[1]!.toLowerCase();
    prompt = prompt.replace(typeMatch[0], "").trim();
  }

  // Extract --chain option
  const chainMatch = prompt.match(/--chain[=\s]+(\w+)/i);
  if (chainMatch) {
    options.blockchain = chainMatch[1]!.toLowerCase();
    prompt = prompt.replace(chainMatch[0], "").trim();
  }

  // Extract --features option
  const featuresMatch = prompt.match(/--features[=\s]+([^\-]+)/i);
  if (featuresMatch) {
    options.features = featuresMatch[1]!.split(",").map((f) => f.trim());
    prompt = prompt.replace(featuresMatch[0], "").trim();
  }

  // Extract --security option
  const securityMatch = prompt.match(/--security[=\s]+(\w+)/i);
  if (securityMatch) {
    options.securityLevel = securityMatch[1]!.toLowerCase();
    prompt = prompt.replace(securityMatch[0], "").trim();
  }

  // Build full question
  const question = buildContractPrompt(prompt, options);

  try {
    context.log(`🔨 Generating smart contract...`, "info");

    if (options.contractType) {
      context.log(
        `   Type: ${
          CONTRACT_TYPES[options.contractType] || options.contractType
        }`,
        "output"
      );
    }
    if (options.blockchain) {
      context.log(
        `   Chain: ${
          SUPPORTED_CHAINS[options.blockchain] || options.blockchain
        }`,
        "output"
      );
    }
    if (options.securityLevel) {
      context.log(`   Security: ${options.securityLevel}`, "output");
    }

    context.log("⏳ Generating code...", "info");
    context.log("", "output");

    // Get stream reader
    const reader = await chaingpt.generateContract({
      model: config.CHAINGPT.SMART_CONTRACT_MODEL,
      question: question,
      chatHistory: "off",
    });

    const decoder = new TextDecoder();
    let contractCode = "";
    let pending = "";
    let parseBuffer = "";

    // Read stream chunks
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Flush any remaining pending text
        if (pending) {
          const result = chaingpt.parseStreamChunk(pending, parseBuffer);
          if (result.content) {
            context.log(result.content, "output");
            contractCode += result.content;
          }
        }
        break;
      }

      // Decode chunk with stream flag to handle multi-byte characters
      const chunk = decoder.decode(value, { stream: true });
      pending += chunk;

      // Process complete lines only
      const lines = pending.split("\n");
      pending = lines.pop() || "";

      for (const line of lines) {
        const result = chaingpt.parseStreamChunk(line + "\n", parseBuffer);
        parseBuffer = result.buffer;

        if (result.content) {
          // Log chunk immediately for progressive display
          context.log(result.content, "output");
          contractCode += result.content;
        }
      }
    }

    // Display contract with styled HTML card (theme-compatible)
    const html = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
        max-width: 100%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <div style="
              font-size: 32px;
              line-height: 1;
            ">📜</div>
            <div style="
              font-size: 18px;
              font-weight: 600;
              color: var(--palette-primary, #00d4ff);
              text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
            ">Generated Smart Contract</div>
          </div>
          <button
            onclick="navigator.clipboard.writeText(this.getAttribute('data-code')); this.textContent='✅ Copied!'; setTimeout(() => this.textContent='📋 Copy', 2000)"
            data-code="${escapeHtml(contractCode)}"
            style="
              background: color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
              border-radius: 6px;
              padding: 8px 16px;
              color: var(--palette-primary, #00d4ff);
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background='color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)'; this.style.borderColor='var(--palette-primary, #00d4ff)';"
            onmouseout="this.style.background='color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)'; this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent)';"
          >📋 Copy</button>
        </div>
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 80%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent);
          border-radius: 8px;
          padding: 16px;
          max-height: 500px;
          overflow-y: auto;
        ">
          <pre style="
            color: var(--palette-secondary, #00ff88);
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
          ">${escapeHtml(contractCode)}</pre>
        </div>
        <div style="
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 50%, transparent);
          font-size: 12px;
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        ">
          <span style="color: var(--palette-primary, #00d4ff);">💳</span>
          <span>Credits used: <strong style="color: var(--palette-secondary, #00ff88);">varies</strong> (contract generation)</span>
          ${
            options.securityLevel
              ? `<span style="margin-left: 12px;"><span style="color: var(--palette-primary, #00d4ff);">🔒</span> Security level: <strong style="color: var(--palette-text, #e0e0e0);">${options.securityLevel}</strong></span>`
              : ""
          }
        </div>
      </div>
    `;

    context.logHtml(html);

    context.log("", "output");
    context.log("✅ Contract generated successfully!", "success");
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    const errorStr = errorMsg.toLowerCase();
    
    // Check if it's an API key/configuration error
    if (errorStr.includes("key") || errorStr.includes("api") || 
        errorStr.includes("401") || errorStr.includes("403") ||
        errorStr.includes("not configured") || errorStr.includes("503")) {
      context.log(`❌ API Configuration Error`, "error");
      context.log("", "output");
      context.log("💡 ChainGPT Smart Contract Generator requires an API key:", "info");
      context.log("", "output");
      context.log("Option 1: Use your own API key (recommended):", "output");
      context.log("   contract init <your-api-key>", "info");
      context.log("   Get one at: https://api.chaingpt.org", "output");
      context.log("", "output");
      context.log("Option 2: Server keys may be configured by admin", "output");
      context.log("   Contact the administrator if server keys are expected", "info");
    } else {
      context.log(`❌ Error: ${errorMsg}`, "error");
      context.log("", "output");
      context.log("💡 Troubleshooting:", "info");
      context.log("   • Try simpler prompt", "output");
      context.log("   • Check API connection: contract test", "output");
      context.log("   • Get help: contract help", "output");
    }
  }
}

/**
 * Handle contract templates
 */
function handleTemplates(context: CommandContext, args: string[]): void {
  context.log("", "output");
  context.log("📋 SMART CONTRACT TEMPLATES", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  for (const [key, name] of Object.entries(CONTRACT_TYPES)) {
    context.log(`  ${key.padEnd(15)} → ${name}`, "output");
  }

  context.log("", "output");
  context.log("💡 USAGE EXAMPLES:", "info");
  context.log("", "output");
  context.log("  # Generate with type", "output");
  context.log("  contract generate --type token MyToken with minting", "info");
  context.log("", "output");
  context.log("  # Generate with chain", "output");
  context.log("  contract generate --type nft --chain polygon ArtNFT", "info");
  context.log("", "output");
  context.log("  # Generate with features", "output");
  context.log(
    "  contract generate --type token --features burning,pausing",
    "info"
  );
  context.log("", "output");
}

/**
 * Handle supported chains
 */
function handleChains(context: CommandContext, args: string[]): void {
  context.log("", "output");
  context.log("🌐 SUPPORTED BLOCKCHAINS", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  for (const [key, name] of Object.entries(SUPPORTED_CHAINS)) {
    context.log(`  ${key.padEnd(12)} → ${name}`, "output");
  }

  context.log("", "output");
  context.log("💡 USAGE EXAMPLES:", "info");
  context.log("", "output");
  context.log("  # Generate for specific chain", "output");
  context.log("  contract generate --chain bsc BEP-20 token", "info");
  context.log("", "output");
  context.log("  # Generate for Arbitrum", "output");
  context.log("  contract generate --chain arbitrum NFT marketplace", "info");
  context.log("", "output");
}

/**
 * Handle contract test
 */
async function handleTest(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.log("🔬 Testing ChainGPT Smart Contract Generator...", "info");
  context.log("", "output");

  // Check initialization
  const initialized = chaingpt.isInitialized();
  context.log(`📊 Initialized: ${initialized ? "✅ Yes" : "❌ No"}`, "output");

  if (!initialized) {
    context.log("", "output");
    context.log("💡 Initialize first:", "info");
    context.log("   contract init              (use default key)", "output");
    context.log("   contract init <api-key>    (use your own key)", "output");
    return;
  }

  // Get API key (masked)
  const apiKey = chaingpt.getApiKey();
  if (apiKey) {
    const masked =
      apiKey.length > 12
        ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
        : "****";
    context.log(`🔑 API Key: ${masked}`, "output");
  }

  context.log(`🌐 Base URL: https://api.chaingpt.org`, "output");
  context.log(`📍 Model: smart_contract_generator`, "output");
  context.log("", "output");
  context.log("✅ Configuration looks good!", "success");
}

/**
 * Handle contract help
 */
function handleHelp(context: CommandContext, args: string[]): void {
  const helpLines = [
    "═ CHAINGPT AI SMART CONTRACT GENERATOR ═",
    "",
    "contract init",
    "Initialize with default API key",
    "",
    "contract init <api-key>",
    "Initialize with your API key",
    "",
    "contract generate <prompt>",
    "Generate smart contract",
    "",
    "contract templates",
    "Show available templates",
    "",
    "contract chains",
    "Show supported blockchains",
    "",
    "contract test",
    "Test API connection",
    "",
    "contract help",
    "Show this help message",
    "",
    "→ Options:",
    "",
    "--type <type>",
    "Contract type (token, nft, dex, etc.)",
    "",
    "--chain <chain>",
    "Target blockchain (ethereum, bsc, etc.)",
    "",
    "--features <f1,f2>",
    "Comma-separated features",
    "",
    "--security <level>",
    "Security level (basic, standard, high)",
    "",
    "→ Examples:",
    "",
    "contract generate ERC-20 token called MyToken",
    "contract generate --type nft ArtNFT with royalties",
    "contract generate --type dex --chain bsc PancakeSwap clone",
    "",
    "→ Credits:",
    "",
    "Contract generation: 2-5 credits (varies by complexity)",
  ];

  let helpHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.8;
      color: var(--palette-text, #e0e0e0);
      padding: 10px;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 20px;
        text-align: center;
        padding: 12px;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 255, 136, 0.1));
        border: 1px solid var(--palette-primary, #00d4ff);
        border-radius: 6px;
        text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
      ">
        ═ CHAINGPT AI SMART CONTRACT GENERATOR ═
      </div>
      <div style="padding: 10px;">
  `;

  helpLines.forEach((line) => {
    const trimmed = line.trim();
    const isCommand = trimmed && !trimmed.startsWith("→") && !trimmed.startsWith("═") && 
                      !trimmed.startsWith("--") && trimmed.length > 0 && trimmed.length < 60 && 
                      !trimmed.includes(":") && !trimmed.startsWith("•") &&
                      (trimmed.includes("contract ") || trimmed.match(/^[a-z-]+$/));

    if (isCommand) {
      const escapedCommand = line.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      helpHtml += `
        <div style="margin: 8px 0; padding-left: 0;">
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
            title="Click to add '${escapedCommand}' to terminal input"
          >
            ${line}
          </div>
        </div>
      `;
    } else if (trimmed.startsWith("→")) {
      helpHtml += `
        <div style="
          font-size: 14px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin: 15px 0 8px 0;
          padding: 8px;
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.05));
          border-left: 4px solid var(--palette-primary, #00d4ff);
          border-radius: 4px;
        ">${line}</div>
      `;
    } else if (trimmed) {
      helpHtml += `
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 6px 0;
          padding-left: 0;
          font-size: 0.95em;
          line-height: 1.6;
        ">${escapeHtml(line)}</div>
      `;
    } else {
      helpHtml += `<div style="margin: 8px 0;"></div>`;
    }
  });

  helpHtml += `
        </div>
        <div style="
          margin-top: 20px;
          padding: 12px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
          border-radius: 6px;
          font-size: 12px;
          color: var(--palette-text, #ccd4e0);
        ">
          <span style="color: var(--palette-primary, #00d4ff);">🔗</span>
          <span style="margin-left: 8px;">Get API key: https://api.chaingpt.org</span>
        </div>
      </div>
    </div>
  `;

  context.logHtml(helpHtml);
}

/**
 * Main contract command handler
 */
export const contractCommand: Command = {
  name: "contract",
  description: "ChainGPT AI Smart Contract Generator",
  usage: "contract <init|generate|templates|chains|test|help> [params]",
  category: "ai",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "init":
        await handleInit(context, args);
        break;

      case "generate":
        await handleGenerate(context, args);
        break;

      case "templates":
        handleTemplates(context, args);
        break;

      case "chains":
        handleChains(context, args);
        break;

      case "test":
        await handleTest(context, args);
        break;

      case "help":
      case undefined:
        handleHelp(context, args);
        break;

      default:
        // Treat as a generate prompt
        await handleGenerate(context, args);
        break;
    }
  },
};

/**
 * Export array of contract commands
 */
export const contractCommands: Command[] = [contractCommand];
