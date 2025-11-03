/**
 * ChainGPT Smart Contract Auditor Commands Module
 * Migrated from js/commands/chaingpt-auditor.js to TypeScript
 *
 * ChainGPT AI Smart Contract Auditor:
 * - auditor init: Initialize with API key
 * - auditor audit: Audit smart contract
 * - auditor severity: Show severity levels
 * - auditor categories: Show security categories
 * - auditor test: Test API connection
 * - auditor help: Show help and examples
 */

import type { Command, CommandContext } from "@/types/commands";
import { chaingpt } from "@/lib/api";
import { escapeHtml } from "@/lib/utils";
import { config } from "@/lib/config";

/**
 * Audit severity levels
 */
const SEVERITY_LEVELS: Record<string, string> = {
  critical: "Critical - Immediate action required",
  high: "High - Should be fixed before deployment",
  medium: "Medium - Should be addressed soon",
  low: "Low - Consider fixing in future updates",
  info: "Info - Suggestions and best practices",
};

/**
 * Security audit categories
 */
const SECURITY_CATEGORIES: Record<string, string> = {
  access_control: "Access Control & Authorization",
  reentrancy: "Reentrancy Vulnerabilities",
  integer_overflow: "Integer Overflow/Underflow",
  unchecked_calls: "Unchecked External Calls",
  gas_optimization: "Gas Optimization",
  logic_errors: "Logic Errors",
  front_running: "Front-running Vulnerabilities",
  denial_of_service: "Denial of Service",
  upgradeability: "Upgradeability Issues",
  randomness: "Randomness & Oracle Issues",
};

/**
 * Build audit prompt with options
 */
function buildAuditPrompt(
  contractCode: string,
  options: {
    contractType?: string;
    blockchain?: string;
    auditLevel?: string;
    focusAreas?: string[];
    includeGasAnalysis?: boolean;
  }
): string {
  let question = `Audit this smart contract:\n\n${contractCode}`;

  // Add contract type context
  if (options.contractType) {
    question += `\n\nContract Type: ${options.contractType}`;
  }

  // Add blockchain context
  if (options.blockchain) {
    question += `\nBlockchain: ${options.blockchain}`;
  }

  // Add audit level
  if (options.auditLevel) {
    question += `\nAudit Level: ${options.auditLevel}`;
  }

  // Add focus areas
  if (options.focusAreas && options.focusAreas.length > 0) {
    question += `\nFocus on: ${options.focusAreas.join(", ")}`;
  }

  // Add gas analysis request
  if (options.includeGasAnalysis !== false) {
    question += `\n\nPlease include gas optimization suggestions.`;
  }

  return question;
}

/**
 * Handle auditor initialization
 */
