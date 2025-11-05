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
  // No init required - API will use server keys automatically if available

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

    // Generate NFT (no init required - uses server keys automatically)
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

    // Handle different response formats
    if (!response) {
      throw new Error("No response from NFT generation API");
    }

    // Always log response for debugging (critical for troubleshooting)
    console.log("[NFT] Full API Response:", JSON.stringify(response, null, 2));
    console.log("[NFT] Response keys:", Object.keys(response));
    if (response.data) {
      console.log("[NFT] Response.data keys:", Object.keys(response.data));
    }

    // Check if response indicates explicit failure
    if (response.success === false) {
      throw new Error(response.message || "NFT generation failed");
    }

    // Handle case where response.message is "Request Successful" but data structure differs
    // ChainGPT API might return success message with data in different locations
    let nftUrl: string | null = null;
    let nftData: any = null;
    const responseAny = response as any;

    // Check standard format: response.data.images[0].url
    if (response.data && response.data.images && response.data.images.length > 0) {
      nftData = response.data.images[0];
      nftUrl = nftData?.url || nftData?.imageUrl || null;
      console.log("[NFT] Found image in response.data.images[0]");
    }
    // Check imagesUrl array (ChainGPT variant) - need to cast to any since it's not in type
    else if (response.data && (response.data as any).imagesUrl && Array.isArray((response.data as any).imagesUrl) && (response.data as any).imagesUrl.length > 0) {
      const url = (response.data as any).imagesUrl[0];
      nftUrl = typeof url === "string" ? url : url?.url || null;
      nftData = { url: nftUrl, prompt: prompt, model: model };
      console.log("[NFT] Found image in response.data.imagesUrl[0]");
    }
    // Check alternative formats in response.data
    else if (response.data) {
      const data = response.data as any;
      
      // Check for direct URL field
      if (data.url && typeof data.url === "string") {
        nftUrl = data.url;
        nftData = { url: data.url, prompt: prompt, model: model };
        console.log("[NFT] Found image in response.data.url");
      }
      // Check for image array in different location
      else if (Array.isArray(data.images) && data.images.length > 0) {
        nftData = typeof data.images[0] === "string" 
          ? { url: data.images[0], prompt: prompt, model: model }
          : data.images[0];
        nftUrl = typeof nftData === "string" ? nftData : nftData.url || nftData.imageUrl || null;
        console.log("[NFT] Found image in response.data.images array");
      }
      // Check for single image object
      else if (data.image && typeof data.image === "string") {
        nftUrl = data.image;
        nftData = { url: data.image, prompt: prompt, model: model };
        console.log("[NFT] Found image in response.data.image");
      }
      // Check for results array
      else if (Array.isArray(data.results) && data.results.length > 0) {
        nftData = typeof data.results[0] === "string"
          ? { url: data.results[0], prompt: prompt, model: model }
          : data.results[0];
        nftUrl = typeof nftData === "string" ? nftData : nftData.url || nftData.imageUrl || null;
        console.log("[NFT] Found image in response.data.results array");
      }
      // Check for imageUrl field
      else if (data.imageUrl && typeof data.imageUrl === "string") {
        nftUrl = data.imageUrl;
        nftData = { url: data.imageUrl, prompt: prompt, model: model };
        console.log("[NFT] Found image in response.data.imageUrl");
      }
    }
    // Check root level fields
    else if (responseAny.url && typeof responseAny.url === "string") {
      nftUrl = responseAny.url;
      nftData = { url: nftUrl, prompt: prompt, model: model };
      console.log("[NFT] Found image in response.url");
    }
    else if (responseAny.image && typeof responseAny.image === "string") {
      nftUrl = responseAny.image;
      nftData = { url: nftUrl, prompt: prompt, model: model };
      console.log("[NFT] Found image in response.image");
    }
    else if (responseAny.images && Array.isArray(responseAny.images) && responseAny.images.length > 0) {
      const img = responseAny.images[0];
      nftUrl = typeof img === "string" ? img : img?.url || null;
      nftData = { url: nftUrl, prompt: prompt, model: model };
      console.log("[NFT] Found image in response.images array");
    }
    // Deep search in response if message is "Request Successful"
    else if (response.message && response.message.toLowerCase().includes("successful")) {
      console.warn("[NFT] Response says 'successful' but no image found in standard locations. Searching deeper...");
      
      // Deep search function
      const findImageUrl = (obj: any, depth = 0): string | null => {
        if (depth > 5) return null; // Prevent infinite recursion
        if (!obj || typeof obj !== "object") return null;
        
        // Check common image URL patterns
        const urlPatterns = ['url', 'imageUrl', 'image', 'image_url', 'imageURL', 'src', 'source'];
        for (const pattern of urlPatterns) {
          if (obj[pattern] && typeof obj[pattern] === "string" && obj[pattern].startsWith("http")) {
            return obj[pattern];
          }
        }
        
        // Check arrays
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const url = findImageUrl(item, depth + 1);
            if (url) return url;
          }
        }
        
        // Recursively search nested objects
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const url = findImageUrl(obj[key], depth + 1);
            if (url) return url;
          }
        }
        
        return null;
      };
      
      const foundUrl = findImageUrl(response);
      if (foundUrl) {
        nftUrl = foundUrl;
        nftData = { url: foundUrl, prompt: prompt, model: model };
        console.log("[NFT] Found image URL via deep search:", foundUrl);
      } else {
        // API might return success but image is still generating (async)
        throw new Error("NFT generation request was successful, but no image URL was found in the response. The image may still be processing. Please check the ChainGPT dashboard or try again in a few moments.");
      }
    }

    // If we found a URL, use it
    if (nftUrl) {
      const finalNft = {
        url: nftUrl,
        prompt: nftData?.prompt || prompt,
        model: nftData?.model || model,
        timestamp: nftData?.timestamp || new Date().toISOString(),
      };
      
      // Save to gallery (only once)
      saveToGallery(finalNft);
      
      // Use the final NFT for display
      const nft = finalNft;

      // Display NFT with styled HTML card (theme-compatible)
      const html = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
        max-width: 100%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
              color: var(--palette-primary, #00d4ff);
              text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
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
            border: 2px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 50%, transparent);
          " />
        </div>
        <div style="
          color: var(--palette-text, #e0e0e0);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 12px;
          padding: 12px;
          background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 40%, transparent);
          border-radius: 6px;
          border-left: 3px solid var(--palette-primary, #00d4ff);
        ">
          <strong style="color: var(--palette-primary, #00d4ff); margin-right: 8px;">Prompt:</strong>
          <span style="color: var(--palette-text, #e0e0e0);">${escapeHtml(prompt)}</span>
        </div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 12px;
          margin-bottom: 16px;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        ">
          <span>
            <strong style="color: var(--palette-primary, #00d4ff);">Model:</strong> 
            <span style="color: var(--palette-text, #e0e0e0);">${escapeHtml(model)}</span>
          </span>
          <span>
            <strong style="color: var(--palette-primary, #00d4ff);">Size:</strong> 
            <span style="color: var(--palette-text, #e0e0e0);">${width}x${height}</span>
          </span>
          ${style ? `<span>
            <strong style="color: var(--palette-primary, #00d4ff);">Style:</strong> 
            <span style="color: var(--palette-text, #e0e0e0);">${escapeHtml(style)}</span>
          </span>` : ""}
        </div>
        <div style="
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        ">
          <a href="${escapeHtml(nft.url)}" target="_blank" download style="
            flex: 1;
            background: color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
            border-radius: 6px;
            padding: 10px 16px;
            color: var(--palette-primary, #00d4ff);
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
          " 
          onmouseover="this.style.background='color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)'; this.style.borderColor='var(--palette-primary, #00d4ff)';"
          onmouseout="this.style.background='color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)'; this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent)';"
          >📥 Download</a>
          <a href="${escapeHtml(nft.url)}" target="_blank" style="
            flex: 1;
            background: color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent);
            border: 1px solid color-mix(in srgb, var(--palette-secondary, #00ff88) 40%, transparent);
            border-radius: 6px;
            padding: 10px 16px;
            color: var(--palette-secondary, #00ff88);
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.background='color-mix(in srgb, var(--palette-secondary, #00ff88) 30%, transparent)'; this.style.borderColor='var(--palette-secondary, #00ff88)';"
          onmouseout="this.style.background='color-mix(in srgb, var(--palette-secondary, #00ff88) 20%, transparent)'; this.style.borderColor='color-mix(in srgb, var(--palette-secondary, #00ff88) 40%, transparent)';"
          >🔗 Open</a>
        </div>
        <div style="
          padding-top: 16px;
          border-top: 1px solid color-mix(in srgb, var(--palette-border, rgba(0, 212, 255, 0.3)) 50%, transparent);
          font-size: 12px;
          color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span style="color: var(--palette-primary, #00d4ff);">💳</span>
          <span>Credits used: <strong style="color: var(--palette-secondary, #00ff88);">${
            model === "Dale3" ? "4.75" : "1.0"
          }</strong></span>
          <span style="margin-left: auto; color: color-mix(in srgb, var(--palette-text, #ffffff) 50%, transparent);">
            💾 Saved to gallery
          </span>
        </div>
      </div>
    `;

      context.logHtml(html);

      context.log("", "output");
      context.log("✅ NFT generated successfully!", "success");
      context.log("💾 Saved to gallery", "info");
    } else {
      // No URL found anywhere - provide detailed error with response structure
      const responseStr = JSON.stringify(response, null, 2).substring(0, 500); // Limit length
      throw new Error(
        `NFT generation request completed, but no image URL was found in the response.\n\n` +
        `Response message: ${response.message || "None"}\n` +
        `Response structure (first 500 chars):\n${responseStr}\n\n` +
        `Possible reasons:\n` +
        `• Image is still processing (async generation)\n` +
        `• API returned unexpected response format\n` +
        `• Check browser console for full response details\n\n` +
        `Please check the ChainGPT dashboard or try again in a few moments.`
      );
    }
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    const errorStr = errorMsg.toLowerCase();
    
    // Check if it's an API key/configuration error
    if (errorStr.includes("key") || errorStr.includes("api") || 
        errorStr.includes("401") || errorStr.includes("403") ||
        errorStr.includes("not configured") || errorStr.includes("503")) {
      context.log(`❌ API Configuration Error`, "error");
      context.log("", "output");
      context.log("💡 ChainGPT NFT Generator requires an API key:", "info");
      context.log("", "output");
      context.log("Option 1: Use your own API key (recommended):", "output");
      context.log("   nftgen init <your-api-key>", "info");
      context.log("   Get one at: https://api.chaingpt.org", "output");
      context.log("", "output");
      context.log("Option 2: Server keys may be configured by admin", "output");
      context.log("   Contact the administrator if server keys are expected", "info");
    } else {
      context.log(`❌ Error: ${errorMsg}`, "error");
      context.log("", "output");
      context.log("💡 Troubleshooting:", "info");
      context.log("   • Try different model: nftgen models", "output");
      context.log("   • Simplify your prompt", "output");
      context.log("   • Check API connection: nftgen test", "output");
    }
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
    const emptyHtml = `
      <div style="
        background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
        border-radius: 12px;
        padding: 24px;
        margin: 10px 0;
        text-align: center;
      ">
        <div style="font-size: 48px; line-height: 1; margin-bottom: 16px;">🎨</div>
        <div style="
          font-size: 18px;
          font-weight: 600;
          color: var(--palette-primary, #00d4ff);
          margin-bottom: 12px;
          text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
        ">NFT Gallery</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
          font-size: 14px;
          margin-bottom: 20px;
        ">Your gallery is empty. Generate your first NFT!</div>
        <div style="
          color: color-mix(in srgb, var(--palette-text, #ffffff) 60%, transparent);
          font-size: 12px;
          margin-top: 16px;
        ">
          💡 Example: <span style="color: var(--palette-secondary, #00ff88); font-family: 'Courier New', monospace;">nftgen generate cyberpunk cat with neon lights</span>
        </div>
      </div>
    `;
    context.logHtml(emptyHtml);
    return;
  }

  // Display gallery header with styled HTML
  const headerHtml = `
    <div style="
      background: linear-gradient(135deg, color-mix(in srgb, var(--palette-primary, #00d4ff) 15%, transparent), color-mix(in srgb, var(--palette-secondary, #00ff88) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
      border-radius: 12px;
      padding: 16px 20px;
      margin: 10px 0 20px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
      ">
        <div style="font-size: 28px; line-height: 1;">🎨</div>
        <div>
          <div style="
            font-size: 18px;
            font-weight: 600;
            color: var(--palette-primary, #00d4ff);
            text-shadow: 0 0 8px color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
          ">NFT Gallery</div>
          <div style="
            font-size: 12px;
            color: color-mix(in srgb, var(--palette-text, #ffffff) 70%, transparent);
            margin-top: 4px;
          ">Showing ${Math.min(gallery.length, 20)} of ${gallery.length} NFTs</div>
        </div>
      </div>
    </div>
  `;
  
  context.logHtml(headerHtml);
  context.log("", "output");

  // Show last 20 NFTs
  const recent = gallery.slice(0, 20);

  for (let i = 0; i < recent.length; i++) {
    const nft = recent[i];
    const date = new Date(nft.timestamp).toLocaleDateString();

    const html = `
      <div style="
        background: color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent);
        border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
        display: flex;
        gap: 12px;
        align-items: center;
        transition: all 0.2s ease;
      "
      onmouseover="this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent)'; this.style.background='color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 80%, transparent)';"
      onmouseout="this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)'; this.style.background='color-mix(in srgb, var(--palette-surface, rgba(21, 21, 32, 1)) 60%, transparent)';"
      >
        <img src="${escapeHtml(nft.url)}" alt="${escapeHtml(
      nft.prompt
    )}" style="
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 2px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        " />
        <div style="flex: 1; min-width: 0;">
          <div style="
            color: var(--palette-text, #e0e0e0);
            font-size: 13px;
            margin-bottom: 4px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          " title="${escapeHtml(nft.prompt)}">${escapeHtml(nft.prompt.substring(0, 60))}${
      nft.prompt.length > 60 ? "..." : ""
    }</div>
          <div style="
            color: color-mix(in srgb, var(--palette-text, #ffffff) 65%, transparent);
            font-size: 11px;
            display: flex;
            gap: 8px;
            align-items: center;
          ">
            <span style="color: var(--palette-primary, #00d4ff);">${escapeHtml(nft.model)}</span>
            <span style="color: color-mix(in srgb, var(--palette-text, #ffffff) 50%, transparent);">•</span>
            <span>${date}</span>
          </div>
        </div>
        <a href="${escapeHtml(nft.url)}" target="_blank" style="
          background: color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent);
          border: 1px solid color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent);
          border-radius: 6px;
          padding: 6px 12px;
          color: var(--palette-primary, #00d4ff);
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s ease;
        "
        onmouseover="this.style.background='color-mix(in srgb, var(--palette-primary, #00d4ff) 30%, transparent)'; this.style.borderColor='var(--palette-primary, #00d4ff)';"
        onmouseout="this.style.background='color-mix(in srgb, var(--palette-primary, #00d4ff) 20%, transparent)'; this.style.borderColor='color-mix(in srgb, var(--palette-primary, #00d4ff) 40%, transparent)';"
        >👁️ View</a>
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
  const helpLines = [
    "═ CHAINGPT AI NFT GENERATOR ═",
    "",
    "nftgen init",
    "Initialize with default API key",
    "",
    "nftgen init <api-key>",
    "Initialize with your API key",
    "",
    "nftgen generate <prompt>",
    "Generate NFT artwork",
    "",
    "nftgen enhance <prompt>",
    "Enhance prompt (coming soon)",
    "",
    "nftgen models",
    "Show available models",
    "",
    "nftgen styles",
    "Show available styles",
    "",
    "nftgen gallery",
    "View generated NFTs",
    "",
    "nftgen test",
    "Test API connection",
    "",
    "nftgen help",
    "Show this help message",
    "",
    "→ Options:",
    "",
    "--model <model>",
    "AI model (velogen, Dale3, etc.)",
    "",
    "--style <style>",
    "Art style (anime, cinematic, etc.)",
    "",
    "--size <width>x<height>",
    "Image size (e.g., 512x512, 1024x1024)",
    "",
    "--enhance",
    "Enhance prompt automatically",
    "",
    "→ Examples:",
    "",
    "nftgen generate cyberpunk cat with neon lights",
    "nftgen generate --model Dale3 futuristic cityscape",
    "nftgen generate --style anime warrior princess",
    "nftgen generate --size 1024x1024 dragon in space",
    "",
    "→ Credits:",
    "",
    "Standard models: 1.0 credit per image",
    "Dale3 (DALL-E 3): 4.75 credits per image",
    "",
    "→ Gallery:",
    "",
    "Generated NFTs are automatically saved",
    "View your collection: nftgen gallery",
    "Last 50 NFTs are stored locally",
  ];

  let helpHtml = `
    <div style="
      font-family: 'Courier New', monospace;
      line-height: 1.8;
      color: var(--palette-text, #e0e0e0);
      padding: 10px;
    ">
      <div style="
        font-size: 18px;
        font-weight: bold;
        color: var(--palette-primary, #00d4ff);
        margin-bottom: 20px;
        text-align: center;
        padding: 12px;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 255, 136, 0.1));
        border: 1px solid var(--palette-primary, #00d4ff);
        border-radius: 6px;
        text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
      ">
        ═ CHAINGPT AI NFT GENERATOR ═
      </div>
      <div style="padding: 10px;">
  `;

  helpLines.forEach((line) => {
    const trimmed = line.trim();
    const isCommand = trimmed && !trimmed.startsWith("→") && !trimmed.startsWith("═") && 
                      !trimmed.startsWith("--") && trimmed.length > 0 && trimmed.length < 60 && 
                      !trimmed.includes(":") && !trimmed.startsWith("•") &&
                      (trimmed.includes("nftgen ") || trimmed.match(/^[a-z-]+$/));

    if (isCommand) {
      const escapedCommand = line.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      helpHtml += `
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
            title="Click to add '${escapedCommand}' to terminal input"
          >
            ${line}
          </div>
        </div>
      `;
    } else if (trimmed.startsWith("→")) {
      helpHtml += `
        <div style="
          font-size: 14px;
          font-weight: bold;
          color: var(--palette-primary, #00d4ff);
          margin: 15px 0 8px 0;
          padding: 8px;
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.05));
          border-left: 4px solid var(--palette-primary, #00d4ff);
          border-radius: 4px;
        ">${line}</div>
      `;
    } else if (trimmed) {
      helpHtml += `
        <div style="
          color: var(--palette-text, #ccd4e0);
          margin: 6px 0;
          padding-left: 0;
          font-size: 0.95em;
          line-height: 1.6;
        ">${escapeHtml(line)}</div>
      `;
    } else {
      helpHtml += `<div style="margin: 8px 0;"></div>`;
    }
  });

  helpHtml += `
        </div>
        <div style="
          margin-top: 20px;
          padding: 12px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid var(--palette-border, rgba(0, 212, 255, 0.3));
          border-radius: 6px;
          font-size: 12px;
          color: var(--palette-text, #ccd4e0);
        ">
          <span style="color: var(--palette-primary, #00d4ff);">🔗</span>
          <span style="margin-left: 8px;">Get API key: https://api.chaingpt.org</span>
        </div>
      </div>
    </div>
  `;

  context.logHtml(helpHtml);
}

/**
 * Main nftgen command handler
 */
export const nftgenCommand: Command = {
  name: "nftgen",
  aliases: ["nft", "chaingpt-nft"],
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
