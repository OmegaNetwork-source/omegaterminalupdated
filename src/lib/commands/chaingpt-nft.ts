/**
 * ChainGPT NFT Generator Commands Module
 * Migrated from js/commands/chaingpt-nft.js to TypeScript
 *
 * ChainGPT AI NFT Generator:
 * - nftgen init: Initialize with API key
 * - nftgen generate: Generate NFT artwork
 * - nftgen enhance: Enhance prompt
 * - nftgen models: Show available models
 * - nftgen styles: Show available styles
 * - nftgen gallery: View generated NFTs
 * - nftgen test: Test API connection
 * - nftgen help: Show help and examples
 */

import type { Command, CommandContext } from "@/types/commands";
import { chaingpt } from "@/lib/api";
import { escapeHtml } from "@/lib/utils";

/**
 * Supported NFT generation models
 */
const NFT_MODELS: Record<string, string> = {
  velogen: "VeloGen - Fast generation",
  nebula_forge_xl: "Nebula Forge XL - High quality",
  VisionaryForge: "Visionary Forge - Creative",
  Dale3: "DALL-E 3 - Premium (4.75 credits)",
};

/**
 * Supported NFT art styles
 */
const NFT_STYLES: string[] = [
  "3d-model",
  "analog-film",
  "anime",
  "cinematic",
  "comic-book",
  "digital-art",
  "enhance",
  "fantasy-art",
  "isometric",
  "line-art",
  "low-poly",
  "neon-punk",
  "origami",
  "photographic",
  "pixel-art",
  "texture",
  "craft-clay",
];

/**
 * localStorage key for NFT gallery
 */
const NFT_GALLERY_KEY = "chaingpt-nft-gallery";

/**
 * Save NFT to gallery
 */
