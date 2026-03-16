import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TIER_LIMITS: Record<string, { messages: number; builds: number }> = {
  starter: { messages: 100, builds: 0 },
  pro: { messages: 500, builds: 1 },
  scale: { messages: 2000, builds: 3 },
  free: { messages: 10, builds: 0 },
};

async function updateSubscription(
  userId: string,
  tier: string,
  stripeSubscriptionId: string,
  stripePriceId: string,
  status: string,
  periodStart: Date,
  periodEnd: Date
) {
  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_price_id: stripePriceId,
      status,
      tier,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
    },
    { onConflict: "user_id" }
  );

  await supabaseAdmin
    .from("profiles")
    .update({ tier })
    .eq("id", userId);

  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  await supabaseAdmin.from("usage").upsert(
    {
      user_id: userId,
      period_start: monthStart.toISOString().split("T")[0],
      period_end: monthEnd.toISOString().split("T")[0],
      messages_limit: limits.messages,
      builds_limit: limits.builds,
      tier,
    },
    { onConflict: "user_id,period_start" }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const tier = session.metadata?.tier;
        const subscriptionId = session.subscription as string;

        if (!userId || !tier || !subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await supabaseAdmin
          .from("profiles")
          .update({ stripe_customer_id: session.customer as string })
          .eq("id", userId);

        await updateSubscription(
          userId,
          tier,
          subscriptionId,
          subscription.items.data[0].price.id,
          subscription.status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000)
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        const tier = subscription.metadata?.tier || "free";

        if (!userId) break;

        await updateSubscription(
          userId,
          subscription.status === "active" ? tier : "free",
          subscription.id,
          subscription.items.data[0].price.id,
          subscription.status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000)
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) break;

        await supabaseAdmin
          .from("profiles")
          .update({ tier: "free" })
          .eq("id", userId);

        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled", tier: "free" })
          .eq("stripe_subscription_id", subscription.id);

        const limits = TIER_LIMITS.free;
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        await supabaseAdmin
          .from("usage")
          .update({
            messages_limit: limits.messages,
            builds_limit: limits.builds,
            tier: "free",
          })
          .eq("user_id", userId)
          .eq("period_start", monthStart.toISOString().split("T")[0]);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
