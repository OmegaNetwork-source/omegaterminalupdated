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

  try {
    const result = await chaingpt.initialize(apiKey);

    if (result.success) {
      context.log("✅ ChainGPT initialized successfully!", "success");
      context.log("", "output");

      if (result.message) {
        context.log(result.message, "info");
      }

      context.log("", "output");
      context.log("📖 NEXT STEPS:", "info");
      context.log("", "output");
      context.log("1. Try asking a question:", "output");
      context.log("   chat ask What is DeFi?", "info");
      context.log("", "output");
      context.log("2. Try streaming mode:", "output");
      context.log("   chat stream Explain blockchain technology", "info");
      context.log("", "output");
      context.log("3. Get help:", "output");
      context.log("   chat help", "info");
    } else {
      context.log(`❌ Initialization failed: ${result.error}`, "error");
    }
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Handle chat ask (blob response)
 */
async function handleAsk(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Check initialization
  if (!chaingpt.isInitialized()) {
    context.log("❌ ChainGPT not initialized", "error");
    context.log("", "output");
    context.log("💡 Initialize first:", "info");
    context.log("   chat init              (use default key)", "output");
    context.log("   chat init <api-key>    (use your own key)", "output");
    return;
  }

  // Get question - skip 'chat' and 'ask' if present
  let questionParts = args.slice(1);
  if (questionParts[0] === "ask") {
    questionParts = questionParts.slice(1);
  }

  const question = questionParts.join(" ").trim();

  if (!question) {
    context.log("❌ Please provide a question", "error");
    context.log("", "output");
    context.log("💡 Example:", "info");
    context.log("   chat ask What is DeFi?", "output");
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
    } else if (response.answer) {
      botResponse = response.answer;
    } else if (typeof response === "string") {
      botResponse = response;
    } else {
      throw new Error("Unknown response format");
    }

    // Display response with styled HTML card
    const html = `
      <div style="
        background: linear-gradient(135deg, rgba(0, 188, 242, 0.1), rgba(0, 255, 136, 0.1));
        border: 1px solid rgba(0, 188, 242, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
        max-width: 100%;
      ">
        <div style="
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;
        ">
          <div style="
            font-size: 32px;
            line-height: 1;
          ">🤖</div>
          <div style="
            font-size: 18px;
            font-weight: 600;
            color: #00bcf2;
          ">ChainGPT AI Response</div>
        </div>
        <div style="
          color: #ffffff;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        ">${escapeHtml(botResponse)}</div>
        <div style="
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 188, 242, 0.2);
          font-size: 12px;
          color: #888888;
        ">
          <span style="color: #00bcf2;">💳</span> Credits used: ~0.5
        </div>
      </div>
    `;

    context.logHtml(html);
  } catch (error: any) {
    context.log(`❌ Error: ${error.message}`, "error");
    context.log("", "output");
    context.log("💡 Troubleshooting:", "info");
    context.log("   • Check your API key: chat test", "output");
    context.log("   • Try reinitializing: chat init", "output");
    context.log("   • Get help: chat help", "output");
  }
}

/**
 * Handle chat stream (streaming response)
 */
