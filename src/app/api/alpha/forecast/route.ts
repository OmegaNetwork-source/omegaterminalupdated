import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

/**
 * AI Forecast API
 * Generates AI forecasts for prediction markets using existing AI services
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, marketQuestion, model = "default" } = body;

    if (!marketId && !marketQuestion) {
      return NextResponse.json(
        { error: "marketId or marketQuestion is required" },
        { status: 400 }
      );
    }

    // Try to use existing AI services
    // First, try ChainGPT via internal API route
    try {
      const prompt = `Analyze this prediction market and provide a forecast:
Market: ${marketQuestion || marketId}

Provide a JSON response with:
- probability: A number between 0 and 1
- confidence: A number between 0 and 1  
- rationale: A brief explanation

Be objective and data-driven.`;

      const chainGPTResponse = await fetch(
        `${request.nextUrl.origin}/api/chaingpt/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            model: config.CHAINGPT.DEFAULT_MODEL,
          }),
        }
      );

      if (chainGPTResponse.ok) {
        const data = await chainGPTResponse.json();
        // Try to parse JSON from response text
        let rationale = data.response || data.text || "AI forecast generated";
        let probability = 0.5;
        let confidence = 0.7;

        // Try to extract structured data from response
        try {
          const jsonMatch = rationale.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            probability = parsed.probability ?? probability;
            confidence = parsed.confidence ?? confidence;
            rationale = parsed.rationale || rationale;
          }
        } catch {
          // If parsing fails, use defaults
        }

        const forecast = {
          marketId: marketId || "unknown",
          probability,
          confidence,
          rationale,
          model: "chaingpt",
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json(forecast);
      }
    } catch (error) {
      console.error("[Forecast API] ChainGPT error:", error);
    }

    // Fallback: Try Gemini if available
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const prompt = `Analyze this prediction market and provide a forecast:
Market: ${marketQuestion || marketId}

Provide a JSON response with probability (0-1), confidence (0-1), and rationale.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const forecast = {
            marketId: marketId || "unknown",
            probability: 0.5,
            confidence: 0.7,
            rationale: data.candidates?.[0]?.content?.parts?.[0]?.text || "AI forecast generated",
            model: "gemini",
            timestamp: new Date().toISOString(),
          };

          return NextResponse.json(forecast);
        }
      } catch (error) {
        console.error("[Forecast API] Gemini error:", error);
      }
    }

    // Default response if no AI services available
    return NextResponse.json({
      marketId: marketId || "unknown",
      probability: 0.5,
      confidence: 0.5,
      rationale: "AI forecast service not configured. Please set CHAINGPT_API_KEY or GEMINI_API_KEY.",
      model: "default",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Forecast API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

