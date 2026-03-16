import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { NOVA_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { rateLimiter, getClientIdentifier } from "@/lib/security/rate-limiter";

export const runtime = "nodejs";

// Rate limiting configuration - set generously to not affect normal users
// These limits prevent abuse while allowing natural conversation flow
const RATE_LIMITS = [
  { limit: 30, windowMs: 60 * 1000 }, // 30 requests per minute (1 every 2 seconds - very generous)
  { limit: 150, windowMs: 60 * 60 * 1000 }, // 150 requests per hour (plenty for discovery conversation)
  { limit: 1000, windowMs: 24 * 60 * 60 * 1000 }, // 1000 requests per day (very generous)
];

// Maximum message length
const MAX_MESSAGE_LENGTH = 2000; // Very generous - normal messages are 50-200 chars
const MAX_MESSAGES_PER_REQUEST = 30;
const MAX_TOTAL_MESSAGES = 60; // Increased for longer discovery conversations (normal: 10-20 messages)

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(req);
    const rateLimitResult = rateLimiter.checkMultiple(clientId, RATE_LIMITS);

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          type: "error",
          message: "Rate limit exceeded. Please wait before sending another message.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toISOString(),
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();
    const history = body.messages ?? [];
    const locale = body.locale || "en";

    // Validate input structure
    if (!Array.isArray(history)) {
      return new Response(
        JSON.stringify({ type: "error", message: "Invalid request format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Limit number of messages per request
    if (history.length > MAX_MESSAGES_PER_REQUEST) {
      return new Response(
        JSON.stringify({ type: "error", message: "Too many messages in request" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
    const sanitizeContent = (content: string): string => {
      if (typeof content !== "string") return "";
      
      // Limit message length
      if (content.length > MAX_MESSAGE_LENGTH) {
        content = content.slice(0, MAX_MESSAGE_LENGTH);
      }

      // Remove potential XSS vectors
      return content
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/data:text\/html/gi, "")
        .trim();
    };

    const claudeMessages = history
      .filter((m: any) => {
        // Validate message structure
        if (!m || typeof m !== "object") return false;
        if (m.role !== "user" && m.role !== "assistant") return false;
        if (typeof m.content !== "string") return false;
        if (m.content.length === 0 || m.content.length > MAX_MESSAGE_LENGTH) return false;
        return true;
      })
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: sanitizeContent(m.content),
      }))
      .filter((m: { content: string }) => m.content.length > 0) // Remove empty messages
      .slice(-MAX_TOTAL_MESSAGES); // Limit to last N messages for performance and cost

    // Ensure we have at least one message
    if (claudeMessages.length === 0) {
      return new Response(
        JSON.stringify({ type: "error", message: "No valid messages provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Additional check: prevent automated scripts by checking for suspicious patterns
    const lastUserMessage = claudeMessages
      .filter((m) => m.role === "user")
      .pop()?.content || "";

    const suspiciousPatterns = [
      /(.)\1{20,}/,        // 20+ repeated characters (e.g., "aaaaaaaaaaaaaaaaaaaa")
      /\S{500,}/,          // Single word over 500 chars (no spaces)
      /^(.{1,5})\1{10,}$/, // Short pattern repeated 10+ times (e.g., "abcabcabcabc...")
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(lastUserMessage))) {
      return new Response(
        JSON.stringify({ type: "error", message: "Invalid message format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
        "X-RateLimit-Limit": "30",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toISOString(),
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
