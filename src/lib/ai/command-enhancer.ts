/**
 * Command Enhancer
 * Enhances AI responses with better command recognition and execution
 */

import type { CommandContext } from "@/types/commands";
import { EnhancedAIAgent, type EnhancedAIResponse } from "./enhanced-agent";
import { CommandRegistry } from "@/lib/commands/CommandRegistry";

/**
 * Enhanced AI command handler that uses the enhanced agent
 */
export async function handleEnhancedAI(
  prompt: string,
  context: CommandContext,
  commandRegistry: CommandRegistry
): Promise<void> {
  const agent = new EnhancedAIAgent(commandRegistry);
  agent.loadCommandGuide(); // Now synchronous

  // Show processing indicator
  context.logHtml(`<span style='color:#99ccff'>🤖 Analyzing request...</span>`);

  try {
    // Analyze user intent
    const response = await agent.analyzeIntent(prompt, context);

    // Handle different response types
    switch (response.type) {
      case "multi-step":
        if (response.plan) {
          // Show plan preview
          context.log(`📋 Plan: ${response.plan.summary}`, "info");
          context.log("", "output");

          response.plan.steps.forEach((step, index) => {
            const deps = step.dependsOn
              ? ` (depends on: ${step.dependsOn.map((d) => d + 1).join(", ")})`
              : "";
            context.log(
              `  ${index + 1}. ${step.description}${deps}`,
              step.required ? "output" : "info"
            );
            context.log(`     → ${step.command}`, "output");
          });

          context.log("", "output");

          // Execute plan
          if (!response.requiresConfirmation) {
            await agent.executePlan(response.plan, context);
          } else {
            context.log(
              "⚠️  This plan requires confirmation. Type 'yes' to proceed.",
              "warning"
            );
            // Store plan in context for confirmation
            (context as any).pendingPlan = response.plan;
          }
        }
        break;

      case "command":
        if (response.commands && response.commands.length > 0) {
          context.log(`🤖 ${response.answer}`, "success");
          context.log("", "output");

          // Execute commands
          for (const cmd of response.commands) {
            context.log(`⚡ Executing: ${cmd}`, "info");
            await context.executeCommand(cmd);
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        } else {
          context.log(`🤖 ${response.answer}`, "info");
        }

        // Show suggestions
        if (response.suggestions && response.suggestions.length > 0) {
          context.log("", "output");
          context.log("💡 Related commands:", "info");
          response.suggestions.forEach((suggestion) => {
            context.log(`   • ${suggestion}`, "output");
          });
        }
        break;

      case "question":
        context.log(`❓ ${response.answer}`, "info");
        if (response.suggestions) {
          response.suggestions.forEach((suggestion) => {
            context.log(`   • ${suggestion}`, "output");
          });
        }
        break;

      case "info":
        context.log(`ℹ️  ${response.answer}`, "info");
        break;
    }
  } catch (error: any) {
    // If it's a fallback error from enhanced agent, re-throw to use standard AI
    if (
      error.message === "Intent not recognized, falling back to standard AI"
    ) {
      throw error;
    }

    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log(
      "💡 Try rephrasing your request or use 'help' for available commands",
      "info"
    );
  }
}

/**
 * Enhance existing AI response with better formatting
 */
export function enhanceAIResponse(
  response: any,
  context: CommandContext
): EnhancedAIResponse {
  // If response already has commands array, use it
  if (Array.isArray(response.commands)) {
    return {
      type: "command",
      answer: response.answer || "Executing commands",
      commands: response.commands,
      suggestions: response.suggestions,
    };
  }

  // If response has a single command
  if (response.command && response.params) {
    return {
      type: "command",
      answer: response.answer || "Executing command",
      commands: [`${response.command} ${response.params}`],
    };
  }

  // Default to info response
  return {
    type: "info",
    answer: response.answer || response.message || "Processing...",
  };
}

/**
 * Get quick actions for the user
 */
export function getQuickActions(context: CommandContext): string[] {
  const actions: string[] = [];

  // Context-aware suggestions
  if (!context.wallet?.address) {
    actions.push("connect - Connect your wallet to get started");
  } else {
    actions.push("balance - Check your balances");
    actions.push("pf:show - View your portfolio");
  }

  // Popular commands
  actions.push("markets:list - Browse prediction markets");
  actions.push("polymarket trending - See trending markets");
  actions.push("game:start - Play Forecast Arena");
  actions.push("alpha:drops - Get daily AI picks");

  return actions;
}
