/**
 * Mobile HTML Optimizer
 * Converts verbose desktop HTML output into compact mobile-friendly format
 * Designed for help, quick-actions, and other command outputs
 */

export function optimizeHtmlForMobile(html: string): string {
  if (typeof window === "undefined") return html;

  // Only apply on mobile devices
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return html;

  // Check if this is a help command output
  if (
    html.includes("Omega Commands") ||
    html.includes("HELP ═══") ||
    html.includes("omega-help-command")
  ) {
    return optimizeHelpCommand(html);
  }

  // Check if this is quick-actions output
  if (
    html.includes("Quick Actions") ||
    html.includes("quick-actions") ||
    html.includes("omega-execute-command")
  ) {
    return optimizeQuickActions(html);
  } // Default: apply regex-based optimization
  return applyMinimalOptimization(html);
}

/**
 * Optimize help command output for mobile
 * Converts card-based layout to ultra-compact multi-column grid format
 */
function optimizeHelpCommand(html: string): string {
  // Extract all commands using regex
  const commandRegex =
    /class="omega-help-command"[^>]*data-command="([^"]+)"[^>]*>([^<]+)<\/span>/g;
  const commands: Array<{
    name: string;
    description: string;
    usage: string;
    aliases: string;
    category: string;
    commandHtml: string;
  }> = [];

  let match;

  while ((match = commandRegex.exec(html)) !== null) {
    const commandName = match[1] || "";

    // Extract the surrounding context (the entire command block)
    const startPos = Math.max(0, match.index - 500);
    const endPos = Math.min(html.length, match.index + 500);
    const context = html.substring(startPos, endPos);

    // Extract aliases
    const aliasMatch = context.match(/\[([^\]]+)\]/);
    const aliases = aliasMatch && aliasMatch[1] ? aliasMatch[1] : "";

    // Extract usage
    const usageMatch = context.match(/Usage:\s*<span[^>]*>([^<]+)<\/span>/);
    const usage =
      usageMatch && usageMatch[1]
        ? usageMatch[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        : "";

    // Extract description (text between command and usage/aliases)
    let description = "";
    const descMatch = context.match(
      /<\/span>\s*<\/div>\s*<div[^>]*>([^<]+)<\/div>/
    );
    if (descMatch && descMatch[1] && !descMatch[1].includes("Usage:")) {
      description = descMatch[1].trim();
    }

    // Try to find category by looking backwards
    let category = "General";
    const categoryMatch = html
      .substring(0, match.index)
      .match(/([A-Z\s&]+)\s*\(\d+\)[^<]*<\/div>\s*<div[^>]*>[^<]*$/);
    if (categoryMatch && categoryMatch[1]) {
      category = categoryMatch[1].trim();
    }

    commands.push({
      name: commandName,
      description,
      usage,
      aliases,
      category,
      commandHtml: context,
    });
  }

  if (commands.length === 0) {
    // Fallback to minimal optimization if no commands found
    return applyMinimalOptimization(html);
  }

  // Build ultra-compact mobile HTML with grid layout
  let mobileHtml = `
    <div style="font-family: monospace; font-size: 10px; line-height: 1.2; color: var(--palette-text, #e0e0e0); padding: 0;">
      <div style="font-size: 11px; font-weight: bold; color: var(--palette-primary, #00d4ff); padding: 4px 0 6px 0; margin-bottom: 4px; border-bottom: 1px solid rgba(0,212,255,0.2); text-align: center;">
        📚 ${commands.length} Commands
      </div>
  `;

  // Group by category
  const grouped = new Map<string, typeof commands>();
  commands.forEach((cmd) => {
    const cat = cmd.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(cmd);
  });

  // Render each category in a compact grid
  grouped.forEach((cmds, category) => {
    // Remove duplicates based on command name
    const uniqueCmds = Array.from(
      new Map(cmds.map((cmd) => [cmd.name, cmd])).values()
    );

    mobileHtml += `
      <div style="margin: 4px 0 6px 0;">
        <div style="font-size: 9px; color: var(--palette-primary, #00d4ff); font-weight: bold; margin-bottom: 3px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">
          ${category}
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px 4px;">
    `;

    uniqueCmds.forEach((cmd) => {
      const escapedName = cmd.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");
      const shortDesc = cmd.description
        ? cmd.description.length > 40
          ? cmd.description.substring(0, 37) + "..."
          : cmd.description
        : "";

      mobileHtml += `
          <div style="padding: 3px 4px; background: rgba(0,188,242,0.04); border-left: 1px solid var(--palette-primary, #00d4ff); border-radius: 2px; min-height: 20px; display: flex; flex-direction: column; justify-content: center;">
            <span 
              class="omega-help-command"
              data-command="${escapedName}"
              style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-size: 10px; display: block; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              onclick="if(window.__omegaSetTerminalInput) window.__omegaSetTerminalInput('${escapedName}');"
              title="${cmd.description || cmd.name}${
        cmd.usage ? " • " + cmd.usage : ""
      }"
            >${cmd.name}</span>
            ${
              shortDesc
                ? `<span style="font-size: 8px; color: var(--palette-muted, #888); margin-top: 1px; line-height: 1.1; opacity: 0.8; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${shortDesc}</span>`
                : ""
            }
          </div>
      `;
    });

    mobileHtml += `
        </div>
      </div>
    `;
  });

  mobileHtml += `
      <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0,212,255,0.06); border-radius: 2px; font-size: 9px; color: var(--palette-muted, #aaa); line-height: 1.2; text-align: center;">
        💡 Tap command • Hold for details
      </div>
    </div>
  `;

  return mobileHtml;
}

/**
 * Optimize quick-actions output for mobile
 * Ultra-compact 2-column grid layout
 */
function optimizeQuickActions(html: string): string {
  // Extract quick action items using regex
  const commandRegex =
    /class="omega-execute-command"[^>]*data-command="([^"]+)"[^>]*>([^<]+)<\/span>/g;
  const items: Array<{ command: string; label: string; description: string }> =
    [];

  let match;
  while ((match = commandRegex.exec(html)) !== null) {
    const command = match[1];
    const label = match[2];

    // Try to extract description from surrounding context
    const startPos = Math.max(0, match.index - 200);
    const endPos = Math.min(html.length, match.index + 200);
    const context = html.substring(startPos, endPos);

    const descMatch = context.match(/→\s*([^<]+)/);
    const description = descMatch && descMatch[1] ? descMatch[1].trim() : "";

    items.push({ command: command || "", label: label || "", description });
  }

  if (items.length === 0) {
    return `
      <div style="font-family: monospace; font-size: 10px; padding: 6px 0; color: var(--palette-text, #e0e0e0);">
        <div style="color: var(--palette-primary, #00d4ff); margin-bottom: 4px; font-weight: bold; font-size: 11px;">⭐ Quick Actions</div>
        <div style="font-size: 9px; color: var(--palette-muted, #aaa); padding: 4px 0;">No custom actions. Use 'qa add' to add some!</div>
      </div>
    `;
  }

  let mobileHtml = `
    <div style="font-family: monospace; font-size: 10px; line-height: 1.2; color: var(--palette-text, #e0e0e0); padding: 0;">
      <div style="font-size: 11px; font-weight: bold; color: var(--palette-primary, #00d4ff); padding: 4px 0 6px 0; margin-bottom: 4px; border-bottom: 1px solid rgba(0,212,255,0.2); text-align: center;">
        ⭐ ${items.length} Quick Actions
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px 4px;">
  `;

  items.forEach((item) => {
    const escapedCommand = item.command
      .replace(/'/g, "\\'")
      .replace(/"/g, "&quot;");

    const shortDesc = item.description
      ? item.description.length > 35
        ? item.description.substring(0, 32) + "..."
        : item.description
      : "";
    const shortLabel =
      item.label.length > 20 ? item.label.substring(0, 17) + "..." : item.label;

    mobileHtml += `
        <div style="padding: 3px 4px; background: rgba(0,255,136,0.04); border-left: 1px solid var(--palette-secondary, #00ff88); border-radius: 2px; min-height: 20px; display: flex; flex-direction: column; justify-content: center;">
          <span 
            class="omega-execute-command"
            data-command="${escapedCommand}"
            style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-size: 10px; display: block; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
            onclick="if(window.__omegaExecuteCommand) window.__omegaExecuteCommand('${escapedCommand}');"
            title="${item.label}${
      item.description ? " • " + item.description : ""
    }"
          >${shortLabel}</span>
          ${
            shortDesc
              ? `<span style="font-size: 8px; color: var(--palette-muted, #888); margin-top: 1px; line-height: 1.1; opacity: 0.8; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${shortDesc}</span>`
              : ""
          }
        </div>
    `;
  });

  mobileHtml += `
      </div>
      <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0,212,255,0.06); border-radius: 2px; font-size: 9px; color: var(--palette-muted, #aaa); line-height: 1.2; text-align: center;">
        💡 Tap to execute • 'qa add' for more
      </div>
    </div>
  `;

  return mobileHtml;
}

/**
 * Apply minimal optimization to other HTML content
 */
function applyMinimalOptimization(html: string): string {
  // Use regex to reduce spacing and sizes throughout
  return html
    .replace(/padding:\s*\d{2,}px(\s+\d{2,}px)?/gi, "padding: 6px 8px")
    .replace(/margin:\s*\d{2,}px(\s+\d{2,}px)?/gi, "margin: 3px 0")
    .replace(/font-size:\s*\d{2,}px/gi, "font-size: 11px")
    .replace(/line-height:\s*[\d.]+/gi, "line-height: 1.3")
    .replace(/gap:\s*\d{2,}px/gi, "gap: 4px")
    .replace(/border-radius:\s*\d{2,}px/gi, "border-radius: 3px");
}
