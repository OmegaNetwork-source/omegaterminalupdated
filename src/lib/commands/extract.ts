/**
 * Extract Commands
 *
 * Commands for extracting audio/sound from YouTube videos and other sources.
 * Supports full extraction or timestamped sections.
 *
 * Commands:
 * - extract sound <url> - Extract full audio from video
 * - extract sound <url> --start <time> --end <time> - Extract timestamped section
 * - extract help - Show help
 *
 * Note: Requires yt-dlp and ffmpeg to be installed on the system.
 */

import type { Command, CommandContext } from "@/types/commands";
import { createCommandLine, createUsageError } from "./command-output-helpers";

// ============================================================================
// Types
// ============================================================================

interface ExtractionJob {
  id: string;
  url: string;
  status: "pending" | "downloading" | "converting" | "complete" | "error";
  progress: number;
  outputFile?: string;
  error?: string;
  startTime?: string;
  endTime?: string;
  format: string;
}

// ============================================================================
// Styles
// ============================================================================

const EXTRACT_STYLES = `
  .extract-panel {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05));
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin: 8px 0;
    font-family: 'JetBrains Mono', monospace;
  }
  .extract-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  }
  .extract-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #8b5cf6, #06b6d4);
    border-radius: 10px;
    font-size: 20px;
  }
  .extract-title {
    font-size: 18px;
    font-weight: 700;
    color: #c084fc;
    margin: 0;
  }
  .extract-subtitle {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
    margin: 0;
  }
  .extract-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .extract-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .extract-label {
    font-size: 11px;
    color: rgba(255,255,255,0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .extract-hint {
    font-size: 10px;
    color: rgba(255,255,255,0.4);
    font-style: italic;
  }
  .extract-row {
    display: flex;
    gap: 12px;
  }
  .extract-row > * {
    flex: 1;
  }
  .extract-options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .extract-option {
    padding: 8px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(255,255,255,0.7);
    font-size: 12px;
    cursor: pointer;
  }
  .extract-option:hover {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
    color: #c084fc;
  }
  .extract-option.active {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.5);
    color: #c084fc;
  }
  .extract-commands {
    background: rgba(0,0,0,0.3);
    border-radius: 8px;
    padding: 14px;
    margin-top: 8px;
  }
  .extract-cmd {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .extract-cmd:last-child {
    border-bottom: none;
  }
  .extract-cmd-name {
    font-weight: 600;
    color: #00ffd6;
    min-width: 280px;
    font-size: 12px;
  }
  .extract-cmd-desc {
    color: rgba(255,255,255,0.6);
    font-size: 11px;
  }
  .extract-examples {
    background: rgba(6, 182, 212, 0.08);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 8px;
    padding: 14px;
    margin-top: 12px;
  }
  .extract-example-title {
    font-size: 12px;
    font-weight: 600;
    color: #22d3ee;
    margin-bottom: 10px;
  }
  .extract-example {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.8);
    padding: 6px 10px;
    background: rgba(0,0,0,0.3);
    border-radius: 4px;
    margin-bottom: 6px;
  }
  .extract-progress {
    background: rgba(0,0,0,0.3);
    border-radius: 8px;
    padding: 16px;
    margin-top: 12px;
  }
  .extract-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .extract-progress-status {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
  }
  .extract-progress-percent {
    font-size: 14px;
    font-weight: 700;
    color: #00ffd6;
  }
  .extract-progress-bar {
    height: 6px;
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
    overflow: hidden;
  }
  .extract-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #8b5cf6, #06b6d4);
    border-radius: 3px;
    transition: width 0.3s ease;
  }
  .extract-success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 8px;
    padding: 14px;
    margin-top: 12px;
  }
  .extract-success-title {
    font-size: 14px;
    font-weight: 600;
    color: #10b981;
    margin-bottom: 8px;
  }
  .extract-success-file {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.8);
    background: rgba(0,0,0,0.3);
    padding: 8px 12px;
    border-radius: 4px;
    word-break: break-all;
  }
  .extract-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 14px;
    margin-top: 12px;
  }
  .extract-error-title {
    font-size: 14px;
    font-weight: 600;
    color: #ef4444;
    margin-bottom: 8px;
  }
  .extract-formats {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  .extract-format {
    padding: 6px 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-size: 11px;
    color: rgba(255,255,255,0.6);
  }
  .extract-format.recommended {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.3);
    color: #c084fc;
  }
`;

// ============================================================================
// Helper Functions
// ============================================================================

function parseTimestamp(time: string): number | null {
  // Handle formats: "1:30", "01:30", "1:30:00", "90" (seconds)
  const parts = time.split(":").map(Number);
  
  if (parts.some(isNaN)) return null;
  
  if (parts.length === 1) {
    return parts[0]; // Just seconds
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // MM:SS
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
  }
  
  return null;
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["youtube.com", "youtu.be", "www.youtube.com"].some(
      domain => parsed.hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    
    // youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
  } catch {
    return null;
  }
  
  return null;
}

// ============================================================================
// Command Handlers
// ============================================================================

