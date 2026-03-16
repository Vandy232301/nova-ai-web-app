import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { welcomeEmail } from "@/lib/email/templates";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase)
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!resend) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const origin = req.headers.get("origin") || "https://nova.vandy.ro";
    const dashboardUrl = `${origin}/en/dashboard`;
    const fromAddr =
      process.env.NOVA_REPORTS_FROM_EMAIL || "NOVA <no-reply@nova.vandy.ro>";

    await resend.emails.send({
      from: fromAddr,
      to: user.email!,
      subject: "Welcome to NOVA — Let's build something amazing",
      html: welcomeEmail(profile?.full_name || null, dashboardUrl),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ ok: true, error: "email_failed" });
  }
}
