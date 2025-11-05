/**
 * Flag Parser Utility
 * Parses command-line flags and arguments from command strings
 * Supports --flag, --flag=value, and --flag value formats
 */

export interface ParsedFlags {
  [key: string]: string | boolean;
}

export interface ParsedArgs {
  flags: ParsedFlags;
  positional: string[];
  raw: string[];
}

/**
 * Parse command arguments into flags and positional arguments
 * 
 * Supports:
 * - --flag (boolean flag)
 * - --flag=value (flag with value)
 * - --flag value (flag with space-separated value)
 * - positional arguments (non-flag arguments)
 * 
 * @param args - Array of command arguments
 * @returns Parsed flags and positional arguments
 */
export function parseFlags(args: string[]): ParsedArgs {
  const flags: ParsedFlags = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    // Check if it's a flag
    if (arg.startsWith("--")) {
      const flagPart = arg.substring(2); // Remove "--"

      // Check for --flag=value format
      if (flagPart.includes("=")) {
        const [key, value] = flagPart.split("=", 2);
        if (key) {
          flags[key] = value || true;
        }
      } else {
        // Check if next arg is a value (not a flag)
        const nextArg = i + 1 < args.length ? args[i + 1] : undefined;
        if (nextArg && !nextArg.startsWith("--")) {
          flags[flagPart] = nextArg;
          i++; // Skip next arg as it's the value
        } else {
          // Boolean flag
          flags[flagPart] = true;
        }
      }
    } else {
      // Positional argument
      positional.push(arg);
    }
  }

  return {
    flags,
    positional,
    raw: args,
  };
}

/**
 * Get flag value or default
 * 
 * @param flags - Parsed flags object
 * @param name - Flag name (without --)
 * @param defaultValue - Default value if flag not present
 * @returns Flag value or default
 */
export function getFlag(
  flags: ParsedFlags,
  name: string,
  defaultValue?: string | boolean
): string | boolean | undefined {
  return flags[name] ?? defaultValue;
}

/**
 * Get flag as string
 * 
 * @param flags - Parsed flags object
 * @param name - Flag name (without --)
 * @param defaultValue - Default value if flag not present
 * @returns Flag value as string
 */
export function getFlagString(
  flags: ParsedFlags,
  name: string,
  defaultValue: string = ""
): string {
  const value = flags[name];
  if (typeof value === "boolean") {
    return value ? "true" : defaultValue;
  }
  return (value as string) || defaultValue;
}

/**
 * Get flag as number
 * 
 * @param flags - Parsed flags object
 * @param name - Flag name (without --)
 * @param defaultValue - Default value if flag not present
 * @returns Flag value as number
 */
export function getFlagNumber(
  flags: ParsedFlags,
  name: string,
  defaultValue: number = 0
): number {
  const value = flags[name];
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Get flag as boolean
 * 
 * @param flags - Parsed flags object
 * @param name - Flag name (without --)
 * @param defaultValue - Default value if flag not present
 * @returns Flag value as boolean
 */
export function getFlagBoolean(
  flags: ParsedFlags,
  name: string,
  defaultValue: boolean = false
): boolean {
  const value = flags[name];
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return defaultValue;
}