async function handleHelp(context: CommandContext) {
  const helpHtml = `
    <style>${EXTRACT_STYLES}</style>
    <div class="extract-panel">
      <div class="extract-header">
        <div class="extract-icon">🎵</div>
        <div>
          <h3 class="extract-title">Sound Extractor</h3>
          <p class="extract-subtitle">Extract audio from YouTube videos</p>
        </div>
      </div>
      
      <div class="extract-commands">
        <div class="extract-cmd">
          <span class="extract-cmd-name">extract sound &lt;url&gt;</span>
          <span class="extract-cmd-desc">Extract full audio from video</span>
        </div>
        <div class="extract-cmd">
          <span class="extract-cmd-name">extract sound &lt;url&gt; --start &lt;time&gt; --end &lt;time&gt;</span>
          <span class="extract-cmd-desc">Extract audio from timestamp range</span>
        </div>
        <div class="extract-cmd">
          <span class="extract-cmd-name">extract sound &lt;url&gt; --format &lt;mp3|wav|flac&gt;</span>
          <span class="extract-cmd-desc">Extract audio in specific format</span>
        </div>
        <div class="extract-cmd">
          <span class="extract-cmd-name">extract help</span>
          <span class="extract-cmd-desc">Show this help message</span>
        </div>
      </div>
      
      <div class="extract-examples">
        <div class="extract-example-title">📝 Examples</div>
        <div class="extract-example">extract sound https://youtube.com/watch?v=dQw4w9WgXcQ</div>
        <div class="extract-example">extract sound https://youtu.be/dQw4w9WgXcQ --start 1:30 --end 2:00</div>
        <div class="extract-example">extract sound https://youtube.com/watch?v=abc123 --start 21:10 --end 21:30 --format mp3</div>
      </div>
      
      <div style="margin-top: 16px;">
        <span class="extract-label">Supported Formats</span>
        <div class="extract-formats">
          <span class="extract-format recommended">MP3 (recommended)</span>
          <span class="extract-format">WAV</span>
          <span class="extract-format">FLAC</span>
          <span class="extract-format">AAC</span>
          <span class="extract-format">OGG</span>
        </div>
      </div>
      
      <div style="margin-top: 16px;">
        <span class="extract-label">Time Format</span>
        <p class="extract-hint">Use MM:SS (e.g., 1:30) or HH:MM:SS (e.g., 1:30:00) format for timestamps</p>
      </div>
    </div>
  `;
  
  context.logHtml(helpHtml);
}

