import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const SUBSCRIPTION_PRICES: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  scale: process.env.STRIPE_PRICE_SCALE,
};

const ONE_TIME_PRICES: Record<string, string | undefined> = {
  landing: process.env.STRIPE_PRICE_LANDING,
  mvp: process.env.STRIPE_PRICE_MVP,
  mobile: process.env.STRIPE_PRICE_MOBILE,
  fullProduct: process.env.STRIPE_PRICE_FULL_PRODUCT,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const tier = body.tier as string;

    const isSubscription = tier in SUBSCRIPTION_PRICES;
    const isOneTime = tier in ONE_TIME_PRICES;
    const priceId = isSubscription ? SUBSCRIPTION_PRICES[tier] : ONE_TIME_PRICES[tier];

    if (!priceId || (!isSubscription && !isOneTime)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const origin = req.headers.get("origin") || "https://nova.vandy.ro";

    if (isSubscription) {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/en/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/en/pricing?checkout=cancelled`,
        subscription_data: {
          metadata: { supabase_user_id: user.id, tier },
        },
        metadata: { supabase_user_id: user.id, tier },
      });
      return NextResponse.json({ url: session.url });
    } else {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/en/dashboard?checkout=success&type=order&package=${tier}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/en/pricing?checkout=cancelled`,
        metadata: { supabase_user_id: user.id, tier, type: "done-for-you" },
        invoice_creation: { enabled: true },
      });
      return NextResponse.json({ url: session.url });
    }
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
