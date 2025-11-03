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
  // Check initialization
  if (!chaingpt.isInitialized()) {
    context.log("❌ ChainGPT not initialized", "error");
    context.log("", "output");
    context.log("💡 Initialize first:", "info");
    context.log("   contract init              (use default key)", "output");
    context.log("   contract init <api-key>    (use your own key)", "output");
    return;
  }

  // Get prompt - skip 'contract' and 'generate' if present
  let promptParts = args.slice(1);
  if (promptParts[0] === "generate") {
    promptParts = promptParts.slice(1);
  }

  let prompt = promptParts.join(" ").trim();

  if (!prompt) {
    context.log("❌ Please provide a contract description", "error");
    context.log("", "output");
    context.log("💡 Example:", "info");
    context.log("   contract generate ERC-20 token with minting", "output");
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

    // Display contract with styled HTML card
    const html = `
      <div style="
        background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(88, 86, 214, 0.1));
        border: 1px solid rgba(0, 122, 255, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
        max-width: 100%;
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
              color: #007AFF;
            ">Generated Smart Contract</div>
          </div>
          <button
            onclick="navigator.clipboard.writeText(this.getAttribute('data-code')); this.textContent='✅ Copied!'; setTimeout(() => this.textContent='📋 Copy', 2000)"
            data-code="${escapeHtml(contractCode)}"
            style="
              background: rgba(0, 122, 255, 0.2);
              border: 1px solid rgba(0, 122, 255, 0.4);
              border-radius: 6px;
              padding: 8px 16px;
              color: #007AFF;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
            "
          >📋 Copy</button>
        </div>
        <div style="
          background: #000000;
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 8px;
          padding: 16px;
          max-height: 500px;
          overflow-y: auto;
        ">
          <pre style="
            color: #00ff88;
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
          border-top: 1px solid rgba(0, 122, 255, 0.2);
          font-size: 12px;
          color: #888888;
        ">
          <span style="color: #007AFF;">💳</span> Credits used: varies (contract generation)
          ${
            options.securityLevel
              ? `<br><span style="color: #007AFF;">🔒</span> Security level: ${options.securityLevel}`
              : ""
          }
        </div>
      </div>
    `;

    context.logHtml(html);

    context.log("", "output");
    context.log("✅ Contract generated successfully!", "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check your API key: contract test", "output");
    context.log("   • Try simpler prompt", "output");
    context.log("   • Get help: contract help", "output");
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
  context.log("", "output");
  context.log("🔨 CHAINGPT AI SMART CONTRACT GENERATOR", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  context.log("📋 SETUP & CONFIGURATION", "info");
  context.log("", "output");
  context.log(
    "  contract init                  Initialize with default API key",
    "output"
  );
  context.log(
    "  contract init <api-key>        Initialize with your API key",
    "output"
  );
  context.log("  contract test                  Test API connection", "output");
  context.log("", "output");

  context.log("🔨 GENERATION COMMANDS", "info");
  context.log("", "output");
  context.log(
    "  contract generate <prompt>     Generate smart contract",
    "output"
  );
  context.log(
    "  contract templates             Show available templates",
    "output"
  );
  context.log(
    "  contract chains                Show supported blockchains",
    "output"
  );
  context.log(
    "  contract help                  Show this help message",
    "output"
  );
  context.log("", "output");

  context.log("⚙️  OPTIONS", "info");
  context.log("", "output");
  context.log(
    "  --type <type>                  Contract type (token, nft, dex, etc.)",
    "output"
  );
  context.log(
    "  --chain <chain>                Target blockchain (ethereum, bsc, etc.)",
    "output"
  );
  context.log(
    "  --features <f1,f2>             Comma-separated features",
    "output"
  );
  context.log(
    "  --security <level>             Security level (basic, standard, high)",
    "output"
  );
  context.log("", "output");

  context.log("📚 EXAMPLES", "info");
  context.log("", "output");
  context.log("  # Simple token", "output");
  context.log("  contract generate ERC-20 token called MyToken", "info");
  context.log("", "output");
  context.log("  # NFT with features", "output");
  context.log("  contract generate --type nft ArtNFT with royalties", "info");
  context.log("", "output");
  context.log("  # DEX on BSC", "output");
  context.log(
    "  contract generate --type dex --chain bsc PancakeSwap clone",
    "info"
  );
  context.log("", "output");
  context.log("  # Staking with security", "output");
  context.log(
    "  contract generate --type staking --security high Token staking",
    "info"
  );
  context.log("", "output");

  context.log("💳 CREDITS", "info");
  context.log("", "output");
  context.log("  • Contract generation: varies based on complexity", "output");
  context.log("  • Typically 2-5 credits per contract", "output");
  context.log("", "output");

  context.log("🔗 RESOURCES", "info");
  context.log("", "output");
  context.log("  • Get API key: https://api.chaingpt.org", "output");
  context.log("  • Documentation: https://docs.chaingpt.org", "output");
  context.log("  • Support: https://chaingpt.org", "output");
  context.log("", "output");
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
