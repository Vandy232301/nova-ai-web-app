import { NextRequest } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resendApiKey = process.env.RESEND_API_KEY;
const reportsEmail = process.env.NOVA_REPORTS_EMAIL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: NextRequest): Promise<Response> {
  try {
    if (!resend || !reportsEmail) {
      console.error("[NOVA REPORT] Missing RESEND_API_KEY or NOVA_REPORTS_EMAIL");
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Email reporting is not configured on the server.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { locale, messages, finalAssistantMessage } = body as {
      locale?: string;
      messages?: Array<{ role: string; content: string; createdAt?: number }>;
      finalAssistantMessage?: string;
    };

    const safeLocale = locale || "en";
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    const subject = `NOVA discovery report — ${dateStr} [${safeLocale}]`;

    const transcriptLines =
      messages?.map((m) => {
        const ts = m.createdAt ? new Date(m.createdAt).toISOString() : "";
        const role = m.role.toUpperCase();
        return `[${ts}] ${role}: ${m.content}`;
      }) ?? [];

    const text = [
      "NOVA — Product Discovery Session",
      "",
      `Locale: ${safeLocale}`,
      `Generated at: ${now.toISOString()}`,
      "",
      "=== Final Assistant Summary ===",
      finalAssistantMessage || "(none)",
      "",
      "=== Full Transcript ===",
      ...transcriptLines,
    ].join("\n");

    await resend.emails.send({
      from: process.env.NOVA_REPORTS_FROM_EMAIL || "NOVA Reports <no-reply@noreply.nova>",
      to: reportsEmail,
      subject,
      text,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[NOVA REPORT] Failed to send report:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Failed to send report email.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

