/**
 * Command Output Helpers
 * Standardized utilities for creating uniform, clickable command outputs
 * All commands should use these helpers to ensure consistency
 */

import { escapeHtml } from "@/lib/utils";

/**
 * Creates a clickable command element that users can click to input into terminal
 * Matches the help command styling for uniformity
 * 
 * @param command - The command string (e.g., "pgt track", "help wallet")
 * @param displayText - Optional display text (defaults to command)
 * @param description - Optional description text to show after the command
 * @returns HTML string for clickable command
 */
export function createClickableCommand(
  command: string,
  displayText?: string,
  description?: string
): string {
  const escapedCommand = command.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const display = displayText || command;
  const escapedDisplay = escapeHtml(display);

  let html = `
    <span 
      class="omega-help-command"
      data-command="${escapedCommand}"
      style="
        color: var(--palette-secondary, #00ff88);
        font-weight: bold;
        font-size: 1.05em;
        font-family: 'Courier New', monospace;
        text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);
        cursor: pointer;
        display: inline-block;
        padding: 2px 4px;
        border-radius: 3px;
        transition: all 0.2s ease;
        user-select: none;
      "
      onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
      onmouseout="this.style.background = 'transparent'; this.style.textShadow = '0 0 6px rgba(0, 255, 136, 0.3)';"
      title="Click to add '${escapedCommand}' to terminal input"
    >${escapedDisplay}</span>
  `;

  if (description) {
    html += `<span style="
      color: var(--palette-text, #ccd4e0);
      margin-left: 15px;
      font-size: 0.95em;
      opacity: 0.95;
    ">→ ${escapeHtml(description)}</span>`;
  }

  return html;
}

/**
 * Creates a clickable command with full line wrapper (for help outputs)
 * 
 * @param command - The command string
 * @param displayText - Optional display text
 * @param description - Optional description
 * @returns HTML string with full line wrapper
 */
export function createClickableCommandLine(
  command: string,
  displayText?: string,
  description?: string
): string {
  return `
    <div style="margin: 8px 0; padding-left: 20px; padding-bottom: 6px;">
      ${createClickableCommand(command, displayText, description)}
    </div>
  `;
}

/**
 * Creates a clickable command block (for standalone command displays)
 * 
 * @param command - The command string
 * @param displayText - Optional display text
 * @returns HTML string for command block
 */
export function createClickableCommandBlock(
  command: string,
  displayText?: string
): string {
  const escapedCommand = command.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const display = displayText || command;
  const escapedDisplay = escapeHtml(display);

  return `
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
        onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)'; this.style.textShadow = '0 0 8px var(--palette-secondary-glow, rgba(0, 255, 136, 0.5))';"
        onmouseout="this.style.background = 'transparent'; this.style.textShadow = 'none';"
        title="Click to add '${escapedCommand}' to terminal input"
      >
        ${escapedDisplay}
      </div>
    </div>
  `;
}

/**
 * Creates a standard help output container with title
 * 
 * @param title - Title for the help section
 * @param content - HTML content for the help section
 * @returns Complete help HTML
 */
export function createHelpOutput(title: string, content: string): string {
  return `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 20px;
      margin: 10px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    ">
      <div style="
        font-size: 18px;
        font-weight: 600;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
      ">${escapeHtml(title)}</div>
      ${content}
    </div>
  `;
}

/**
 * Creates a standard text line for help output
 * 
 * @param text - Text content
 * @param paddingLeft - Optional left padding (default: 15px)
 * @returns HTML string for text line
 */
export function createHelpTextLine(text: string, paddingLeft: string = "15px"): string {
  return `
    <div style="
      color: var(--palette-text, #ccd4e0);
      margin: 6px 0;
      padding-left: ${paddingLeft};
      font-size: 0.95em;
      line-height: 1.6;
    ">${escapeHtml(text)}</div>
  `;
}

/**
 * Creates an empty line spacer
 * 
 * @returns HTML string for empty line
 */
export function createEmptyLine(): string {
  return `<div style="margin: 8px 0;"></div>`;
}

/**
 * Creates a clickable command line (alias for createClickableCommandLine for consistency)
 * 
 * @param command - The command string
 * @param description - Optional description
 * @returns HTML string with full line wrapper
 */
