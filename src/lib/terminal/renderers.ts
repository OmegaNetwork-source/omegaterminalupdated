/**
 * Terminal Output Renderers
 * Provides utilities for rendering table, card, chart, and JSON outputs
 */

import { escapeHtml } from "@/lib/utils";

/**
 * Render data as a table
 * 
 * @param data - Array of objects to render
 * @param columns - Column definitions (key, label, formatter)
 * @returns HTML string for table
 */
export function renderTable(
  data: Record<string, any>[],
  columns: Array<{
    key: string;
    label: string;
    formatter?: (value: any) => string;
    align?: "left" | "right" | "center";
  }>
): string {
  if (!data || data.length === 0) {
    return `<div style="color: var(--palette-text, #e0e0e0); padding: 12px;">No data to display</div>`;
  }

  let html = `
    <div style="
      font-family: 'Courier New', monospace;
      overflow-x: auto;
      margin: 12px 0;
    ">
      <table style="
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        background: color-mix(in srgb, var(--palette-bg, rgba(0, 8, 18, 1)) 60%, transparent);
        border-radius: 12px;
        overflow: hidden;
      ">
        <thead>
          <tr style="
            background: color-mix(in srgb, var(--palette-primary, rgba(0, 188, 242, 1)) 20%, transparent);
            border-bottom: 2px solid var(--palette-primary, rgba(0, 188, 242, 1));
          ">
  `;

  // Header row
  columns.forEach((col) => {
    const align = col.align || "left";
    html += `
      <th style="
        padding: 12px 16px;
        text-align: ${align};
        font-weight: 700;
        color: var(--palette-primary, rgba(0, 188, 242, 0.95));
        letter-spacing: 0.08em;
        text-transform: uppercase;
      ">${escapeHtml(col.label)}</th>
    `;
  });

  html += `
          </tr>
        </thead>
        <tbody>
  `;

  // Data rows
  data.forEach((row, index) => {
    const bgColor =
      index % 2 === 0
        ? "transparent"
        : "color-mix(in srgb, var(--palette-primary, rgba(0, 188, 242, 1)) 5%, transparent)";
    html += `
      <tr style="
        border-bottom: 1px solid color-mix(in srgb, var(--palette-primary, rgba(0, 188, 242, 1)) 18%, transparent);
        background: ${bgColor};
      ">
    `;

    columns.forEach((col) => {
      const value = row[col.key];
      const formatted = col.formatter ? col.formatter(value) : String(value ?? "");
      const align = col.align || "left";
      html += `
        <td style="
          padding: 12px 16px;
          text-align: ${align};
          color: var(--palette-text, rgba(220, 225, 235, 0.85));
        ">${escapeHtml(formatted)}</td>
      `;
    });

    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  return html;
}

/**
 * Render data as a card (single item detail view)
 * 
 * @param data - Object to render
 * @param title - Card title
 * @returns HTML string for card
 */
export function renderCard(
  data: Record<string, any>,
  title?: string
): string {
  let html = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
  `;

  if (title) {
    html += `
      <div style="
        font-size: 16px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        padding: 8px;
        border-bottom: 2px solid var(--palette-border, rgba(0, 212, 255, 0.3));
      ">
        ${escapeHtml(title)}
      </div>
    `;
  }

  html += `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
      border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
      border-radius: 8px;
      padding: 16px;
    ">
  `;

  Object.entries(data).forEach(([key, value]) => {
    const formattedKey = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const formattedValue =
      typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);

    html += `
      <div style="margin-bottom: 12px;">
        <div style="
          color: var(--palette-primary, #00bcf2);
          font-weight: 600;
          margin-bottom: 4px;
        ">${escapeHtml(formattedKey)}:</div>
        <div style="
          color: var(--palette-text, #e0e0e0);
          margin-left: 16px;
          white-space: pre-wrap;
          word-wrap: break-word;
        ">${escapeHtml(formattedValue)}</div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render data as a chart (placeholder for future chart integration)
 * 
 * @param data - Chart data
 * @param type - Chart type (line, bar, heatmap)
 * @param title - Chart title
 * @returns HTML string for chart
 */
export function renderChart(
  data: any[],
  type: "line" | "bar" | "heatmap" = "line",
  title?: string
): string {
  // For now, return a formatted table
  // TODO: Integrate with actual charting library (TradingView, Chart.js, etc.)
  let html = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: var(--palette-text, #e0e0e0);
      padding: 12px;
    ">
  `;

  if (title) {
    html += `
      <div style="
        font-size: 16px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 16px;
        padding: 8px;
        border-bottom: 2px solid var(--palette-border, rgba(0, 212, 255, 0.3));
      ">
        📊 ${title}
      </div>
    `;
  }

  html += `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00bcf2) 5%, transparent) 0%, color-mix(in srgb, var(--palette-primary, #00bcf2) 2%, transparent) 100%);
      border: 1px solid var(--palette-border, color-mix(in srgb, var(--palette-primary, #00bcf2) 20%, transparent));
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    ">
      <div style="color: var(--palette-primary, #00bcf2); margin-bottom: 8px;">
        Chart visualization (${type}) coming soon
      </div>
      <div style="color: var(--palette-text, #e0e0e0); font-size: 12px;">
        Data points: ${data.length}
      </div>
    </div>
  `;

  html += `</div>`;
  return html;
}

/**
 * Render data as JSON
 * 
 * @param data - Data to render
 * @param indent - Indentation level
 * @returns HTML string for JSON
 */
export function renderJSON(data: any, indent: number = 2): string {
  const jsonString = JSON.stringify(data, null, indent);
  return `
    <div style="
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      background: color-mix(in srgb, var(--palette-bg, rgba(8, 12, 22, 1)) 85%, transparent);
      border-radius: 12px;
      border: 1px solid color-mix(in srgb, var(--palette-primary, rgba(0, 188, 242, 1)) 25%, transparent);
      padding: 16px;
      overflow-x: auto;
      color: var(--palette-text, #e0e0e0);
      white-space: pre-wrap;
      word-wrap: break-word;
    ">
${jsonString}
    </div>
  `;
}

