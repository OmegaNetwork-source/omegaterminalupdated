/**
 * ChainGPT Chat Commands Module
 * Migrated from js/commands/chaingpt-chat.js to TypeScript
 *
 * ChainGPT Web3 AI Chatbot with streaming support:
 * - chat init: Initialize with API key
 * - chat ask: Ask question (blob response)
 * - chat stream: Ask question (streaming response)
 * - chat context: Chat with custom context
 * - chat history: Chat with conversation history
 * - chat test: Test API connection
 * - chat help: Show help and examples
 */

import type { Command, CommandContext } from "@/types/commands";
import { createCommandLine } from "./command-output-helpers";
import { chaingpt } from "@/lib/api";
import { escapeHtml } from "@/lib/utils";
import { config } from "@/lib/config";

/**
 * Handle chat initialization
 */
async function handleInit(
  context: CommandContext,
  args: string[]
): Promise<void> {
  const apiKey = args[2]; // Optional API key from user

  if (!apiKey) {
    // No API key provided - just show status
    context.log("📊 ChainGPT Status:", "info");
    context.log("", "output");
    
    const capabilities = await chaingpt.getCapabilities();
    const hasServerKey = capabilities.hasServerKey;
    const hasUserKey = !!chaingpt.getApiKey();
    
    if (hasUserKey) {
      const masked = chaingpt.getApiKey()?.length 
        ? `${chaingpt.getApiKey()!.slice(0, 8)}...${chaingpt.getApiKey()!.slice(-4)}`
        : "****";
      context.log(`✅ Using custom API key: ${masked}`, "success");
    } else if (hasServerKey) {
      context.log("✅ Using server API key (auto-configured)", "success");
    } else {
      context.log("⚠️ No API key configured", "info");
      context.log("", "output");
      context.log("💡 ChainGPT commands work automatically with server keys", "info");
      context.log("💡 To use your own key: chat init <api-key>", "info");
    }
    
    context.log("", "output");
    context.log("📖 Commands work immediately:", "info");
    context.log("   chat ask What is DeFi?", "output");
    context.log("   chat stream Explain blockchain", "output");
    return;
  }

  try {
    const result = await chaingpt.initialize(apiKey);

    if (result.success) {
      context.log("✅ ChainGPT initialized with custom API key!", "success");
      context.log("", "output");
      context.log(result.message || "Custom API key saved", "info");
      context.log("", "output");
      context.log("📖 Try a command:", "info");
      context.log("   chat ask What is DeFi?", "output");
    } else {
      context.log(`❌ Initialization failed: ${result.error}`, "error");
      context.log("", "output");
      context.log("💡 Commands will still work with server keys if available", "info");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Commands will still work with server keys if available", "info");
  }
}

/**
 * Handle chat ask (blob response)
 */
async function handleAsk(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Commands work immediately - no initialization check needed
  // Server-side API will use server keys automatically if available

  // Get question - skip 'chat' and 'ask' if present
  let questionParts = args.slice(1);
  if (questionParts[0] === "ask") {
    questionParts = questionParts.slice(1);
  }

  const question = questionParts.join(" ").trim();

  if (!question) {
    context.log("❌ Please provide a question", "error");
    context.log("", "output");
    const exampleHtml = createCommandLine("chat ask What is DeFi?", "Example question");
    context.logHtml(exampleHtml);
    return;
  }

  try {
    context.log(`🤖 Asking ChainGPT: "${question}"`, "info");
    context.log("⏳ Waiting for response...", "info");
    context.log("", "output");

    const response = await chaingpt.chatBlob({
      model: config.CHAINGPT.DEFAULT_MODEL,
      question: question,
      chatHistory: "off",
    });

    // Handle different response formats
    let botResponse = "";

    if (response.status && response.data && response.data.bot) {
      botResponse = response.data.bot;
    } else if (response.success && response.data && response.data.answer) {
      botResponse = response.data.answer;
    } else if (response.data && response.data.bot) {
      botResponse = response.data.bot;
    } else if (response.data && response.data.answer) {
      botResponse = response.data.answer;
    } else if (response.answer) {
      botResponse = response.answer;
    } else if (response.bot) {
      botResponse = response.bot;
    } else if (typeof response === "string") {
      botResponse = response;
    } else {
      // Log the actual response structure for debugging
      console.error("[DEBUG] Unknown response format. Response structure:", JSON.stringify(response, null, 2));
      throw new Error(`Unknown response format. Received: ${JSON.stringify(response).substring(0, 200)}`);
    }

    // Display response with uniform styling
    const { createChainGPTResponseCard } = await import("./chaingpt-styling");
    const html = createChainGPTResponseCard(botResponse, "ChainGPT AI Response", undefined, undefined, "0.5");
    context.logHtml(html);
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    const errorStr = errorMsg.toLowerCase();
    
    // Check if it's an API key/configuration error
    if (errorStr.includes("key") || errorStr.includes("api") || 
        errorStr.includes("401") || errorStr.includes("403") ||
        errorStr.includes("not configured") || errorStr.includes("503")) {
      context.log(`❌ API Configuration Error`, "error");
      context.log("", "output");
      context.log("💡 ChainGPT requires an API key to work:", "info");
      context.log("", "output");
      context.log("Option 1: Use your own API key (recommended):", "output");
      context.log("   chat init <your-api-key>", "info");
      context.log("   Get one at: https://api.chaingpt.org", "output");
      context.log("", "output");
      context.log("Option 2: Server keys may be configured by admin", "output");
      context.log("   Contact the administrator if server keys are expected", "info");
    } else if (errorMsg.includes("Unknown response format")) {
      context.log(`❌ Error: ${errorMsg}`, "error");
      context.log("", "output");
      context.log("💡 The API returned an unexpected response format", "info");
      context.log("💡 This might be a temporary API issue", "info");
      context.log("💡 Try again in a moment or check: chat test", "info");
    } else {
      context.log(`❌ Error: ${errorMsg}`, "error");
      context.log("", "output");
      context.log("💡 Try again or check: chat test", "info");
    }
  }
}

/**
 * Handle chat stream (streaming response)
 */
async function handleStream(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Commands work immediately - no initialization check needed
  // Server-side API will use server keys automatically if available

  // Get question - skip 'chat' and 'stream' if present
  let questionParts = args.slice(1);
  if (questionParts[0] === "stream") {
    questionParts = questionParts.slice(1);
  }

  const question = questionParts.join(" ").trim();

  if (!question) {
    context.log("❌ Please provide a question", "error");
    context.log("", "output");
    const exampleHtml = createCommandLine("chat stream Explain blockchain technology", "Example streaming question");
    context.logHtml(exampleHtml);
    return;
  }

  try {
    context.log(`🤖 Streaming from ChainGPT: "${question}"`, "info");
    context.log("📡 Receiving response...", "info");
    context.log("", "output");

    const reader = await chaingpt.chatStream({
      model: config.CHAINGPT.DEFAULT_MODEL,
      question: question,
      chatHistory: "off",
    });

    const decoder = new TextDecoder();
    let fullResponse = "";
    let pending = "";
    let parseBuffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Flush any remaining pending text
        if (pending) {
          const result = chaingpt.parseStreamChunk(pending, parseBuffer);
          if (result.content) {
            context.log(result.content, "output");
            fullResponse += result.content;
          }
        }
        break;
      }

      // Decode chunk with stream flag to handle multi-byte characters
      const chunk = decoder.decode(value, { stream: true });
      pending += chunk;

      // Process complete lines only
      const lines = pending.split("\n");
      pending = lines.pop() || "";

      for (const line of lines) {
        const result = chaingpt.parseStreamChunk(line + "\n", parseBuffer);
        parseBuffer = result.buffer;

        if (result.content) {
          // Log chunk immediately for progressive display
          context.log(result.content, "output");
          fullResponse += result.content;
        }
      }
    }

    context.log("", "output");
    context.log("✅ Streaming complete!", "success");
    context.log("💳 Credits used: ~0.5", "info");
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Streaming requires modern browser", "output");
    context.log("   • Try non-streaming mode: chat ask", "output");
    context.log("   • Check API key: chat test", "output");
  }
}

