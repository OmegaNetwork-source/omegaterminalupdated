/**
 * Export Command - Export Data
 * Usage: export [--as <format>] [--path <path>]
 */

import type { Command, CommandContext } from "@/types/commands";
import { parseFlags, getFlagString } from "@/lib/terminal/flag-parser";
import { useCommandOutput } from "@/hooks/useCommandOutput";

/**
 * Store JSON output for export
 */
export function setLastJSONOutput(data: any): void {
  useCommandOutput.setLastJSONOutput(data);
}

/**
 * export - Export last command output
 * Usage: export [--as <format>] [--path <path>]
 */
async function handleExport(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const parsed = parseFlags(args.slice(1));
  const format = getFlagString(parsed.flags, "as", "json");
  const path = getFlagString(parsed.flags, "path");

  const lastJSONOutput = useCommandOutput.getState().lastJSONOutput;

  if (!lastJSONOutput) {
    context.log("❌ No data to export", "error");
    context.log("   Run a command first to generate data", "info");
    return;
  }

  try {
    let content = "";
    let filename = "export";

    switch (format.toLowerCase()) {
      case "json":
        content = JSON.stringify(lastJSONOutput, null, 2);
        filename = "export.json";
        break;

      case "csv":
        // Convert to CSV
        if (Array.isArray(lastJSONOutput) && lastJSONOutput.length > 0) {
          const headers = Object.keys(lastJSONOutput[0]!);
          const rows = lastJSONOutput.map((row: any) =>
            headers.map((h) => JSON.stringify(row[h] || "")).join(",")
          );
          content = [headers.join(","), ...rows].join("\n");
          filename = "export.csv";
        } else {
          context.log("❌ Can only export arrays as CSV", "error");
          return;
        }
        break;

      default:
        context.log(`❌ Unsupported format: ${format}`, "error");
        context.log("   Supported formats: json, csv", "info");
        return;
    }

    // Create download
    if (typeof window !== "undefined") {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = path || filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      context.log(`✓ Exported to ${path || filename}`, "success");
    } else {
      context.log("❌ Export requires browser environment", "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

export const exportCommand: Command = {
  name: "export",
  description: "Export last command output",
  usage: "export [--as <format>] [--path <path>]",
  category: "system",
  handler: handleExport,
};

export const exportCommands: Command[] = [exportCommand];

