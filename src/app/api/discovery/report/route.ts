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
    const { locale, messages, finalAssistantMessage, userEmail, formData } = body as {
      locale?: string;
      messages?: Array<{ role: string; content: string; createdAt?: number }>;
      finalAssistantMessage?: string;
      userEmail?: string;
      formData?: {
        fullName?: string;
        email?: string;
        phone?: string;
        heardFrom?: string;
      };
    };

    // Validation functions
    const validateEmail = (email: string): boolean => {
      if (!email || typeof email !== "string") return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) && email.length <= 254 && email.length >= 3;
    };

    const validatePhone = (phone: string): boolean => {
      if (!phone || typeof phone !== "string") return false;
      // Remove all non-digit characters except + for international format
      const cleaned = phone.replace(/[^\d+]/g, "");
      // Valid phone: 7-15 digits (international format), can start with +
      const phoneRegex = /^\+?[1-9]\d{6,14}$/;
      return phoneRegex.test(cleaned) && cleaned.length >= 7 && cleaned.length <= 15;
    };

    const validateFullName = (name: string): boolean => {
      if (!name || typeof name !== "string") return false;
      // Name should be 2-100 characters, contain only letters, spaces, hyphens, apostrophes
      const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/;
      return nameRegex.test(name.trim());
    };

    const sanitizeInput = (input: string, maxLength: number = 500): string => {
      if (!input || typeof input !== "string") return "";
      // Remove potential XSS vectors and trim
      return input
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .trim()
        .slice(0, maxLength);
    };

    // Sanitize and validate form data
    let sanitizedFormData: {
      fullName?: string;
      email?: string;
      phone?: string;
      heardFrom?: string;
    } | undefined = undefined;

    if (formData) {
      const fullName = sanitizeInput(formData.fullName || "", 100);
      const email = sanitizeInput((formData.email || "").toLowerCase(), 254);
      const phone = sanitizeInput(formData.phone || "", 20);
      const heardFrom = sanitizeInput(formData.heardFrom || "", 100);

      // Validate all fields
      if (fullName && !validateFullName(fullName)) {
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid full name format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (email && !validateEmail(email)) {
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid email format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (phone && !validatePhone(phone)) {
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid phone format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      sanitizedFormData = {
        fullName: fullName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        heardFrom: heardFrom || undefined,
      };
    }

    // Sanitize user email (fallback to formData email)
    const emailToUse = userEmail || sanitizedFormData?.email;
    const sanitizedEmail = emailToUse && validateEmail(emailToUse)
      ? sanitizeInput(emailToUse.toLowerCase(), 254)
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
      "=".repeat(60),
      "CLIENT INFORMATION",
      "=".repeat(60),
      "",
      sanitizedFormData?.fullName ? `Full Name: ${sanitizedFormData.fullName}` : "Full Name: Not provided",
      sanitizedEmail ? `Email: ${sanitizedEmail}` : "Email: Not provided",
      sanitizedFormData?.phone ? `Phone: ${sanitizedFormData.phone}` : "Phone: Not provided",
      sanitizedFormData?.heardFrom ? `Heard From: ${sanitizedFormData.heardFrom}` : "Heard From: Not provided",
      "",
      `Locale: ${safeLocale}`,
      `Generated at: ${now.toISOString()}`,
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
