/**
 * Enhanced AI Agent System
 * Provides intelligent command recognition, multi-step planning, and precise execution
 */

import type { CommandContext } from "@/types/commands";
import { CommandRegistry } from "@/lib/commands/CommandRegistry";

export interface CommandPlan {
  steps: CommandStep[];
  summary: string;
  estimatedTime?: string;
}

export interface CommandStep {
  command: string;
  description: string;
  required?: boolean;
  dependsOn?: number[]; // Step indices this depends on
  validateBefore?: boolean;
  retryOnError?: boolean;
}

export interface EnhancedAIResponse {
  type: "command" | "info" | "question" | "multi-step";
  answer: string;
  commands?: string[];
  plan?: CommandPlan;
  suggestions?: string[];
  requiresConfirmation?: boolean;
  context?: Record<string, any>;
}

/**
 * Enhanced AI Agent with intelligent command planning
 */
export class EnhancedAIAgent {
  private commandRegistry: CommandRegistry;
  private commandGuide: string = ""; // Will be loaded from datav3.md

  constructor(commandRegistry: CommandRegistry) {
    this.commandRegistry = commandRegistry;
  }

  /**
   * Load command guide for better context
   */
  async loadCommandGuide(): Promise<void> {
    try {
      // In production, this would load from the actual datav3.md or API
      // For now, we'll use a summary
      this.commandGuide = "Command guide loaded";
    } catch (error) {
      console.warn("Failed to load command guide:", error);
    }
  }

  /**
   * Analyze user intent and create a command plan
   */
  async analyzeIntent(
    prompt: string,
    context: CommandContext
  ): Promise<EnhancedAIResponse> {
    // Extract key information from prompt
    const intent = this.extractIntent(prompt);
    const entities = this.extractEntities(prompt, context);

    // Check if this is a multi-step operation
    const isMultiStep = this.isMultiStepRequest(prompt);

    if (isMultiStep) {
      return this.createMultiStepPlan(intent, entities, context);
    }

    // Single command - use existing AI flow
    return this.createSingleCommandResponse(intent, entities, context);
  }

  /**
   * Extract intent from user prompt
   */
  private extractIntent(prompt: string): {
    action: string;
    category: string;
    urgency: "low" | "medium" | "high";
  } {
    const lower = prompt.toLowerCase();

    // Action detection
    const actions = {
      check: ["check", "show", "display", "view", "see", "get"],
      create: ["create", "make", "generate", "new", "add"],
      connect: ["connect", "link", "attach", "setup"],
      trade: ["trade", "swap", "buy", "sell", "exchange"],
      analyze: ["analyze", "research", "find", "search", "lookup"],
      execute: ["run", "execute", "do", "perform", "start"],
    };

    let action = "unknown";
    for (const [key, keywords] of Object.entries(actions)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        action = key;
        break;
      }
    }

    // Category detection
    const categories = {
      wallet: ["wallet", "balance", "address", "connect"],
      trading: ["trade", "swap", "token", "buy", "sell"],
      market: ["market", "price", "polymarket", "prediction"],
      nft: ["nft", "collection", "mint"],
      game: ["game", "play", "arena", "faction"],
      social: ["follow", "profile", "feed", "leaderboard"],
      system: ["theme", "clear", "help", "status"],
    };

