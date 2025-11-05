/**
 * Context Commands - System Context Management
 * Commands: ctx:get, ctx:set
 */

import type { Command, CommandContext } from "@/types/commands";
import { parseFlags } from "@/lib/terminal/flag-parser";
import { renderCard } from "@/lib/terminal/renderers";

// Global context storage with localStorage persistence
const CONTEXT_KEY = "omega-terminal-context";

function loadContext(): Record<string, string> {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CONTEXT_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }
  return {};
}

function saveContext(context: Record<string, string>): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
    } catch (error) {
      console.error("Failed to save context:", error);
    }
  }
}

// Load context on module init
const globalContext: Record<string, string> = loadContext();

/**
 * ctx:get - Get context values
 * Usage: ctx:get [key]
 */
async function handleContextGet(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const key = parsed.positional[0];

  if (key) {
    // Get specific key
    const value = globalContext[key];
    if (value !== undefined) {
      context.log(`${key} = ${value}`, "output");
    } else {
      context.log(`❌ Context key '${key}' not set`, "error");
    }
  } else {
    // Get all context
    if (Object.keys(globalContext).length === 0) {
      context.log("No context set", "output");
    } else {
      const html = renderCard(globalContext, "Context");
      context.logHtml(html);
    }
  }
}

/**
 * ctx:set - Set context values
 * Usage: ctx:set <key>=<value> [key2=value2 ...]
 */
async function handleContextSet(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  
  // Parse key=value pairs from positional args
  const pairs = parsed.positional.filter(arg => arg.includes("="));

  if (pairs.length === 0) {
    context.log("❌ Usage: ctx:set <key>=<value> [key2=value2 ...]", "error");
    context.log("   Example: ctx:set venue=polymarket tag=crypto", "info");
    return;
  }

  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split("=");
    const value = valueParts.join("="); // Handle values with = in them
    
    if (key && value) {
      globalContext[key.trim()] = value.trim();
      saveContext(globalContext); // Persist to localStorage
      context.log(`✓ Set ${key.trim()} = ${value.trim()}`, "success");
    }
  }
}

export const contextGetCommand: Command = {
  name: "ctx:get",
  description: "Get context values",
  usage: "ctx:get [key]",
  category: "system",
  handler: handleContextGet,
};

export const contextSetCommand: Command = {
  name: "ctx:set",
  description: "Set context values",
  usage: "ctx:set <key>=<value> [key2=value2 ...]",
  category: "system",
  handler: handleContextSet,
};

export const contextCommands: Command[] = [
  contextGetCommand,
  contextSetCommand,
];

