import { NextRequest, NextResponse } from "next/server";
import { proxyChainGptJson } from "@/lib/server/chaingpt";
import { config } from "@/lib/config";

/**
 * Companion Chat API
 * Handles chat requests for the AI companion feature.
 * Supports ChainGPT (primary), OpenAI, and NEAR AI providers.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, provider = "chaingpt" } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Route to appropriate provider
    switch (provider) {
      case "chaingpt": {
        // Use ChainGPT via existing /api/chaingpt/chat endpoint
        try {
          // Call the existing ChainGPT chat API
          const baseUrl = request.nextUrl.origin;
          const chainGPTResponse = await fetch(`${baseUrl}/api/chaingpt/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Forward the ChainGPT API key header if present
              ...(request.headers.get("x-chaingpt-user-key") && {
                "x-chaingpt-user-key": request.headers.get("x-chaingpt-user-key")!,
              }),
            },
            body: JSON.stringify({
              question: message,
              model: config.CHAINGPT.DEFAULT_MODEL,
              chatHistory: "off", // Start fresh for companion chat
            }),
          });

          if (chainGPTResponse.ok) {
            const data = await chainGPTResponse.json();
            // Extract response from ChainGPT format
            const responseText = data.data?.bot || data.bot || data.response || data.message || "I'm sorry, I couldn't generate a response.";
            return NextResponse.json({
              response: responseText,
              provider: "chaingpt",
            });
          } else {
            const errorData = await chainGPTResponse.json().catch(() => ({ error: chainGPTResponse.statusText }));
            console.error("[Companion] ChainGPT API error:", errorData);
            throw new Error(errorData.error || `ChainGPT API error: ${chainGPTResponse.statusText}`);
          }
        } catch (error) {
          console.error("[Companion] ChainGPT error:", error);
          // Fall through to next provider
        }
        break;
      }

      case "openai": {
        // Use OpenAI API
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
          return NextResponse.json(
            { error: "OpenAI API key not configured" },
            { status: 503 }
          );
        }

        try {
          const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful AI companion. Be friendly, concise, and helpful.",
                },
                {
                  role: "user",
                  content: message,
                },
              ],
              max_tokens: 500,
              temperature: 0.7,
            }),
          });

          if (!openaiResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
          }

          const data = await openaiResponse.json();
          return NextResponse.json({
            response: data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
            provider: "openai",
          });
        } catch (error) {
          console.error("[Companion] OpenAI error:", error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : "OpenAI request failed" },
            { status: 500 }
          );
        }
      }

      case "near": {
        // Use NEAR AI (if available)
        // This would need to be implemented based on NEAR AI API
        // For now, return a placeholder
        return NextResponse.json(
          { error: "NEAR AI integration not yet implemented" },
          { status: 501 }
        );
      }

      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }

    // If we get here, ChainGPT failed and we should try fallback
    return NextResponse.json(
      { error: "All AI providers failed" },
      { status: 503 }
    );
  } catch (error) {
    console.error("[Companion] Chat API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

