/**
 * Sound Extraction API
 * 
 * Extracts audio from YouTube videos using yt-dlp and ffmpeg.
 * Supports full audio extraction or timestamped sections.
 */

import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import fs from "fs";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for extraction

// =============================================================================
// Types
// =============================================================================

interface ExtractionRequest {
  url: string;
  startTime?: string;
  endTime?: string;
  format?: string;
}

interface ExtractionResponse {
  success: boolean;
  outputFile?: string;
  outputPath?: string;
  duration?: string;
  error?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function isValidYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["youtube.com", "youtu.be", "www.youtube.com"].some(
      domain => parsed.hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*]/g, "_").substring(0, 200);
}

async function checkDependencies(): Promise<{ ytdlp: boolean; ffmpeg: boolean }> {
  const results = { ytdlp: false, ffmpeg: false };
  
  try {
    await execAsync("yt-dlp --version");
    results.ytdlp = true;
  } catch {
    // yt-dlp not found
  }
  
  try {
    await execAsync("ffmpeg -version");
    results.ffmpeg = true;
  } catch {
    // ffmpeg not found
  }
  
  return results;
}

// =============================================================================
// API Handler
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ExtractionRequest = await request.json();
    const { url, startTime, endTime, format = "mp3" } = body;

    // Validate URL
    if (!url || !isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { success: false, error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Validate format
    const validFormats = ["mp3", "wav", "flac", "aac", "ogg", "m4a"];
    if (!validFormats.includes(format.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `Invalid format. Supported: ${validFormats.join(", ")}` },
        { status: 400 }
      );
    }

    // Check dependencies
    const deps = await checkDependencies();
    if (!deps.ytdlp) {
      return NextResponse.json(
        { 
          success: false, 
          error: "yt-dlp not installed. Install with: winget install yt-dlp.yt-dlp" 
        },
        { status: 500 }
      );
    }

    // Build output path
    const downloadsDir = path.join(os.homedir(), "Downloads");
    const timestamp = Date.now();
    const isTimestamped = startTime && endTime;
    
    // Build filename
    let outputName: string;
    if (isTimestamped) {
      const startFormatted = startTime.replace(/:/g, "m");
      const endFormatted = endTime.replace(/:/g, "m");
      outputName = `extracted_${startFormatted}-${endFormatted}_${timestamp}`;
    } else {
      outputName = `extracted_full_${timestamp}`;
    }
    
    const outputTemplate = path.join(downloadsDir, `${outputName}.%(ext)s`);

    // Build yt-dlp command
    let command = `yt-dlp -x --audio-format ${format}`;
    
    // Add timestamp section if specified
    if (isTimestamped) {
      command += ` --download-sections "*${startTime}-${endTime}"`;
    }
    
    // Add output template
    command += ` -o "${outputTemplate}" "${url}"`;

    console.log("[Extract API] Running command:", command);

    // Execute extraction
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000, // 5 minute timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    console.log("[Extract API] stdout:", stdout);
    if (stderr) console.log("[Extract API] stderr:", stderr);

    // Find the output file
    const expectedFile = path.join(downloadsDir, `${outputName}.${format}`);
    let outputFile = `${outputName}.${format}`;
    let outputPath = expectedFile;

    // Check if file exists, if not try to find it
    if (!fs.existsSync(expectedFile)) {
      // Try to find the file with different extension
      const files = fs.readdirSync(downloadsDir);
      const matchingFile = files.find(f => f.startsWith(outputName));
      if (matchingFile) {
        outputFile = matchingFile;
        outputPath = path.join(downloadsDir, matchingFile);
      }
    }

    // Get duration if possible
    let duration: string | undefined;
    if (isTimestamped && startTime && endTime) {
      const parseTime = (t: string) => {
        const parts = t.split(":").map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        return 0;
      };
      const durationSec = parseTime(endTime) - parseTime(startTime);
      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;
      duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }

    return NextResponse.json({
      success: true,
      outputFile,
      outputPath,
      duration,
      message: `Audio extracted successfully to ${outputFile}`,
    });

  } catch (error: any) {
    console.error("[Extract API] Error:", error);
    
    // Check if it's a timeout error
    if (error.killed) {
      return NextResponse.json(
        { success: false, error: "Extraction timed out. Try a shorter clip." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Extraction failed",
        details: error.stderr || error.stdout,
      },
      { status: 500 }
    );
  }
}

// GET handler for checking status/dependencies
export async function GET() {
  const deps = await checkDependencies();
  
  return NextResponse.json({
    success: true,
    dependencies: deps,
    ready: deps.ytdlp && deps.ffmpeg,
    message: deps.ytdlp && deps.ffmpeg 
      ? "All dependencies installed" 
      : "Missing dependencies. Install yt-dlp and ffmpeg.",
  });
}