/**
 * Handle chat context (with custom context injection)
 */
async function handleContext(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Commands work immediately - no initialization check needed
  // Server-side API will use server keys automatically if available

  // Get question - skip 'chat' and 'context' if present
  let questionParts = args.slice(1);
  if (questionParts[0] === "context") {
    questionParts = questionParts.slice(1);
  }

  const question = questionParts.join(" ").trim();

  if (!question) {
    context.log("❌ Please provide a question", "error");
    context.log("", "output");
    const exampleHtml = createCommandLine("chat context How do I use this terminal?", "Example context question");
    context.logHtml(exampleHtml);
    return;
  }

  try {
    context.log(`🤖 Asking with Omega Terminal context...`, "info");
    context.log("⏳ Waiting for response...", "info");
    context.log("", "output");

    const response = await chaingpt.chatBlob({
      model: config.CHAINGPT.DEFAULT_MODEL,
      question: question,
      chatHistory: "off",
      useCustomContext: true,
      contextInjection: {
        companyName: "Omega Terminal",
        companyDescription:
          "A Web3 terminal with AI-powered tools for blockchain development",
        aiTone: "PRE_SET_TONE",
        selectedTone: "FRIENDLY",
      },
    });

    // Handle response
    let botResponse = "";

    if (response.status && response.data && response.data.bot) {
      botResponse = response.data.bot;
    } else if (response.data && response.data.bot) {
      botResponse = response.data.bot;
    } else if (response.data && response.data.answer) {
      botResponse = response.data.answer;
    } else if (response.answer) {
      botResponse = response.answer;
    } else if (response.bot) {
      botResponse = response.bot;
    } else if (typeof response === "string") {
      botResponse = response;
    } else {
      // Log the actual response structure for debugging
      console.error("[DEBUG] Unknown response format. Response structure:", JSON.stringify(response, null, 2));
      throw new Error(`Unknown response format. Received: ${JSON.stringify(response).substring(0, 200)}`);
    }

    // Display response with uniform context styling
    const { createContextResponseCard } = await import("./chaingpt-styling");
    const html = createContextResponseCard(botResponse, "0.5");
    context.logHtml(html);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Handle chat history (conversation with memory)
 */
async function handleHistory(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Commands work immediately - no initialization check needed
  // Server-side API will use server keys automatically if available

  // Get question - skip 'chat' and 'history' if present
  let questionParts = args.slice(1);
  if (questionParts[0] === "history") {
    questionParts = questionParts.slice(1);
  }

  const question = questionParts.join(" ").trim();

  if (!question) {
    context.log("❌ Please provide a question", "error");
    context.log("", "output");
    const exampleHtml = createCommandLine("chat history What did we talk about before?", "Example history question");
    context.logHtml(exampleHtml);
    return;
  }

  try {
    context.log(`🤖 Asking with conversation history...`, "info");
    context.log("⏳ Waiting for response...", "info");
    context.log("", "output");

    // Use fixed session ID for this user
    const sessionId = "omega-terminal-user";

    const response = await chaingpt.chatBlob({
      model: config.CHAINGPT.DEFAULT_MODEL,
      question: question,
      chatHistory: "on",
      sdkUniqueId: sessionId,
    });

    // Handle response
    let botResponse = "";

    if (response.status && response.data && response.data.bot) {
      botResponse = response.data.bot;
    } else if (response.data && response.data.bot) {
      botResponse = response.data.bot;
    } else if (response.data && response.data.answer) {
      botResponse = response.data.answer;
    } else if (response.answer) {
      botResponse = response.answer;
    } else if (response.bot) {
      botResponse = response.bot;
    } else if (typeof response === "string") {
      botResponse = response;
    } else {
      // Log the actual response structure for debugging
      console.error("[DEBUG] Unknown response format. Response structure:", JSON.stringify(response, null, 2));
      throw new Error(`Unknown response format. Received: ${JSON.stringify(response).substring(0, 200)}`);
    }

    // Display response with uniform memory styling
    const { createMemoryResponseCard } = await import("./chaingpt-styling");
    const html = createMemoryResponseCard(botResponse, "1.0 (history enabled)");
    context.logHtml(html);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Handle chat test
 */
async function handleTest(
  context: CommandContext,
  args: string[]
): Promise<void> {
  context.log("🔬 Testing ChainGPT connection...", "info");
  context.log("", "output");

  // Check initialization
  const initialized = chaingpt.isInitialized();
  context.log(`📊 Initialized: ${initialized ? "✅ Yes" : "❌ No"}`, "output");

  const capabilities = await chaingpt.getCapabilities();
  context.log(
    `🛡️ Server key: ${capabilities.hasServerKey ? "Present" : "Missing"}`,
    "output"
  );

  if (!initialized && !capabilities.hasServerKey) {
    context.log("", "output");
    context.log("💡 Initialize first:", "info");
    context.log(
      "   chat init              (use server key if available)",
      "output"
    );
    context.log("   chat init <api-key>    (use your own key)", "output");
    return;
  }

  const apiKey = chaingpt.getApiKey();
  if (apiKey) {
    const masked =
      apiKey.length > 12
        ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
        : "****";
    context.log(`🔑 User API Key: ${masked}`, "output");
  }

  context.log("🌐 Proxy Endpoint: /api/chaingpt/chat", "output");
  context.log("", "output");

  // Try a test request
  try {
    context.log("🧪 Sending test request...", "info");

    const response = await chaingpt.chatBlob({
      model: config.CHAINGPT.DEFAULT_MODEL,
      question: "Hello! Are you working?",
      chatHistory: "off",
    });

    let testResponse = "";

    if (response.status && response.data && response.data.bot) {
      testResponse = response.data.bot;
    } else if (response.answer) {
      testResponse = response.answer;
    }

    context.log("", "output");
    context.log("✅ Test successful!", "success");
    context.log("", "output");
    context.log("📄 Test response:", "info");
    context.log(testResponse.substring(0, 150) + "...", "output");
    context.log("", "output");
    context.log("💳 Credits used: ~0.5", "info");
  } catch (error: any) {
    context.log("", "output");
    context.log(`❌ Test failed: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check your API key", "output");
    context.log("   • Try reinitializing: chat init", "output");
    context.log("   • Get new API key: https://api.chaingpt.org", "output");
  }
}

/**
 * Handle chat help
 */
function handleHelp(context: CommandContext, args: string[]): void {
  const helpLines = [
    "═ CHAINGPT WEB3 AI CHATBOT ═",
    "",
    "chat init",
    "Initialize with default API key",
    "",
    "chat init <api-key>",
    "Initialize with your API key",
    "",
    "chat ask <question>",
    "Ask a question (blob response)",
    "",
    "chat stream <question>",
    "Ask a question (streaming response)",
    "",
    "chat context <question>",
    "Ask with Omega Terminal context",
    "",
    "chat history <question>",
    "Ask with conversation history",
    "",
    "chat test",
    "Test API connection",
    "",
    "chat help",
    "Show this help message",
    "",
    "→ Examples:",
    "",
    "chat init",
    "chat ask What is DeFi?",
    "chat stream Explain blockchain",
    "",
    "→ Credits:",
    "",
    "Standard chat: ~0.5 credits",
    "Chat with history: ~1.0 credits",
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
        ═ CHAINGPT WEB3 AI CHATBOT ═
      </div>
      <div style="padding: 10px;">
  `;

  helpLines.forEach((line) => {
    const trimmed = line.trim();
    const isCommand = trimmed && !trimmed.startsWith("→") && !trimmed.startsWith("═") && 
                      trimmed.length > 0 && trimmed.length < 50 && 
                      !trimmed.includes(":") && !trimmed.startsWith("•") &&
                      (trimmed.includes("chat ") || trimmed.match(/^[a-z-]+$/));

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
 * Main chat command handler
 */
export const chatCommand: Command = {
  name: "chat",
  description: "ChainGPT Web3 AI Chatbot",
  usage: "chat <init|ask|stream|context|history|test|help> [params]",
  category: "ai",
  handler: async (context: CommandContext, args: string[]) => {
    const subcommand = args[1]?.toLowerCase();

    switch (subcommand) {
      case "init":
        await handleInit(context, args);
        break;

      case "ask":
        await handleAsk(context, args);
        break;

      case "stream":
        await handleStream(context, args);
        break;

      case "context":
        await handleContext(context, args);
        break;

      case "history":
        await handleHistory(context, args);
        break;

      case "test":
        await handleTest(context, args);
        break;

      case "help":
      case undefined:
        handleHelp(context, args);
        break;

      default:
        // Treat as a question (default to 'ask' mode)
        await handleAsk(context, args);
        break;
    }
  },
};

/**
 * Export array of chat commands
 */
export const chatCommands: Command[] = [chatCommand];
