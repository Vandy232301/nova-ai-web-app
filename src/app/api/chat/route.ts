import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { NOVA_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const history = body.messages ?? [];
    const locale = body.locale || "en";

    // Validate API key presence (never log the actual key)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (process.env.NODE_ENV === "development") {
      console.log("[NOVA API] API Key configured:", !!apiKey);
    }

    // If no API key, return error (don't expose configuration details)
    if (!apiKey) {
      if (process.env.NODE_ENV === "development") {
        console.error("[NOVA API] Missing ANTHROPIC_API_KEY");
      }
      return new Response(
        JSON.stringify({ type: "error", message: "Service temporarily unavailable" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Anthropic client with the API key (server-side only)
    const anthropic = new Anthropic({ apiKey });

    // Validate and sanitize message history
    const claudeMessages = history
      .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        // Basic XSS prevention - remove script tags
        content: m.content.replace(/<script[^>]*>.*?<\/script>/gi, ""),
      }))
      .slice(-20); // Limit to last 20 messages for performance and cost

    // Create streaming response from Claude
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: NOVA_SYSTEM_PROMPT,
      messages: claudeMessages,
    });

    // Convert Anthropic stream to our format
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const response = await stream.finalMessage();
          
          // Stream text chunks
          for (const block of response.content) {
            if (block.type === "text") {
              // Split into smaller chunks for smoother streaming feel
              const words = block.text.split(" ");
              let buffer = "";
              
              for (let i = 0; i < words.length; i++) {
                buffer += (i > 0 ? " " : "") + words[i];
                
                // Send every few words
                if (buffer.length > 20 || i === words.length - 1) {
                  const chunk = JSON.stringify({ type: "text", content: buffer }) + "\n";
                  controller.enqueue(new TextEncoder().encode(chunk));
                  buffer = "";
                }
              }

              // Send done with full message
              const doneChunk = JSON.stringify({
                type: "done",
                finalMessage: {
                  id: `assistant-${Date.now()}`,
                  role: "assistant",
                  content: block.text,
                  createdAt: Date.now(),
                },
              }) + "\n";
              controller.enqueue(new TextEncoder().encode(doneChunk));
            }
          }
          
          controller.close();
        } catch (error) {
          // Never expose error details to client
          if (process.env.NODE_ENV === "development") {
            console.error("Claude API error:", error);
          }
          const errorChunk = JSON.stringify({
            type: "error",
            message: "Service temporarily unavailable",
          }) + "\n";
          controller.enqueue(new TextEncoder().encode(errorChunk));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    // Never expose error details to client
    if (process.env.NODE_ENV === "development") {
      console.error("Request error:", error);
    }
    return new Response(
      JSON.stringify({ type: "error", message: "Service temporarily unavailable" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
