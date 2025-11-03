/**
 * CommandRegistry Class
 * Central registry for command registration and routing
 * Provides command lookup, execution, and management
 */

import type { Command, CommandContext } from "@/types/commands";
import { parseCommandArgs } from "@/lib/utils";

/**
 * CommandRegistry manages all terminal commands
 *
 * The registry pattern allows for:
 * - Dynamic command registration at runtime
 * - Command aliasing for alternative names
 * - Organized command routing and execution
 * - Easy extension with new commands
 *
 * Commands are stored in a Map with lowercase names as keys.
 * Aliases are stored as separate entries pointing to the same command.
 *
 * @example
 * const registry = new CommandRegistry();
 * registry.register({
 *   name: 'help',
 *   aliases: ['?', 'h'],
 *   description: 'Show help',
 *   handler: (context, args) => {
 *     context.log('Help text...', 'info');
 *   }
 * });
 *
 * await registry.execute('help', context);
 */
export class CommandRegistry {
  /** Map of command names to command objects */
  private commands: Map<string, Command> = new Map();

  /**
   * Register a new command
   *
   * @param command - The command to register
   * @throws Error if command is missing name or handler or if there's a name collision
   *
   * The command is stored with its name as the key (lowercase).
   * If aliases are provided, they are also registered as separate entries.
   * Checks for collisions with existing commands and aliases.
   */
  register(command: Command): void {
    // Validate command has required fields
    if (!command.name || !command.handler) {
      throw new Error("Command must have a name and handler");
    }

    // Check for collision with primary name
    const commandName = command.name.toLowerCase();
    if (this.commands.has(commandName)) {
      const existing = this.commands.get(commandName);
      throw new Error(
        `Cannot register command '${command.name}': name already in use by command '${existing?.name}'`
      );
    }

    // Check for collisions with aliases
    if (command.aliases && command.aliases.length > 0) {
      for (const alias of command.aliases) {
        const aliasName = alias.toLowerCase();
        if (this.commands.has(aliasName)) {
          const existing = this.commands.get(aliasName);
          throw new Error(
            `Cannot register command '${command.name}': alias '${alias}' already in use by command '${existing?.name}'`
          );
        }
      }
    }

    // Store command with lowercase name as key
    this.commands.set(commandName, command);

    // Register aliases
    if (command.aliases && command.aliases.length > 0) {
      for (const alias of command.aliases) {
        const aliasName = alias.toLowerCase();
        this.commands.set(aliasName, command);
      }
    }
  }

  /**
   * Unregister a command and its aliases
   *
   * @param name - The command name or alias to remove
   *
   * Removes the command and all its aliases from the registry,
   * regardless of whether the provided name is the canonical name or an alias.
   */
  unregister(name: string): void {
    const providedName = name.toLowerCase();
    const command = this.commands.get(providedName);

    if (command) {
      // Compute canonical name
      const canonical = command.name.toLowerCase();

      // Delete canonical entry
      this.commands.delete(canonical);

      // Delete all alias entries
      if (command.aliases) {
        for (const alias of command.aliases) {
          this.commands.delete(alias.toLowerCase());
        }
      }

      // Delete the originally provided key (no-op if already removed)
      this.commands.delete(providedName);
    }
  }

  /**
   * Execute a command string
   *
   * @param commandString - The full command string (e.g., "help wallet")
   * @param context - The command execution context
   *
   * Parses the command string into arguments, looks up the command,
   * and executes its handler with the provided context.
   * If the command is not found, logs an error message.
   */
  async execute(
    commandString: string,
    context: CommandContext,
    fromAI: boolean = false
  ): Promise<void> {
    // Track user input in chat history (matches vanilla terminal.html line 4028)
    if (!fromAI && context.chatHistory) {
      context.chatHistory.push({ type: "user", message: commandString });
    }

    // Parse command string into arguments
    const args = parseCommandArgs(commandString);

    // Get command name (first argument)
    if (args.length === 0) {
      return; // Empty command, do nothing
    }

    const commandName = args[0]!.toLowerCase();

    // Look up command in registry
    const command = this.commands.get(commandName);

    if (command) {
      // Execute command handler
      try {
        await command.handler(context, args);
      } catch (error) {
        // Log execution errors
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        context.log(`Error executing command: ${errorMessage}`, "error");
      }
    } else {
      // Command not found - check if AI mode should handle it
      // Matches vanilla terminal.html lines 4564-4841
      const isAIMode = context.aiProvider && context.aiProvider !== "off";

      console.log(
        "AI mode check - isAIMode:",
        isAIMode,
        "executingAICommands:",
        context.executingAICommands,
        "fromAI:",
        fromAI
      );

      // Only send to AI if NOT already executing AI commands and NOT from AI (matches vanilla line 4564)
      if (
        isAIMode &&
        !context.executingAICommands &&
        !fromAI &&
        commandString.trim()
      ) {
        // In AI mode, treat unknown commands as natural language
        context.logHtml(`<span style='color:#99ccff'>🤖 Processing</span>`);

        // Call AI command with the full command string
        const aiCommand = this.commands.get("ai");
        if (aiCommand) {
          try {
            await aiCommand.handler(context, ["ai", commandString]);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            context.log(`AI Error: ${errorMessage}`, "error");
          }
        } else {
          // Fallback if AI command not registered
          context.log(`Unknown command: ${commandName}`, "error");
          context.log("Type 'help' to see available commands", "info");
          context.log("💡 AI command not available in this build", "warning");
        }
      } else {
        // AI mode off or already executing AI - show standard error
        context.log(`Unknown command: ${commandName}`, "error");
        context.log("Type 'help' to see available commands", "info");
        if (!isAIMode) {
          context.log(
            "💡 Enable AI Mode for natural language assistance!",
            "info"
          );
        }
      }
    }
  }

  /**
   * Get a command by name
   *
   * @param name - The command name to look up
   * @returns The command if found, undefined otherwise
   */
  getCommand(name: string): Command | undefined {
    return this.commands.get(name.toLowerCase());
  }

  /**
   * Get all registered commands
   *
   * @returns Array of unique commands (excludes alias duplicates)
   *
   * Filters out duplicate entries caused by aliases, returning only
   * unique command objects.
   */
  getAllCommands(): Command[] {
    const uniqueCommands = new Map<string, Command>();

    for (const command of this.commands.values()) {
      // Use command.name as key to deduplicate aliases
      uniqueCommands.set(command.name, command);
    }

    return Array.from(uniqueCommands.values());
  }

  /**
   * Get commands filtered by category
   *
   * @param category - The category to filter by
   * @returns Array of commands in the category
   *
   * Returns all unique commands that match the specified category.
   * Commands without a category are excluded.
   */
  getCommandsByCategory(category: string): Command[] {
    return this.getAllCommands().filter(
      (cmd) => cmd.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get all command names including aliases
   *
   * @returns Array of all command names and aliases
   *
   * Used for autocomplete functionality. Returns all registered
   * command names and aliases as an array of strings.
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Get unique command names (canonical names only, no aliases)
   *
   * @returns Array of unique canonical command names
   *
   * Returns only the canonical command names without aliases,
   * useful for autocomplete to avoid showing duplicates.
   */
  getUniqueCommandNames(): string[] {
    const uniqueNames = new Set<string>();

    for (const command of this.commands.values()) {
      // Add lowercase canonical name to the set
      uniqueNames.add(command.name.toLowerCase());
    }

    return Array.from(uniqueNames);
  }
}

/**
 * Singleton instance of CommandRegistry
 * Used globally throughout the application
 */
export const commandRegistry = new CommandRegistry();

export default CommandRegistry;
