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
import { createCommandLine } from "./command-output-helpers";
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
  // No init required - API will use server keys automatically if available

  // Get contract code - skip 'auditor' and 'audit' if present
  let codeParts = args.slice(1);
  if (codeParts[0] === "audit") {
    codeParts = codeParts.slice(1);
  }

  let contractCode = codeParts.join(" ").trim();

  if (!contractCode) {
    context.log("❌ Please provide contract code to audit", "error");
    context.log("", "output");
    const exampleHtml = createCommandLine('auditor audit "contract MyToken { ... }"', "Example contract audit");
    context.logHtml(exampleHtml);
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

    // Display audit report with styled HTML card (theme-compatible)
    const html = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4757) 15%, transparent), color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent));
        border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
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
            ">🔒</div>
            <div style="
              font-size: 18px;
              font-weight: 600;
              color: var(--palette-error, #ff4757);
              text-shadow: 0 0 8px color-mix(in srgb, var(--palette-error, #ff4757) 40%, transparent);
            ">Security Audit Report</div>
          </div>
          <button
            onclick="navigator.clipboard.writeText(this.getAttribute('data-report')); this.textContent='✅ Copied!'; setTimeout(() => this.textContent='📋 Copy', 2000)"
            data-report="${escapeHtml(auditReport)}"
            style="
              background: color-mix(in srgb, var(--palette-error, #ff4757) 20%, transparent);
              border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 40%, transparent);
              border-radius: 6px;
              padding: 8px 16px;
              color: var(--palette-error, #ff4757);
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background='color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent)'; this.style.borderColor='var(--palette-error, #ff4757)';"
            onmouseout="this.style.background='color-mix(in srgb, var(--palette-error, #ff4757) 20%, transparent)'; this.style.borderColor='color-mix(in srgb, var(--palette-error, #ff4757) 40%, transparent)';"
          >📋 Copy</button>
        </div>
        <div style="
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 80%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 20%, transparent);
          border-radius: 8px;
          padding: 16px;
          max-height: 500px;
          overflow-y: auto;
        ">
          <pre style="
            color: var(--palette-text, #e0e0e0);
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
          border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(255, 71, 87, 0.3)) 50%, transparent);
          font-size: 12px;
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        ">
          <span style="color: var(--palette-error, #ff4757);">💳</span>
          <span>Credits used: <strong style="color: var(--palette-secondary, #00ff88);">varies</strong> (audit complexity)</span>
          ${
            options.auditLevel
              ? `<span style="margin-left: 12px;"><span style="color: var(--palette-error, #ff4757);">📊</span> Audit level: <strong style="color: var(--palette-text, #e0e0e0);">${options.auditLevel}</strong></span>`
              : ""
          }
          ${
            options.includeGasAnalysis
              ? `<span style="margin-left: 12px;"><span style="color: var(--palette-warning, #ffa502);">⛽</span> Gas analysis: <strong style="color: var(--palette-text, #e0e0e0);">included</strong></span>`
              : ""
          }
        </div>
      </div>
    `;

    context.logHtml(html);

    context.log("", "output");
    context.log("✅ Audit complete!", "success");
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    const errorStr = errorMsg.toLowerCase();
    
    // Check if it's an API key/configuration error
    if (errorStr.includes("key") || errorStr.includes("api") || 
        errorStr.includes("401") || errorStr.includes("403") ||
        errorStr.includes("not configured") || errorStr.includes("503")) {
      context.log(`❌ API Configuration Error`, "error");
      context.log("", "output");
      context.log("💡 ChainGPT Smart Contract Auditor requires an API key:", "info");
      context.log("", "output");
      context.log("Option 1: Use your own API key (recommended):", "output");
      context.log("   auditor init <your-api-key>", "info");
      context.log("   Get one at: https://api.chaingpt.org", "output");
      context.log("", "output");
      context.log("Option 2: Server keys may be configured by admin", "output");
      context.log("   Contact the administrator if server keys are expected", "info");
    } else {
      context.log(`❌ Error: ${errorMsg}`, "error");
      context.log("", "output");
      context.log("💡 Troubleshooting:", "info");
      context.log("   • Verify contract code syntax", "output");
      context.log("   • Check API connection: auditor test", "output");
      context.log("   • Get help: auditor help", "output");
    }
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
  const exampleHtml = createCommandLine("auditor audit --focus reentrancy,access_control <code>", "Example with focus categories");
  context.logHtml(exampleHtml);
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
  const helpLines = [
    "═ CHAINGPT AI SMART CONTRACT AUDITOR ═",
    "",
    "auditor init",
    "Initialize with default API key",
    "",
    "auditor init <api-key>",
    "Initialize with your API key",
    "",
    "auditor audit <code>",
    "Audit smart contract",
    "",
    "auditor severity",
    "Show severity levels",
    "",
    "auditor categories",
    "Show security categories",
    "",
    "auditor test",
    "Test API connection",
    "",
    "auditor help",
    "Show this help message",
    "",
    "→ Options:",
    "",
    "--type <type>",
    "Contract type (token, nft, etc.)",
    "",
    "--chain <chain>",
    "Target blockchain",
    "",
    "--level <level>",
    "Audit level (basic, standard, comprehensive)",
    "",
    "--focus <areas>",
    "Focus areas (comma-separated)",
    "",
    "--no-gas",
    "Skip gas optimization analysis",
    "",
    "→ Examples:",
    "",
    'auditor audit "contract Token { ... }"',
    'auditor audit --type token --chain ethereum "contract { ... }"',
    'auditor audit --focus reentrancy,access_control "contract { ... }"',
    "",
    "→ Credits:",
    "",
    "Basic audit: ~2 credits",
    "Comprehensive audit: ~5 credits",
    "Cost varies by contract complexity",
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
        ═ CHAINGPT AI SMART CONTRACT AUDITOR ═
      </div>
      <div style="padding: 10px;">
  `;

  helpLines.forEach((line) => {
    const trimmed = line.trim();
    const isCommand = trimmed && !trimmed.startsWith("→") && !trimmed.startsWith("═") && 
                      !trimmed.startsWith("--") && trimmed.length > 0 && trimmed.length < 60 && 
                      !trimmed.includes(":") && !trimmed.startsWith("•") &&
                      (trimmed.includes("auditor ") || trimmed.match(/^[a-z-]+$/));

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
