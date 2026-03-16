import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  orderConfirmationEmail,
  orderNotificationEmail,
} from "@/lib/email/templates";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const supabaseAdmin =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
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

    const body = await req.json();
    const name = (body.name || "").trim().slice(0, 200);
    const description = (body.description || "").trim().slice(0, 5000);
    const references = (body.references || "").trim().slice(0, 2000) || null;
    const packageType = body.package || null;
    const stripeSessionId = body.stripeSessionId || null;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    let projectId: string | null = null;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .insert({
          user_id: user.id,
          name,
          description,
          references_links: references,
          package: packageType,
          stripe_session_id: stripeSessionId,
          status: "pending_review",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to save project:", error.message);
      } else {
        projectId = data.id;
      }
    }

    const origin = req.headers.get("origin") || "https://nova.vandy.ro";
    const dashboardUrl = `${origin}/en/dashboard`;
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    const userName = profile?.full_name || null;

    if (resend) {
      const fromAddr =
        process.env.NOVA_REPORTS_FROM_EMAIL ||
        "NOVA <no-reply@nova.vandy.ro>";

      await Promise.allSettled([
        resend.emails.send({
          from: fromAddr,
          to: user.email!,
          subject: `Your project "${name}" has been received — NOVA`,
          html: orderConfirmationEmail(userName, name, dashboardUrl),
        }),
        resend.emails.send({
          from: fromAddr,
          to: process.env.NOVA_REPORTS_EMAIL || "founders@nova.vandy.ro",
          subject: `New Order: ${name} — ${user.email}`,
          html: orderNotificationEmail(
            userName,
            user.email!,
            name,
            description,
            references,
            packageType,
            stripeSessionId
          ),
        }),
      ]);
    }

    return NextResponse.json({ ok: true, projectId });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}