async function handleSoundExtraction(context: CommandContext, args: string[]) {
  // Parse arguments
  // Format: extract sound <url> [--start <time>] [--end <time>] [--format <format>]
  
  const url = args[2];
  
  if (!url) {
    const usageHtml = createUsageError("extract sound <url> [options]", [
      "extract sound https://youtube.com/watch?v=VIDEO_ID",
      "extract sound https://youtu.be/VIDEO_ID --start 1:30 --end 2:00",
      "extract sound <url> --format wav",
    ]);
    context.logHtml(usageHtml);
    return;
  }
  
  if (!isValidUrl(url)) {
    context.log("❌ Invalid URL. Please provide a valid YouTube URL.", "error");
    context.log("", "output");
    context.log("Supported formats:", "info");
    context.log("  • https://youtube.com/watch?v=VIDEO_ID", "output");
    context.log("  • https://youtu.be/VIDEO_ID", "output");
    return;
  }
  
  // Parse optional arguments
  let startTime: string | undefined;
  let endTime: string | undefined;
  let format = "mp3";
  
  for (let i = 3; i < args.length; i++) {
    if (args[i] === "--start" && args[i + 1]) {
      startTime = args[i + 1];
      i++;
    } else if (args[i] === "--end" && args[i + 1]) {
      endTime = args[i + 1];
      i++;
    } else if (args[i] === "--format" && args[i + 1]) {
      format = args[i + 1].toLowerCase();
      i++;
    }
  }
  
  // Validate timestamps if provided
  if (startTime && parseTimestamp(startTime) === null) {
    context.log(`❌ Invalid start time: ${startTime}`, "error");
    context.log("Use format: MM:SS (e.g., 1:30) or HH:MM:SS (e.g., 1:30:00)", "info");
    return;
  }
  
  if (endTime && parseTimestamp(endTime) === null) {
    context.log(`❌ Invalid end time: ${endTime}`, "error");
    context.log("Use format: MM:SS (e.g., 1:30) or HH:MM:SS (e.g., 1:30:00)", "info");
    return;
  }
  
  // Validate format
  const validFormats = ["mp3", "wav", "flac", "aac", "ogg", "m4a"];
  if (!validFormats.includes(format)) {
    context.log(`❌ Invalid format: ${format}`, "error");
    context.log(`Supported formats: ${validFormats.join(", ")}`, "info");
    return;
  }
  
  // Build extraction info display
  const videoId = extractVideoId(url);
  const isTimestamped = startTime && endTime;
  const timestampRange = isTimestamped ? `${startTime} - ${endTime}` : "Full audio";
  
  const extractionInfoHtml = `
    <style>${EXTRACT_STYLES}</style>
    <div class="extract-panel">
      <div class="extract-header">
        <div class="extract-icon">🎵</div>
        <div>
          <h3 class="extract-title">Extracting Audio</h3>
          <p class="extract-subtitle">Processing your request...</p>
        </div>
      </div>
      
      <div class="extract-form">
        <div class="extract-field">
          <span class="extract-label">Source</span>
          <span style="color: rgba(255,255,255,0.8); font-size: 12px; word-break: break-all;">${url}</span>
        </div>
        
        <div class="extract-row">
          <div class="extract-field">
            <span class="extract-label">Range</span>
            <span style="color: #22d3ee; font-size: 13px; font-weight: 600;">${timestampRange}</span>
          </div>
          <div class="extract-field">
            <span class="extract-label">Format</span>
            <span style="color: #c084fc; font-size: 13px; font-weight: 600; text-transform: uppercase;">${format}</span>
          </div>
        </div>
      </div>
      
      <div class="extract-progress">
        <div class="extract-progress-header">
          <span class="extract-progress-status">Initializing download...</span>
          <span class="extract-progress-percent">0%</span>
        </div>
        <div class="extract-progress-bar">
          <div class="extract-progress-fill" style="width: 5%;"></div>
        </div>
      </div>
    </div>
  `;
  
  context.logHtml(extractionInfoHtml);
  
  // Execute extraction via API
  try {
    context.log("", "output");
    context.log("📥 Starting audio extraction...", "info");
    
    // Call the extraction API
    const response = await fetch("/api/extract/sound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        startTime,
        endTime,
        format,
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      const successHtml = `
        <style>${EXTRACT_STYLES}</style>
        <div class="extract-success">
          <div class="extract-success-title">✓ Extraction Complete!</div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.7); margin: 0 0 10px 0;">
            Audio has been saved to your Downloads folder
          </p>
          <div class="extract-success-file">${result.outputFile || "extracted_audio." + format}</div>
          ${result.duration ? `<p style="font-size: 11px; color: rgba(255,255,255,0.5); margin: 10px 0 0 0;">Duration: ${result.duration}</p>` : ""}
        </div>
      `;
      context.logHtml(successHtml);
    } else {
      throw new Error(result.error || "Extraction failed");
    }
  } catch (error: any) {
    // If API doesn't exist yet, show manual command
    const manualCommandHtml = `
      <style>${EXTRACT_STYLES}</style>
      <div class="extract-panel" style="border-color: rgba(245, 158, 11, 0.3); background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(6, 182, 212, 0.05));">
        <div class="extract-header">
          <div class="extract-icon" style="background: linear-gradient(135deg, #f59e0b, #eab308);">⚡</div>
          <div>
            <h3 class="extract-title" style="color: #fbbf24;">Manual Extraction</h3>
            <p class="extract-subtitle">Run this command in your terminal</p>
          </div>
        </div>
        
        <div class="extract-commands">
          <p style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 12px;">
            Copy and run this command in PowerShell or Terminal:
          </p>
          <div class="extract-example" style="padding: 12px; font-size: 12px; line-height: 1.6;">
            ${isTimestamped 
              ? `yt-dlp -x --audio-format ${format} --download-sections "*${startTime}-${endTime}" -o "%(title)s_${startTime?.replace(/:/g, "m")}-${endTime?.replace(/:/g, "m")}.%(ext)s" "${url}"`
              : `yt-dlp -x --audio-format ${format} -o "%(title)s.%(ext)s" "${url}"`
            }
          </div>
        </div>
        
        <div style="margin-top: 16px;">
          <span class="extract-label">Prerequisites</span>
          <p class="extract-hint" style="margin-top: 6px;">Make sure you have yt-dlp and ffmpeg installed:</p>
          <div class="extract-example" style="margin-top: 8px;">winget install yt-dlp.yt-dlp Gyan.FFmpeg</div>
        </div>
      </div>
    `;
    
    context.logHtml(manualCommandHtml);
  }
}

async function handleExtract(context: CommandContext, args: string[]) {
  const subCommand = args[1]?.toLowerCase();
  
  switch (subCommand) {
    case "sound":
    case "audio":
      await handleSoundExtraction(context, args);
      break;
    
    case "help":
    case undefined:
      await handleHelp(context);
      break;
    
    default:
      context.log(`Unknown subcommand: ${subCommand}`, "error");
      context.log("", "output");
      context.log("Available subcommands:", "info");
      context.log("  • extract sound <url> - Extract audio from video", "output");
      context.log("  • extract help - Show help", "output");
      break;
  }
}

// ============================================================================
// Command Definitions
// ============================================================================

export const extractCommand: Command = {
  name: "extract",
  description: "Extract audio/sound from YouTube videos",
  usage: "extract <subcommand> [options]",
  execute: handleExtract,
};

export const extractCommands: Command[] = [extractCommand];

export default extractCommands;