export function createCommandLine(command: string, description?: string): string {
  return createClickableCommandLine(command, undefined, description);
}

/**
 * Creates a usage error message with clickable command examples
 * 
 * @param usage - The usage string (e.g., "send <amount> <address>")
 * @param examples - Array of example command strings
 * @returns HTML string for usage error
 */
export function createUsageError(usage: string, examples: string[]): string {
  const escapedUsage = usage.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const displayUsage = escapeHtml(usage);
  
  let examplesHtml = "";
  examples.forEach((example) => {
    const escapedExample = example.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const displayExample = escapeHtml(example);
    examplesHtml += `
      <div style="
        color: var(--palette-text, #ccd4e0);
        margin: 8px 0;
        font-size: 0.95em;
      ">Example: <span class="omega-help-command" data-command="${escapedExample}" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add '${escapedExample}' to terminal input">${displayExample}</span></div>
    `;
  });
  
  return `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-error, #ff4757) 15%, transparent), color-mix(in srgb, var(--palette-warning, #ffa502) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-error, #ff4757) 30%, transparent);
      border-radius: 12px;
      padding: 16px;
      margin: 10px 0;
    ">
      <div style="
        font-size: 16px;
        font-weight: 600;
        color: var(--palette-error, #ff4757);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        Usage Error
      </div>
      <div style="
        color: var(--palette-text, #ccd4e0);
        margin: 8px 0;
        font-size: 0.95em;
      ">Usage: <span class="omega-help-command" data-command="${escapedUsage}" style="color: var(--palette-secondary, #00ff88); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; padding: 2px 4px; border-radius: 3px; transition: all 0.2s ease;" onmouseover="this.style.background = 'color-mix(in srgb, var(--palette-secondary, #00ff88) 15%, transparent)';" onmouseout="this.style.background = 'transparent';" title="Click to add '${escapedUsage}' to terminal input">${displayUsage}</span></div>
      ${examplesHtml}
    </div>
  `;
}

/**
 * Options for creating a standardized swap status notice card
 */
interface SwapStatusNoticeOptions {
  network: string;
  status?: "coming-soon" | "maintenance" | "beta";
  icon?: string;
  title?: string;
  description?: string[];
  action?: {
    href: string;
    label: string;
  };
  note?: string;
}

/**
 * Creates a consistent swap status notice card for terminal outputs
 * @param options - Swap status configuration
 * @returns HTML string for swap notice card
 */
export function createSwapStatusNotice({
  network,
  status = "coming-soon",
  icon = "🚧",
  title,
  description = [],
  action,
  note,
}: SwapStatusNoticeOptions): string {
  const statusLabels: Record<string, string> = {
    "coming-soon": "Coming Soon",
    maintenance: "Maintenance",
    beta: "Beta Release",
  };

  const safeIcon = escapeHtml(icon);
  const safeTitle = escapeHtml(title || `${network} Swap Integration`);
  const safeStatus = escapeHtml(statusLabels[status] || "Status");

  const descriptionHtml = description
    .map(
      (line) => `<p>${escapeHtml(line)}</p>`
    )
    .join("");

  const actionHtml = action
    ? `<a class="omega-terminal-swap-card__link" href="${escapeHtml(
        action.href
      )}" target="_blank" rel="noopener noreferrer">
          <span>↗</span>${escapeHtml(action.label)}
        </a>`
    : "";

  const noteHtml = note
    ? `<div class="omega-terminal-swap-card__footer">${escapeHtml(note)}</div>`
    : "";

  return `
    <div class="omega-terminal-swap-card omega-terminal-swap-card--${escapeHtml(
      status
    )}">
      <div class="omega-terminal-swap-card__header">
        <span class="omega-terminal-swap-card__icon">${safeIcon}</span>
        <div class="omega-terminal-swap-card__meta">
          <div class="omega-terminal-swap-card__title">${safeTitle}</div>
          <div class="omega-terminal-swap-card__status">${safeStatus}</div>
        </div>
      </div>
      <div class="omega-terminal-swap-card__body">
        ${descriptionHtml}
      </div>
      ${actionHtml}
      ${noteHtml}
    </div>
  `;
}