function saveToGallery(nft: {
  url: string;
  prompt: string;
  model: string;
  timestamp: string;
}): void {
  if (typeof window === "undefined") return;

  try {
    const gallery = getGallery();
    gallery.unshift(nft);

    // Keep only last 50 NFTs
    const limited = gallery.slice(0, 50);

    localStorage.setItem(NFT_GALLERY_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error("Failed to save to gallery:", error);
  }
}

/**
 * Get NFT gallery
 */
function getGallery(): any[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(NFT_GALLERY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load gallery:", error);
  }

  return [];
}

/**
 * Handle NFT generator initialization
 */
async function handleInit(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const apiKey = args[2]; // Optional API key from user

  try {
    const result = await chaingpt.initialize(apiKey);

    if (result.success) {
      context.log("✅ ChainGPT NFT Generator initialized!", "success");
      context.log("", "output");

      if (result.message) {
        context.log(result.message, "info");
      }

      context.log("", "output");
      context.log("📖 NEXT STEPS:", "info");
      context.log("", "output");
      context.log("1. Generate an NFT:", "output");
      context.log("   nftgen generate cyberpunk cat with neon lights", "info");
      context.log("", "output");
      context.log("2. View available models:", "output");
      context.log("   nftgen models", "info");
      context.log("", "output");
      context.log("3. Get help:", "output");
      context.log("   nftgen help", "info");
    } else {
      context.log(`❌ Initialization failed: ${result.error}`, "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Handle NFT generation
 */
async function handleGenerate(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Check initialization
  if (!chaingpt.isInitialized()) {
    context.log("❌ ChainGPT not initialized", "error");
    context.log("", "output");
    context.log("💡 Initialize first:", "info");
    context.log("   nftgen init              (use default key)", "output");
    context.log("   nftgen init <api-key>    (use your own key)", "output");
    return;
  }

  // Get prompt - skip 'nftgen' and 'generate' if present
  let promptParts = args.slice(1);
  if (promptParts[0] === "generate") {
    promptParts = promptParts.slice(1);
  }

  let prompt = promptParts.join(" ").trim();

  if (!prompt) {
    context.log("❌ Please provide a prompt", "error");
    context.log("", "output");
    context.log("💡 Example:", "info");
    context.log("   nftgen generate cyberpunk cat with neon lights", "output");
    return;
  }

  // Parse options from prompt
  let model = "velogen"; // Default model
  let style: string | undefined;
  let width = 512;
  let height = 512;
  let enhance = false;

  // Extract --model option
  const modelMatch = prompt.match(/--model[=\s]+(\w+)/i);
  if (modelMatch) {
    model = modelMatch[1]!.toLowerCase();
    prompt = prompt.replace(modelMatch[0], "").trim();
  }

  // Extract --style option
  const styleMatch = prompt.match(/--style[=\s]+([a-z\-]+)/i);
  if (styleMatch) {
    style = styleMatch[1]!;
    prompt = prompt.replace(styleMatch[0], "").trim();
  }

  // Extract --size option (e.g., --size 1024x1024)
  const sizeMatch = prompt.match(/--size[=\s]+(\d+)x(\d+)/i);
  if (sizeMatch) {
    width = parseInt(sizeMatch[1]!);
    height = parseInt(sizeMatch[2]!);
    prompt = prompt.replace(sizeMatch[0], "").trim();
  }

  // Check --enhance flag
  if (prompt.includes("--enhance")) {
    enhance = true;
    prompt = prompt.replace(/--enhance/gi, "").trim();
  }

  try {
    context.log(`🎨 Generating NFT artwork...`, "info");
    context.log(`   Prompt: "${prompt}"`, "output");
    context.log(`   Model: ${model}`, "output");
    if (style) {
      context.log(`   Style: ${style}`, "output");
    }
    context.log(`   Size: ${width}x${height}`, "output");
    context.log("⏳ Creating artwork...", "info");
    context.log("", "output");

    // Build enhance string if needed
    const enhanceStr = enhance
      ? "Enhance this prompt for NFT generation"
      : undefined;

    // Generate NFT
    const response = await chaingpt.generateNFT({
      prompt: prompt,
      model: model,
      height: height,
      width: width,
      walletAddress: "0x0000000000000000000000000000000000000000",
      amount: 1,
      chainId: 1,
      enhance: enhanceStr,
    });

    if (
      !response.success ||
      !response.data ||
      !response.data.images ||
      response.data.images.length === 0
    ) {
      throw new Error(response.message || "Failed to generate NFT");
    }

    const nft = response.data.images[0]!;

    // Save to gallery
    saveToGallery({
      url: nft.url,
      prompt: prompt,
      model: model,
      timestamp: nft.timestamp || new Date().toISOString(),
    });

    // Display NFT with styled HTML card
    const html = `
      <div style="
        background: linear-gradient(135deg, rgba(175, 82, 222, 0.1), rgba(255, 45, 85, 0.1));
        border: 1px solid rgba(175, 82, 222, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
        max-width: 100%;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <div style="
              font-size: 32px;
              line-height: 1;
            ">🎨</div>
            <div style="
              font-size: 18px;
              font-weight: 600;
              color: #AF52DE;
            ">Generated NFT Artwork</div>
          </div>
        </div>
        <div style="
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        ">
          <img src="${escapeHtml(nft.url)}" alt="${escapeHtml(prompt)}" style="
            max-width: 512px;
            width: 100%;
            height: auto;
            border-radius: 8px;
            border: 2px solid rgba(175, 82, 222, 0.3);
          " />
        </div>
        <div style="
          color: #ffffff;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 12px;
        ">
          <strong style="color: #AF52DE;">Prompt:</strong> ${escapeHtml(prompt)}
        </div>
        <div style="
          color: #888888;
          font-size: 12px;
          margin-bottom: 16px;
        ">
          <strong style="color: #AF52DE;">Model:</strong> ${escapeHtml(
            model
          )} • 
          <strong style="color: #AF52DE;">Size:</strong> ${width}x${height}
        </div>
        <div style="
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        ">
          <a href="${escapeHtml(nft.url)}" target="_blank" download style="
            flex: 1;
            background: rgba(175, 82, 222, 0.2);
            border: 1px solid rgba(175, 82, 222, 0.4);
            border-radius: 6px;
            padding: 10px 16px;
            color: #AF52DE;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
          ">📥 Download</a>
        </div>
        <div style="
          padding-top: 16px;
          border-top: 1px solid rgba(175, 82, 222, 0.2);
          font-size: 12px;
          color: #888888;
        ">
          <span style="color: #AF52DE;">💳</span> Credits used: ${
            model === "Dale3" ? "4.75" : "1.0"
          }
        </div>
      </div>
    `;

    context.logHtml(html);

    context.log("", "output");
    context.log("✅ NFT generated successfully!", "success");
    context.log("💾 Saved to gallery", "info");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Try different model: nftgen models", "output");
    context.log("   • Simplify prompt", "output");
    context.log("   • Check API key: nftgen test", "output");
  }
}

/**
 * Handle prompt enhancement
 */
async function handleEnhance(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.log("⚠️  Prompt enhancement feature coming soon!", "warning");
  context.log("", "output");
  context.log("💡 For now, try the --enhance flag with generate:", "info");
  context.log("   nftgen generate --enhance your prompt here", "output");
}

/**
 * Handle models display
 */
function handleModels(context: CommandContext, args: string[]): void {
  context.log("", "output");
  context.log("🎨 NFT GENERATION MODELS", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  for (const [key, description] of Object.entries(NFT_MODELS)) {
    context.log(`  ${key.padEnd(18)} → ${description}`, "output");
  }

  context.log("", "output");
  context.log("💡 USAGE EXAMPLE:", "info");
  context.log("", "output");
  context.log("  # Use specific model", "output");
  context.log("  nftgen generate --model Dale3 cyberpunk city", "info");
  context.log("", "output");
  context.log("💳 CREDIT COSTS:", "info");
  context.log("", "output");
  context.log("  • velogen: 1.0 credit", "output");
  context.log("  • nebula_forge_xl: 1.0 credit", "output");
  context.log("  • VisionaryForge: 1.0 credit", "output");
  context.log("  • Dale3: 4.75 credits", "output");
  context.log("", "output");
}

/**
 * Handle styles display
 */
function handleStyles(context: CommandContext, args: string[]): void {
  context.log("", "output");
  context.log("🎭 NFT ART STYLES", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  // Display styles in a grid format (3 columns)
  const columns = 3;
  for (let i = 0; i < NFT_STYLES.length; i += columns) {
    const row = NFT_STYLES.slice(i, i + columns);
    context.log(`  ${row.map((s) => s.padEnd(18)).join("")}`, "output");
  }

  context.log("", "output");
  context.log("💡 USAGE EXAMPLE:", "info");
  context.log("", "output");
  context.log("  # Apply style to generation", "output");
  context.log("  nftgen generate --style anime samurai warrior", "info");
  context.log("", "output");
}

/**
 * Handle gallery display
 */
function handleGallery(context: CommandContext, args: string[]): void {
  const gallery = getGallery();

  if (gallery.length === 0) {
    context.log("", "output");
    context.log("📁 NFT GALLERY", "info");
    context.log("", "output");
    context.log("Your gallery is empty. Generate your first NFT!", "output");
    context.log("", "output");
    context.log("💡 Example:", "info");
    context.log("   nftgen generate cyberpunk cat with neon lights", "output");
    context.log("", "output");
    return;
  }

  context.log("", "output");
  context.log(`📁 NFT GALLERY (${gallery.length} items)`, "info");
  context.log("", "output");

  // Show last 20 NFTs
  const recent = gallery.slice(0, 20);

  for (let i = 0; i < recent.length; i++) {
    const nft = recent[i];
    const date = new Date(nft.timestamp).toLocaleDateString();

    const html = `
      <div style="
        background: rgba(175, 82, 222, 0.05);
        border: 1px solid rgba(175, 82, 222, 0.2);
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
        display: flex;
        gap: 12px;
        align-items: center;
      ">
        <img src="${escapeHtml(nft.url)}" alt="${escapeHtml(
      nft.prompt
    )}" style="
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid rgba(175, 82, 222, 0.3);
        " />
        <div style="flex: 1;">
          <div style="
            color: #ffffff;
            font-size: 13px;
            margin-bottom: 4px;
            font-weight: 600;
          ">${escapeHtml(nft.prompt.substring(0, 60))}${
      nft.prompt.length > 60 ? "..." : ""
    }</div>
          <div style="
            color: #888888;
            font-size: 11px;
          ">
            ${escapeHtml(nft.model)} • ${date}
          </div>
        </div>
        <a href="${escapeHtml(nft.url)}" target="_blank" style="
          background: rgba(175, 82, 222, 0.2);
          border: 1px solid rgba(175, 82, 222, 0.4);
          border-radius: 6px;
          padding: 6px 12px;
          color: #AF52DE;
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
        ">👁️ View</a>
      </div>
    `;

    context.logHtml(html);
  }

  context.log("", "output");
  if (gallery.length > 20) {
    context.log(
      `Showing 20 of ${gallery.length} NFTs. Older items are hidden.`,
      "info"
    );
  }
  context.log("", "output");
}

/**
 * Handle NFT generator test
 */
async function handleTest(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.log("🔬 Testing ChainGPT NFT Generator...", "info");
  context.log("", "output");

  // Check initialization
  const initialized = chaingpt.isInitialized();
  context.log(`📊 Initialized: ${initialized ? "✅ Yes" : "❌ No"}`, "output");

  if (!initialized) {
    context.log("", "output");
    context.log("💡 Initialize first:", "info");
    context.log("   nftgen init              (use default key)", "output");
    context.log("   nftgen init <api-key>    (use your own key)", "output");
    return;
  }

  // Get API key (masked)
  const apiKey = chaingpt.getApiKey();
  if (apiKey) {
    const masked =
      apiKey.length > 12
        ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
        : "****";
    context.log(`🔑 API Key: ${masked}`, "output");
  }

  context.log(`🌐 Base URL: https://api.chaingpt.org`, "output");
  context.log(`📍 Default Model: velogen`, "output");
  context.log("", "output");
  context.log("✅ Configuration looks good!", "success");

  // Show gallery status
  const gallery = getGallery();
  context.log(`📁 Gallery: ${gallery.length} NFTs saved`, "info");
}

/**
 * Handle NFT generator help
 */
function handleHelp(context: CommandContext, args: string[]): void {
  context.log("", "output");
  context.log("🎨 CHAINGPT AI NFT GENERATOR", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  context.log("📋 SETUP & CONFIGURATION", "info");
  context.log("", "output");
  context.log(
    "  nftgen init                  Initialize with default API key",
    "output"
  );
  context.log(
    "  nftgen init <api-key>        Initialize with your API key",
    "output"
  );
  context.log("  nftgen test                  Test API connection", "output");
  context.log("", "output");

  context.log("🎨 GENERATION COMMANDS", "info");
  context.log("", "output");
  context.log("  nftgen generate <prompt>     Generate NFT artwork", "output");
  context.log(
    "  nftgen enhance <prompt>      Enhance prompt (coming soon)",
    "output"
  );
  context.log("  nftgen models                Show available models", "output");
  context.log("  nftgen styles                Show available styles", "output");
  context.log("  nftgen gallery               View generated NFTs", "output");
  context.log(
    "  nftgen help                  Show this help message",
    "output"
  );
  context.log("", "output");

  context.log("⚙️  OPTIONS", "info");
  context.log("", "output");
  context.log(
    "  --model <model>              AI model (velogen, Dale3, etc.)",
    "output"
  );
  context.log(
    "  --style <style>              Art style (anime, cinematic, etc.)",
    "output"
  );
  context.log(
    "  --size <width>x<height>      Image size (e.g., 512x512, 1024x1024)",
    "output"
  );
  context.log(
    "  --enhance                    Enhance prompt automatically",
    "output"
  );
  context.log("", "output");

  context.log("📚 EXAMPLES", "info");
  context.log("", "output");
  context.log("  # Simple generation", "output");
  context.log("  nftgen generate cyberpunk cat with neon lights", "info");
  context.log("", "output");
  context.log("  # With specific model", "output");
  context.log("  nftgen generate --model Dale3 futuristic cityscape", "info");
  context.log("", "output");
  context.log("  # With style", "output");
  context.log("  nftgen generate --style anime warrior princess", "info");
  context.log("", "output");
  context.log("  # Custom size", "output");
  context.log("  nftgen generate --size 1024x1024 dragon in space", "info");
  context.log("", "output");
  context.log("  # Multiple options", "output");
  context.log(
    "  nftgen generate --model nebula_forge_xl --style cinematic sunset over ocean",
    "info"
  );
  context.log("", "output");

  context.log("💳 CREDITS", "info");
  context.log("", "output");
  context.log("  • Standard models: 1.0 credit per image", "output");
  context.log("  • Dale3 (DALL-E 3): 4.75 credits per image", "output");
  context.log("", "output");

  context.log("📁 GALLERY", "info");
  context.log("", "output");
  context.log("  • Generated NFTs are automatically saved", "output");
  context.log("  • View your collection: nftgen gallery", "output");
  context.log("  • Last 50 NFTs are stored locally", "output");
  context.log("", "output");

  context.log("🔗 RESOURCES", "info");
  context.log("", "output");
  context.log("  • Get API key: https://api.chaingpt.org", "output");
  context.log("  • Documentation: https://docs.chaingpt.org", "output");
  context.log("  • Support: https://chaingpt.org", "output");
  context.log("", "output");
}

/**
 * Main nftgen command handler
 */
export const nftgenCommand: Command = {
  name: "nftgen",
  aliases: ["chaingpt-nft"],
  description: "ChainGPT AI NFT Generator",
  usage:
    "nftgen <init|generate|enhance|models|styles|gallery|test|help> [params]",
  category: "ai",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "init":
        await handleInit(context, args);
        break;

      case "generate":
        await handleGenerate(context, args);
        break;

      case "enhance":
        await handleEnhance(context, args);
        break;

      case "models":
        handleModels(context, args);
        break;

      case "styles":
        handleStyles(context, args);
        break;

      case "gallery":
        handleGallery(context, args);
        break;

      case "test":
        await handleTest(context, args);
        break;

      case "help":
      case undefined:
        handleHelp(context, args);
        break;

      default:
        // Treat as a generate prompt
        await handleGenerate(context, args);
        break;
    }
  },
};

/**
 * Export array of nftgen commands
 */
export const nftgenCommands: Command[] = [nftgenCommand];
