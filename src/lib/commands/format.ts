/**
 * Format Command - Output Formatting
 * Usage: format <table|card|chart|json>
 */

import type { Command, CommandContext } from "@/types/commands";

// Store last command output for formatting
let lastOutput: any = null;

/**
 * Store output for formatting
 */
export function setLastOutput(data: any): void {
  lastOutput = data;
}

/**
 * format - Format last command output
 * Usage: format <table|card|chart|json>
 */
async function handleFormat(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const formatType = args[1]?.toLowerCase();

  if (!formatType) {
    context.log("❌ Usage: format <table|card|chart|json>", "error");
    context.log("   Example: format table", "info");
    return;
  }

  if (!lastOutput) {
    context.log("❌ No previous output to format", "error");
    context.log("   Run a command first to generate output", "info");
    return;
  }

  // Import renderers dynamically
  const { renderTable, renderCard, renderChart, renderJSON } = await import("@/lib/terminal/renderers");

  try {
    switch (formatType) {
      case "table":
        if (Array.isArray(lastOutput)) {
          // Auto-detect columns from first item
          const columns = Object.keys(lastOutput[0] || {}).map(key => ({
            key,
            label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          }));
          const html = renderTable(lastOutput, columns);
          context.logHtml(html);
        } else {
          context.log("❌ Can only format arrays as tables", "error");
        }
        break;

      case "card":
        const cardData = typeof lastOutput === "object" ? lastOutput : { value: lastOutput };
        const cardHtml = renderCard(cardData);
        context.logHtml(cardHtml);
        break;

      case "chart":
        const chartData = Array.isArray(lastOutput) ? lastOutput : [lastOutput];
        const chartHtml = renderChart(chartData, "line");
        context.logHtml(chartHtml);
        break;

      case "json":
        const jsonHtml = renderJSON(lastOutput);
        context.logHtml(jsonHtml);
        break;

      default:
        context.log(`❌ Unknown format: ${formatType}`, "error");
        context.log("   Available formats: table, card, chart, json", "info");
    }

    context.log(`✓ Formatted as ${formatType}`, "success");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

export const formatCommand: Command = {
  name: "format",
  description: "Format last command output",
  usage: "format <table|card|chart|json>",
  category: "system",
  handler: handleFormat,
};

export const formatCommands: Command[] = [formatCommand];



