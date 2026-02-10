import { NextRequest } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resendApiKey = process.env.RESEND_API_KEY;
const reportsEmail = process.env.NOVA_REPORTS_EMAIL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    if (!resend || !reportsEmail) {
      console.error("[NOVA TEST EMAIL] Missing RESEND_API_KEY or NOVA_REPORTS_EMAIL");
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Email test is not configured. Check RESEND_API_KEY and NOVA_REPORTS_EMAIL.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    await resend.emails.send({
      from: process.env.NOVA_REPORTS_FROM_EMAIL || "NOVA Reports <no-reply@noreply.nova>",
      to: reportsEmail,
      subject: "NOVA — Test discovery report email",
      text: [
        "This is a TEST email from NOVA discovery system.",
        "",
        "If you see this, RESEND_API_KEY and NOVA_REPORTS_EMAIL are configured correctly.",
      ].join("\n"),
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[NOVA TEST EMAIL] Failed to send test email:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Failed to send test email.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