    let category = "general";
    for (const [key, keywords] of Object.entries(categories)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        category = key;
        break;
      }
    }

    // Urgency detection
    const urgencyKeywords = {
      high: ["urgent", "now", "immediately", "asap", "quick"],
      medium: ["soon", "later", "when possible"],
      low: [],
    };

    let urgency: "low" | "medium" | "high" = "low";
    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        urgency = level as "low" | "medium" | "high";
        break;
      }
    }

    return { action, category, urgency };
  }

  /**
   * Extract entities (tokens, addresses, amounts, etc.) from prompt
   */
  private extractEntities(
    prompt: string,
    context: CommandContext
  ): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract token symbols (uppercase 2-10 letter words)
    const tokenPattern = /\b[A-Z]{2,10}\b/g;
    const tokens = prompt.match(tokenPattern);
    if (tokens) {
      entities.tokens = tokens;
    }

    // Extract addresses (0x... or base58)
    const addressPattern = /(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})/g;
    const addresses = prompt.match(addressPattern);
    if (addresses) {
      entities.addresses = addresses;
    }

    // Extract amounts
    const amountPattern = /(\d+\.?\d*)\s*(?:tokens?|coins?|usd|eth|sol|near)?/gi;
    const amounts = prompt.match(amountPattern);
    if (amounts) {
      entities.amounts = amounts;
    }

    // Extract network names
    const networks = ["solana", "ethereum", "near", "eclipse", "aptos", "monad"];
    const foundNetworks = networks.filter((net) =>
      prompt.toLowerCase().includes(net)
    );
    if (foundNetworks.length > 0) {
      entities.networks = foundNetworks;
    }

    // Use context wallet if available
    if (context.wallet?.address) {
      entities.userAddress = context.wallet.address;
    }

    return entities;
  }

  /**
   * Check if request requires multiple steps
   */
  private isMultiStepRequest(prompt: string): boolean {
    const multiStepKeywords = [
      "and then",
      "after that",
      "also",
      "plus",
      "then",
      "next",
      "followed by",
      "setup",
      "configure",
      "initialize",
    ];

    const connectors = ["and", "&", "+"];
    const hasConnector = connectors.some((c) => prompt.includes(c));
    const hasMultiStepKeyword = multiStepKeywords.some((kw) =>
      prompt.toLowerCase().includes(kw)
    );

    // Check for multiple actions
    const actionCount = (
      prompt.match(/\b(check|create|connect|trade|analyze|execute)\b/gi) || []
    ).length;

    return hasConnector || hasMultiStepKeyword || actionCount > 1;
  }

  /**
   * Create a multi-step command plan
   */
  private async createMultiStepPlan(
    intent: { action: string; category: string; urgency: string },
    entities: Record<string, any>,
    context: CommandContext
  ): Promise<EnhancedAIResponse> {
    const steps: CommandStep[] = [];

    // Example: "Check my balance and then show trending markets"
    if (intent.action === "check" && entities.tokens) {
      steps.push({
        command: `balance`,
        description: "Check wallet balance",
        required: true,
      });
      steps.push({
        command: `markets:list --limit 10`,
        description: "Show trending markets",
        required: false,
        dependsOn: [0],
      });
    }

    // Example: "Connect wallet and show my portfolio"
    if (intent.action === "connect") {
      steps.push({
        command: `connect`,
        description: "Connect wallet",
        required: true,
        validateBefore: true,
      });
      steps.push({
        command: `pf:show`,
        description: "Display portfolio",
        required: true,
        dependsOn: [0],
      });
    }

    // Example: "Find BONK token and get a swap quote"
    if (intent.action === "analyze" && entities.tokens) {
      const token = entities.tokens[0];
      steps.push({
        command: `solana search ${token}`,
        description: `Search for ${token} token`,
        required: true,
      });
      steps.push({
        command: `solana quote SOL ${token} 1`,
        description: `Get swap quote for ${token}`,
        required: false,
        dependsOn: [0],
      });
    }

    return {
      type: "multi-step",
      answer: `I'll help you with that. Here's my plan:`,
      plan: {
        steps,
        summary: `Executing ${steps.length} steps to complete your request`,
        estimatedTime: `${steps.length * 2}s`,
      },
      requiresConfirmation: steps.length > 3,
    };
  }

  /**
   * Create single command response
   */
  private createSingleCommandResponse(
    intent: { action: string; category: string; urgency: string },
    entities: Record<string, any>,
    context: CommandContext
  ): EnhancedAIResponse {
    const commands: string[] = [];

    // Map intent to commands
    if (intent.category === "wallet" && intent.action === "check") {
      commands.push("balance");
    } else if (intent.category === "wallet" && intent.action === "connect") {
      commands.push("connect");
    } else if (intent.category === "trading" && intent.action === "trade") {
      if (entities.networks?.includes("solana")) {
        commands.push(`solana swap`);
      } else if (entities.networks?.includes("near")) {
        commands.push(`near swap`);
      } else {
        commands.push(`solana swap`); // Default
      }
    } else if (intent.category === "market" && intent.action === "analyze") {
      commands.push(`markets:list`);
    }

    return {
      type: "command",
      answer: `I'll ${intent.action} that for you.`,
      commands,
      suggestions: this.generateSuggestions(intent, entities),
    };
  }

  /**
   * Generate command suggestions based on intent
   */
  private generateSuggestions(
    intent: { action: string; category: string },
    entities: Record<string, any>
  ): string[] {
    const suggestions: string[] = [];

    if (intent.category === "wallet") {
      suggestions.push("balance", "address", "connect");
    } else if (intent.category === "trading") {
      suggestions.push("solana swap", "near swap", "eclipse swap");
    } else if (intent.category === "market") {
      suggestions.push("markets:list", "markets:heatmap", "polymarket trending");
    }

    return suggestions;
  }

  /**
   * Execute a command plan with progress tracking
   */
  async executePlan(
    plan: CommandPlan,
    context: CommandContext
  ): Promise<void> {
    context.log(`📋 Executing plan: ${plan.summary}`, "info");
    context.log(`⏱️  Estimated time: ${plan.estimatedTime || "unknown"}`, "info");
    context.log("", "output");

    const executed: boolean[] = [];
    const errors: Array<{ step: number; error: string }> = [];

    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i]!;

      // Check dependencies
      if (step.dependsOn) {
        const allDepsExecuted = step.dependsOn.every((dep) => executed[dep]);
        if (!allDepsExecuted) {
          context.log(
            `⏸️  Step ${i + 1} waiting for dependencies...`,
            "warning"
          );
          continue;
        }
      }

      // Execute step
      context.log(
        `[${i + 1}/${plan.steps.length}] ${step.description}...`,
        "info"
      );

      try {
        // Validate if required
        if (step.validateBefore) {
          const isValid = await this.validateCommand(step.command, context);
          if (!isValid) {
            throw new Error("Command validation failed");
          }
        }

        await context.executeCommand(step.command);
        executed[i] = true;

        // Small delay between commands for readability
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        errors.push({ step: i, error: error.message });
        executed[i] = false;

        if (step.retryOnError) {
          context.log(`🔄 Retrying step ${i + 1}...`, "info");
          try {
            await context.executeCommand(step.command);
            executed[i] = true;
          } catch (retryError: any) {
            context.log(
              `❌ Step ${i + 1} failed: ${retryError.message}`,
              "error"
            );
          }
        } else {
          if (step.required) {
            context.log(
              `❌ Required step ${i + 1} failed. Stopping plan execution.`,
              "error"
            );
            break;
          } else {
            context.log(
              `⚠️  Optional step ${i + 1} failed. Continuing...`,
              "warning"
            );
          }
        }
      }
    }

    // Summary
    const successCount = executed.filter((e) => e).length;
    context.log("", "output");
    context.log(
      `✅ Plan completed: ${successCount}/${plan.steps.length} steps successful`,
      successCount === plan.steps.length ? "success" : "warning"
    );

    if (errors.length > 0) {
      context.log(`❌ ${errors.length} error(s) occurred:`, "error");
      errors.forEach((err) => {
        context.log(`   Step ${err.step + 1}: ${err.error}`, "error");
      });
    }
  }

  /**
   * Validate command before execution
   */
  private async validateCommand(
    command: string,
    context: CommandContext
  ): Promise<boolean> {
    // Basic validation - check if command exists
    const commandName = command.split(" ")[0];
    const cmd = this.commandRegistry.getCommand(commandName || "");

    if (!cmd) {
      context.log(`⚠️  Unknown command: ${commandName}`, "warning");
      return false;
    }

    // Check prerequisites (e.g., wallet connection)
    if (commandName === "balance" || commandName.startsWith("solana")) {
      if (!context.wallet?.address && !context.wallet?.solana?.address) {
        context.log(
          "⚠️  Wallet not connected. Some commands may fail.",
          "warning"
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Get quick action suggestions based on context
   */
  getQuickActions(context: CommandContext): string[] {
    const actions: string[] = [];

    // Check wallet status
    if (!context.wallet?.address) {
      actions.push("connect - Connect your wallet");
    } else {
      actions.push("balance - Check your balance");
      actions.push("pf:show - View portfolio");
    }

    // Add common actions
    actions.push("markets:list - Browse prediction markets");
    actions.push("game:start - Play Forecast Arena");
    actions.push("help - Show all commands");

    return actions;
  }
}