async function handleInit(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const apiKey = args[2]; // Optional API key from user

  try {
    const result = await chaingpt.initialize(apiKey);

    if (result.success) {
      context.log("✅ ChainGPT Smart Contract Auditor initialized!", "success");
      context.log("", "output");

      if (result.message) {
        context.log(result.message, "info");
      }

      context.log("", "output");
      context.log("📖 NEXT STEPS:", "info");
      context.log("", "output");
      context.log("1. Audit a contract:", "output");
      context.log("   auditor audit <contract-code>", "info");
      context.log("", "output");
      context.log("2. View severity levels:", "output");
      context.log("   auditor severity", "info");
      context.log("", "output");
      context.log("3. Get help:", "output");
      context.log("   auditor help", "info");
    } else {
      context.log(`❌ Initialization failed: ${result.error}`, "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Handle contract audit
 */
async function handleAudit(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Check initialization
  if (!chaingpt.isInitialized()) {
    context.log("❌ ChainGPT not initialized", "error");
    context.log("", "output");
    context.log("💡 Initialize first:", "info");
    context.log("   auditor init              (use default key)", "output");
    context.log("   auditor init <api-key>    (use your own key)", "output");
    return;
  }

  // Get contract code - skip 'auditor' and 'audit' if present
  let codeParts = args.slice(1);
  if (codeParts[0] === "audit") {
    codeParts = codeParts.slice(1);
  }

  let contractCode = codeParts.join(" ").trim();

  if (!contractCode) {
    context.log("❌ Please provide contract code to audit", "error");
    context.log("", "output");
    context.log("💡 Example:", "info");
    context.log('   auditor audit "contract MyToken { ... }"', "output");
    return;
  }

  // Parse options from contract code
  const options: {
    contractType?: string;
    blockchain?: string;
    auditLevel?: string;
    focusAreas?: string[];
    includeGasAnalysis?: boolean;
  } = { includeGasAnalysis: true };

  // Extract --type option
  const typeMatch = contractCode.match(/--type[=\s]+(\w+)/i);
  if (typeMatch) {
    options.contractType = typeMatch[1]!;
    contractCode = contractCode.replace(typeMatch[0], "").trim();
  }

  // Extract --chain option
  const chainMatch = contractCode.match(/--chain[=\s]+(\w+)/i);
  if (chainMatch) {
    options.blockchain = chainMatch[1]!;
    contractCode = contractCode.replace(chainMatch[0], "").trim();
  }

  // Extract --level option
  const levelMatch = contractCode.match(/--level[=\s]+(\w+)/i);
  if (levelMatch) {
    options.auditLevel = levelMatch[1]!;
    contractCode = contractCode.replace(levelMatch[0], "").trim();
  }

  // Extract --focus option
  const focusMatch = contractCode.match(/--focus[=\s]+([^\-]+)/i);
  if (focusMatch) {
    options.focusAreas = focusMatch[1]!.split(",").map((f) => f.trim());
    contractCode = contractCode.replace(focusMatch[0], "").trim();
  }

  // Check --no-gas flag
  if (contractCode.includes("--no-gas")) {
    options.includeGasAnalysis = false;
    contractCode = contractCode.replace(/--no-gas/gi, "").trim();
  }

  // Build audit question
  const question = buildAuditPrompt(contractCode, options);

  try {
    context.log(`🔍 Auditing smart contract...`, "info");

    if (options.contractType) {
      context.log(`   Type: ${options.contractType}`, "output");
    }
    if (options.blockchain) {
      context.log(`   Chain: ${options.blockchain}`, "output");
    }
    if (options.auditLevel) {
      context.log(`   Level: ${options.auditLevel}`, "output");
    }

    context.log("⏳ Analyzing security...", "info");
    context.log("", "output");

    // Get stream reader
    const reader = await chaingpt.auditContract({
      model: config.CHAINGPT.AUDITOR_MODEL,
      question: question,
      chatHistory: "off",
    });

    const decoder = new TextDecoder();
    let auditReport = "";
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
            auditReport += result.content;
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
          auditReport += result.content;
        }
      }
    }

    // Display audit report with styled HTML card
    const html = `
      <div style="
        background: linear-gradient(135deg, rgba(255, 59, 48, 0.1), rgba(255, 149, 0, 0.1));
        border: 1px solid rgba(255, 59, 48, 0.3);
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
            ">🔒</div>
            <div style="
              font-size: 18px;
              font-weight: 600;
              color: #ff3b30;
            ">Security Audit Report</div>
          </div>
          <button
            onclick="navigator.clipboard.writeText(this.getAttribute('data-report')); this.textContent='✅ Copied!'; setTimeout(() => this.textContent='📋 Copy', 2000)"
            data-report="${escapeHtml(auditReport)}"
            style="
              background: rgba(255, 59, 48, 0.2);
              border: 1px solid rgba(255, 59, 48, 0.4);
              border-radius: 6px;
              padding: 8px 16px;
              color: #ff3b30;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
            "
          >📋 Copy</button>
        </div>
        <div style="
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 59, 48, 0.2);
          border-radius: 8px;
          padding: 16px;
          max-height: 500px;
          overflow-y: auto;
        ">
          <pre style="
            color: #ffffff;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
          ">${escapeHtml(auditReport)}</pre>
        </div>
        <div style="
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 59, 48, 0.2);
          font-size: 12px;
          color: #888888;
        ">
          <span style="color: #ff3b30;">💳</span> Credits used: varies (audit complexity)
          ${
            options.auditLevel
              ? `<br><span style="color: #ff3b30;">📊</span> Audit level: ${options.auditLevel}`
              : ""
          }
          ${
            options.includeGasAnalysis
              ? `<br><span style="color: #ff9500;">⛽</span> Gas analysis: included`
              : ""
          }
        </div>
      </div>
    `;

    context.logHtml(html);

    context.log("", "output");
    context.log("✅ Audit complete!", "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check your API key: auditor test", "output");
    context.log("   • Verify contract code syntax", "output");
    context.log("   • Get help: auditor help", "output");
  }
}

/**
 * Handle severity levels
 */
function handleSeverity(context: CommandContext, args: string[]): void {
  context.log("", "output");
  context.log("🚨 AUDIT SEVERITY LEVELS", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  const colors = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🔵",
    info: "⚪",
  };

  for (const [key, description] of Object.entries(SEVERITY_LEVELS)) {
    const emoji = colors[key as keyof typeof colors] || "⚪";
    context.log(`  ${emoji} ${key.padEnd(12)} → ${description}`, "output");
  }

  context.log("", "output");
  context.log("💡 INTERPRETING RESULTS:", "info");
  context.log("", "output");
  context.log("  • Critical: Fix immediately before deployment", "output");
  context.log("  • High: Must be addressed in current version", "output");
  context.log("  • Medium: Plan to fix in next update", "output");
  context.log("  • Low: Consider fixing eventually", "output");
  context.log("  • Info: Suggestions for improvement", "output");
  context.log("", "output");
}

/**
 * Handle security categories
 */
function handleCategories(context: CommandContext, args: string[]): void {
  context.log("", "output");
  context.log("🛡️  SECURITY AUDIT CATEGORIES", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  for (const [key, description] of Object.entries(SECURITY_CATEGORIES)) {
    context.log(`  ${key.padEnd(20)} → ${description}`, "output");
  }

  context.log("", "output");
  context.log("💡 USAGE EXAMPLE:", "info");
  context.log("", "output");
  context.log("  # Focus on specific categories", "output");
  context.log(
    "  auditor audit --focus reentrancy,access_control <code>",
    "info"
  );
  context.log("", "output");
}

/**
 * Handle auditor test
 */
async function handleTest(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.log("🔬 Testing ChainGPT Smart Contract Auditor...", "info");
  context.log("", "output");

  // Check initialization
  const initialized = chaingpt.isInitialized();
  context.log(`📊 Initialized: ${initialized ? "✅ Yes" : "❌ No"}`, "output");

  if (!initialized) {
    context.log("", "output");
    context.log("💡 Initialize first:", "info");
    context.log("   auditor init              (use default key)", "output");
    context.log("   auditor init <api-key>    (use your own key)", "output");
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
  context.log(`📍 Model: smart_contract_auditor`, "output");
  context.log("", "output");
  context.log("✅ Configuration looks good!", "success");
}

/**
 * Handle auditor help
 */
function handleHelp(context: CommandContext, args: string[]): void {
  context.log("", "output");
  context.log("🔍 CHAINGPT AI SMART CONTRACT AUDITOR", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  context.log("📋 SETUP & CONFIGURATION", "info");
  context.log("", "output");
  context.log(
    "  auditor init                  Initialize with default API key",
    "output"
  );
  context.log(
    "  auditor init <api-key>        Initialize with your API key",
    "output"
  );
  context.log("  auditor test                  Test API connection", "output");
  context.log("", "output");

  context.log("🔍 AUDIT COMMANDS", "info");
  context.log("", "output");
  context.log("  auditor audit <code>          Audit smart contract", "output");
  context.log("  auditor severity              Show severity levels", "output");
  context.log(
    "  auditor categories            Show security categories",
    "output"
  );
  context.log(
    "  auditor help                  Show this help message",
    "output"
  );
  context.log("", "output");

  context.log("⚙️  OPTIONS", "info");
  context.log("", "output");
  context.log(
    "  --type <type>                 Contract type (token, nft, etc.)",
    "output"
  );
  context.log("  --chain <chain>               Target blockchain", "output");
  context.log(
    "  --level <level>               Audit level (basic, standard, comprehensive)",
    "output"
  );
  context.log(
    "  --focus <areas>               Focus areas (comma-separated)",
    "output"
  );
  context.log(
    "  --no-gas                      Skip gas optimization analysis",
    "output"
  );
  context.log("", "output");

  context.log("📚 EXAMPLES", "info");
  context.log("", "output");
  context.log("  # Simple audit", "output");
  context.log('  auditor audit "contract Token { ... }"', "info");
  context.log("", "output");
  context.log("  # Audit with options", "output");
  context.log(
    '  auditor audit --type token --chain ethereum "contract { ... }"',
    "info"
  );
  context.log("", "output");
  context.log("  # Focus on specific areas", "output");
  context.log(
    '  auditor audit --focus reentrancy,access_control "contract { ... }"',
    "info"
  );
  context.log("", "output");
  context.log("  # Comprehensive audit", "output");
  context.log(
    '  auditor audit --level comprehensive "contract { ... }"',
    "info"
  );
  context.log("", "output");

  context.log("💳 CREDITS", "info");
  context.log("", "output");
  context.log("  • Basic audit: ~2 credits", "output");
  context.log("  • Comprehensive audit: ~5 credits", "output");
  context.log("  • Cost varies by contract complexity", "output");
  context.log("", "output");

  context.log("🔗 RESOURCES", "info");
  context.log("", "output");
  context.log("  • Get API key: https://api.chaingpt.org", "output");
  context.log("  • Documentation: https://docs.chaingpt.org", "output");
  context.log("  • Support: https://chaingpt.org", "output");
  context.log("", "output");
}

/**
 * Main auditor command handler
 */
export const auditorCommand: Command = {
  name: "auditor",
  description: "ChainGPT AI Smart Contract Auditor",
  usage: "auditor <init|audit|severity|categories|test|help> [params]",
  category: "ai",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "init":
        await handleInit(context, args);
        break;

      case "audit":
        await handleAudit(context, args);
        break;

      case "severity":
        handleSeverity(context, args);
        break;

      case "categories":
        handleCategories(context, args);
        break;

      case "test":
        await handleTest(context, args);
        break;

      case "help":
      case undefined:
        handleHelp(context, args);
        break;

      default:
        // Treat as audit code
        await handleAudit(context, args);
        break;
    }
  },
};

/**
 * Export array of auditor commands
 */
export const auditorCommands: Command[] = [auditorCommand];
