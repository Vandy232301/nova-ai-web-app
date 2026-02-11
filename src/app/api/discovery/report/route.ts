import { NextRequest } from "next/server";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import { PROPOSAL_GENERATION_PROMPT } from "@/lib/ai/proposal-prompt";

export const runtime = "nodejs";

// Initialize clients securely (keys never exposed to client)
const resendApiKey = process.env.RESEND_API_KEY;
const reportsEmail = process.env.NOVA_REPORTS_EMAIL;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

const resend = resendApiKey ? new Resend(resendApiKey) : null;
const anthropic = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null;

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Validate configuration (never expose which keys are missing)
    if (!resend || !reportsEmail) {
      if (process.env.NODE_ENV === "development") {
        console.error("[NOVA REPORT] Missing RESEND_API_KEY or NOVA_REPORTS_EMAIL");
      }
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Service temporarily unavailable",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    
    // Validate and sanitize input
    const { locale, messages, finalAssistantMessage, userEmail } = body as {
      locale?: string;
      messages?: Array<{ role: string; content: string; createdAt?: number }>;
      finalAssistantMessage?: string;
      userEmail?: string;
    };

    // Sanitize user email (basic validation)
    const sanitizedEmail = userEmail && typeof userEmail === "string" && userEmail.includes("@") 
      ? userEmail.trim().toLowerCase() 
      : undefined;

    const safeLocale = locale || "en";
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    // Build conversation context for proposal generation
    const transcriptLines =
      messages?.map((m) => {
        const role = m.role.toUpperCase();
        // Sanitize content (remove any potential script tags or malicious content)
        const sanitizedContent = m.content.replace(/<script[^>]*>.*?<\/script>/gi, "");
        return `${role}: ${sanitizedContent}`;
      }) ?? [];

    const conversationContext = [
      "=== DISCOVERY CONVERSATION TRANSCRIPT ===",
      ...transcriptLines,
      "",
      "=== PROJECT SUMMARY ===",
      finalAssistantMessage || "(none)",
    ].join("\n");

    // Generate comprehensive proposal document using Claude
    let proposalDocument = "";
    if (anthropic && conversationContext) {
      try {
        const proposalResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: PROPOSAL_GENERATION_PROMPT,
          messages: [
            {
              role: "user",
              content: `Generate a comprehensive technical proposal based on this discovery conversation:\n\n${conversationContext}`,
            },
          ],
        });

        const proposalText = proposalResponse.content.find((block) => block.type === "text");
        if (proposalText && proposalText.type === "text") {
          proposalDocument = proposalText.text;
        }
      } catch (proposalError) {
        // Never expose error details to client
        if (process.env.NODE_ENV === "development") {
          console.error("[NOVA REPORT] Failed to generate proposal:", proposalError);
        }
        proposalDocument = "Proposal generation failed. See transcript below.";
      }
    }

    // Prepare email content for NOVA team
    const teamEmailSubject = `NOVA Discovery Report + Technical Proposal — ${dateStr} [${safeLocale}]`;
    const teamEmailText = [
      "NOVA — Product Discovery Session Report",
      "",
      `Locale: ${safeLocale}`,
      `Generated at: ${now.toISOString()}`,
      sanitizedEmail ? `Client Email: ${sanitizedEmail}` : "Client Email: Not provided",
      "",
      "=".repeat(60),
      "TECHNICAL PROPOSAL DOCUMENT",
      "=".repeat(60),
      "",
      proposalDocument || "Proposal generation unavailable. See summary below.",
      "",
      "=".repeat(60),
      "PROJECT SUMMARY",
      "=".repeat(60),
      "",
      finalAssistantMessage || "(none)",
      "",
      "=".repeat(60),
      "FULL CONVERSATION TRANSCRIPT",
      "=".repeat(60),
      "",
      ...transcriptLines.map((line, i) => `[${i + 1}] ${line}`),
    ].join("\n");

    // Send email to NOVA team only (document will be presented during Discovery Call)
    await resend.emails.send({
      from: process.env.NOVA_REPORTS_FROM_EMAIL || "NOVA Reports <no-reply@noreply.nova>",
      to: reportsEmail,
      subject: teamEmailSubject,
      text: teamEmailText,
    });

    return new Response(JSON.stringify({ ok: true, proposalGenerated: !!proposalDocument }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    // Never expose error details to client
    if (process.env.NODE_ENV === "development") {
      console.error("[NOVA REPORT] Failed to send report:", error);
    }
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Service temporarily unavailable",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