async function handleStream(
  context: CommandContext,
  args: string[]
): Promise<void> {
  // Check initialization
  if (!chaingpt.isInitialized()) {
    context.log("❌ ChainGPT not initialized", "error");
    context.log("", "output");
    context.log("💡 Initialize first:", "info");
    context.log("   chat init              (use default key)", "output");
    context.log("   chat init <api-key>    (use your own key)", "output");
    return;
  }

  // Get question - skip 'chat' and 'stream' if present
  let questionParts = args.slice(1);
  if (questionParts[0] === "stream") {
    questionParts = questionParts.slice(1);
  }

  const question = questionParts.join(" ").trim();

  if (!question) {
    context.log("❌ Please provide a question", "error");
    context.log("", "output");
    context.log("💡 Example:", "info");
    context.log("   chat stream Explain blockchain technology", "output");
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
  // Check initialization
  if (!chaingpt.isInitialized()) {
    context.log("❌ ChainGPT not initialized", "error");
    context.log("", "output");
    context.log("💡 Initialize first: chat init", "info");
    return;
  }

  // Get question - skip 'chat' and 'context' if present
  let questionParts = args.slice(1);
  if (questionParts[0] === "context") {
    questionParts = questionParts.slice(1);
  }

  const question = questionParts.join(" ").trim();

  if (!question) {
    context.log("❌ Please provide a question", "error");
    context.log("", "output");
    context.log("💡 Example:", "info");
    context.log("   chat context How do I use this terminal?", "output");
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
    } else if (response.answer) {
      botResponse = response.answer;
    } else {
      throw new Error("Unknown response format");
    }

    // Display response with yellow/gold themed card
    const html = `
      <div style="
        background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1));
        border: 1px solid rgba(255, 193, 7, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
        max-width: 100%;
      ">
        <div style="
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;
        ">
          <div style="
            font-size: 32px;
            line-height: 1;
          ">🎯</div>
          <div style="
            font-size: 18px;
            font-weight: 600;
            color: #ffc107;
          ">ChainGPT (Omega Terminal Context)</div>
        </div>
        <div style="
          color: #ffffff;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        ">${escapeHtml(botResponse)}</div>
        <div style="
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 193, 7, 0.2);
          font-size: 12px;
          color: #888888;
        ">
          <span style="color: #ffc107;">💳</span> Credits used: ~0.5
        </div>
      </div>
    `;

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
  // Check initialization
  if (!chaingpt.isInitialized()) {
    context.log("❌ ChainGPT not initialized", "error");
    context.log("", "output");
    context.log("💡 Initialize first: chat init", "info");
    return;
  }

  // Get question - skip 'chat' and 'history' if present
  let questionParts = args.slice(1);
  if (questionParts[0] === "history") {
    questionParts = questionParts.slice(1);
  }

  const question = questionParts.join(" ").trim();

  if (!question) {
    context.log("❌ Please provide a question", "error");
    context.log("", "output");
    context.log("💡 Example:", "info");
    context.log("   chat history What did we talk about before?", "output");
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
    } else if (response.answer) {
      botResponse = response.answer;
    } else {
      throw new Error("Unknown response format");
    }

    // Display response with green themed card (memory active)
    const html = `
      <div style="
        background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 188, 242, 0.1));
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
        max-width: 100%;
      ">
        <div style="
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;
        ">
          <div style="
            font-size: 32px;
            line-height: 1;
          ">🧠</div>
          <div style="
            font-size: 18px;
            font-weight: 600;
            color: #00ff88;
          ">ChainGPT (Memory Active)</div>
        </div>
        <div style="
          color: #ffffff;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        ">${escapeHtml(botResponse)}</div>
        <div style="
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 255, 136, 0.2);
          font-size: 12px;
          color: #888888;
        ">
          <span style="color: #00ff88;">💳</span> Credits used: ~1.0 (history enabled)
        </div>
      </div>
    `;

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
  context.log("", "output");
  context.log("🤖 CHAINGPT WEB3 AI CHATBOT", "info");
  context.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "output");
  context.log("", "output");

  context.log("📋 SETUP & CONFIGURATION", "info");
  context.log("", "output");
  context.log(
    "  chat init                Initialize with default API key",
    "output"
  );
  context.log(
    "  chat init <api-key>      Initialize with your API key",
    "output"
  );
  context.log("  chat test                Test API connection", "output");
  context.log("", "output");

  context.log("💬 CHAT COMMANDS", "info");
  context.log("", "output");
  context.log(
    "  chat ask <question>      Ask a question (blob response)",
    "output"
  );
  context.log(
    "  chat stream <question>   Ask a question (streaming response)",
    "output"
  );
  context.log(
    "  chat context <question>  Ask with Omega Terminal context",
    "output"
  );
  context.log(
    "  chat history <question>  Ask with conversation history",
    "output"
  );
  context.log("  chat help                Show this help message", "output");
  context.log("", "output");

  context.log("📚 EXAMPLES", "info");
  context.log("", "output");
  context.log("  # Initialize with default key", "output");
  context.log("  chat init", "info");
  context.log("", "output");
  context.log("  # Ask a question", "output");
  context.log("  chat ask What is DeFi?", "info");
  context.log("", "output");
  context.log("  # Stream a response", "output");
  context.log("  chat stream Explain blockchain technology", "info");
  context.log("", "output");
  context.log("  # Ask with custom context", "output");
  context.log("  chat context How do I use Omega Terminal?", "info");
  context.log("", "output");
  context.log("  # Ask with conversation history", "output");
  context.log("  chat history What did we discuss earlier?", "info");
  context.log("", "output");

  context.log("💳 CREDITS", "info");
  context.log("", "output");
  context.log("  • Standard chat: ~0.5 credits per request", "output");
  context.log("  • Chat with history: ~1.0 credits per request", "output");
  context.log("", "output");

  context.log("🔗 RESOURCES", "info");
  context.log("", "output");
  context.log("  • Get API key: https://api.chaingpt.org", "output");
  context.log("  • Documentation: https://docs.chaingpt.org", "output");
  context.log("  • Support: https://chaingpt.org", "output");
  context.log("", "output");
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
