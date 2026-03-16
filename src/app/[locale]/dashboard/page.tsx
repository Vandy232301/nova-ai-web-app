"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

interface UsageData {
  tier: string;
  messages_used: number;
  messages_limit: number;
  builds_used: number;
  builds_limit: number;
}

interface SubscriptionData {
  status: string;
  tier: string;
  current_period_end: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  package: string | null;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const periodStart = new Date();
        periodStart.setDate(1);
        const dateStr = periodStart.toISOString().split("T")[0];

        const [usageRes, subRes, projRes] = await Promise.all([
          supabase
            .from("usage")
            .select("*")
            .eq("user_id", user.id)
            .eq("period_start", dateStr)
            .single(),
          supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("projects")
            .select("id, name, description, package, status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        if (usageRes.data) {
          setUsage(usageRes.data as UsageData);
        }
        if (subRes.data) {
          setSubscription(subRes.data as SubscriptionData);
        }
        if (projRes.data) {
          setProjects(projRes.data as Project[]);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleManageBilling = useCallback(async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 404) {
        router.push("/pricing");
      }
    } catch {
      alert("Connection error");
    } finally {
      setPortalLoading(false);
    }
  }, [router]);

  const tier = usage?.tier || subscription?.tier || "free";
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  const messagesUsed = usage?.messages_used ?? 0;
  const messagesLimit = usage?.messages_limit ?? 10;
  const buildsUsed = usage?.builds_used ?? 0;
  const buildsLimit = usage?.builds_limit ?? 0;
  const messagesPercent = messagesLimit > 0 ? Math.min((messagesUsed / messagesLimit) * 100, 100) : 0;
  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  if (loading) {
    return (
      <main className="relative flex min-h-[100dvh] items-center justify-center bg-transparent">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-violet-400/50 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-violet-400/50 animate-pulse" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-violet-400/50 animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-transparent">
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between px-5 sm:px-10 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 sm:py-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Image src="/nova-logo-icon.png" alt="NOVA" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
          <span className="tracking-tight font-bold text-[17px] sm:text-[18px]">NOVA</span>
        </Link>
        <nav className="flex items-center gap-1.5">
          <Link href="/build" className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90">
            {tNav("build")}
          </Link>
          <Link href="/pricing" className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90">
            {tNav("pricing")}
          </Link>
          <button
            onClick={handleSignOut}
            className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/50 hover:text-white/70"
          >
            {t("signOut")}
          </button>
        </nav>
      </header>

      <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 pt-28 sm:pt-36 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[24px] sm:text-[36px] font-medium tracking-[-0.02em] text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-[14px] text-white/40 mb-10">
            {user?.email}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {/* Plan */}
            <div className="liquid-glass-card rounded-2xl px-5 py-5">
              <p className="text-[12px] text-white/40 uppercase tracking-wider mb-1">{t("plan")}</p>
              <p className="text-[20px] font-semibold text-white">{tierLabel}</p>
              {isActive && subscription?.current_period_end && (
                <p className="text-[11px] text-white/30 mt-1">
                  Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                {tier === "free" ? (
                  <Link href="/pricing" className="text-[12px] text-violet-400 hover:text-violet-300">
                    {t("upgradePlan")} &rarr;
                  </Link>
                ) : (
                  <button
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                    className="text-[12px] text-violet-400 hover:text-violet-300 disabled:opacity-50"
                  >
                    {portalLoading ? "..." : t("manageBilling") || "Manage billing"} &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="liquid-glass-card rounded-2xl px-5 py-5">
              <p className="text-[12px] text-white/40 uppercase tracking-wider mb-1">{t("messagesUsed")}</p>
              <p className="text-[20px] font-semibold text-white">{messagesUsed} / {messagesLimit}</p>
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    messagesPercent > 90 ? "bg-red-400" : messagesPercent > 70 ? "bg-amber-400" : "bg-violet-400"
                  }`}
                  style={{ width: `${messagesPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-white/30 mt-1.5">{t("usage")}</p>
            </div>

            {/* Builds */}
            <div className="liquid-glass-card rounded-2xl px-5 py-5">
              <p className="text-[12px] text-white/40 uppercase tracking-wider mb-1">{t("buildsUsed")}</p>
              <p className="text-[20px] font-semibold text-white">{buildsUsed} / {buildsLimit}</p>
              <p className="text-[12px] text-white/30 mt-2">{t("usage")}</p>
            </div>
          </div>

          {/* Checkout success message */}
          {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("checkout") === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass-card-accent rounded-2xl px-6 py-4 mb-8 text-center"
            >
              <p className="text-[14px] text-white">
                🎉 {t("checkoutSuccess") || "Subscription activated! Welcome aboard."}
              </p>
            </motion.div>
          )}

          {/* Projects */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-medium text-white">{t("projects")}</h2>
              <div className="flex gap-2">
                <Link
                  href="/build"
                  className="liquid-glass rounded-full px-4 py-2 text-[12px] text-white/70 hover:text-white/90"
                >
                  {t("startBuilding")} &rarr;
                </Link>
                <Link
                  href="/order"
                  className="liquid-glass rounded-full px-4 py-2 text-[12px] text-white/70 hover:text-white/90"
                >
                  {t("orderProject")} &rarr;
                </Link>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="liquid-glass-card rounded-2xl px-8 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-[16px] font-medium text-white/60 mb-2">{t("noProjects")}</h3>
                <p className="text-[13px] text-white/30 mb-6">{t("noProjectsDesc")}</p>
                <Link
                  href="/build"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-6 py-2.5 text-[13px] font-medium text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  {t("startBuilding")} &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => {
                  const statusColors: Record<string, string> = {
                    pending_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    building: "bg-violet-500/10 text-violet-400 border-violet-500/20",
                    deployed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    failed: "bg-red-500/10 text-red-400 border-red-500/20",
                  };
                  const statusColor = statusColors[project.status] || statusColors.pending_review;
                  const statusKey = `status_${project.status}` as
                    | "status_building"
                    | "status_deployed"
                    | "status_failed"
                    | "status_pending_review";

                  return (
                    <div
                      key={project.id}
                      className="liquid-glass-card rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[14px] font-medium text-white truncate">
                            {project.name}
                          </h3>
                          {project.package && (
                            <span className="text-[11px] text-white/30 bg-white/5 rounded-full px-2 py-0.5 shrink-0">
                              {project.package}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-white/40 truncate">
                          {project.description}
                        </p>
                        <p className="text-[11px] text-white/20 mt-1">
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-medium rounded-full px-3 py-1 border ${statusColor}`}
                      >
                        {t(statusKey)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
