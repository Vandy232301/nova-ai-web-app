"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";
import { createClient } from "@/lib/supabase/client";

type Tab = "self-build" | "done-for-you";

const selfBuildPlans = [
  {
    id: "starter",
    popular: false,
    price: 29,
    features: ["hundredMessages", "zeroBuilds", "basicTemplates", "communitySupport"],
  },
  {
    id: "pro",
    popular: true,
    price: 149,
    features: ["fiveHundredMessages", "oneBuild", "allTemplates", "marketingAssets", "customDomains", "noBranding", "emailSupport"],
  },
  {
    id: "scale",
    popular: false,
    price: 399,
    features: ["twoThousandMessages", "threeBuilds", "priorityQueue", "whiteLabel", "apiAccess", "prioritySupport"],
  },
];

const doneForYouPackages = [
  {
    id: "landing",
    price: 197,
    delivery: "24-48h",
    features: ["professionalLanding", "seoOptimized", "mobileResponsive", "customDomain", "oneRevision"],
  },
  {
    id: "mvp",
    popular: true,
    price: 997,
    delivery: "3-5d",
    features: ["fullWebApp", "authDatabase", "fiveCoreFeatures", "adminDashboard", "deployment", "twoRevisions"],
  },
  {
    id: "mobile",
    price: 1997,
    delivery: "5-7d",
    features: ["iosAndroid", "backendDatabase", "pushNotifications", "storeReady", "twoRevisions"],
  },
  {
    id: "fullProduct",
    price: 2997,
    delivery: "10-14d",
    features: ["webPlusMobile", "adminDashboard", "marketingWebsite", "brandIdentity", "socialMediaPack", "fourteenDaySupport"],
  },
];

export default function PricingPage() {
  const t = useTranslations("pricing");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "done-for-you" ? "done-for-you" : "self-build";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = useCallback(async (tier: string) => {
    const supabase = createClient();
    if (!supabase) {
      router.push("/auth/signup");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/auth/login?next=/pricing&plan=${tier}`);
      return;
    }

    setLoadingTier(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch {
      alert("Connection error. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  }, [router]);

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden bg-transparent">
      {/* Header */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-20 flex items-center justify-between px-5 sm:px-10 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 sm:py-6">
        <Link href="/" className="pointer-events-auto flex items-center gap-2 text-white">
          <Image src="/nova-logo-icon.png" alt="NOVA" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
          <span className="tracking-tight font-bold text-[17px] sm:text-[18px]">NOVA</span>
        </Link>
        <nav className="pointer-events-auto hidden items-center gap-1.5 sm:flex">
          <Link href="/about" className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90">
            {tNav("about")}
          </Link>
          <Link href="/contact" className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90">
            {tNav("contact")}
          </Link>
          <Link href="/pricing" className="liquid-glass-active rounded-full px-3 py-1 text-[12px] text-white/90">
            {tNav("pricing")}
          </Link>
          <LanguageSwitcher />
        </nav>
        <MobileNav />
      </header>

      {/* Content */}
      <section className="relative z-10 w-full max-w-6xl px-4 sm:px-8 pt-28 sm:pt-36 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h1 className="text-[28px] sm:text-[48px] font-medium leading-tight tracking-[-0.03em] text-white">
            {t("title")}
          </h1>
          <p className="mt-4 text-[14px] sm:text-[17px] text-white/50 max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="liquid-glass rounded-full p-1 flex gap-1">
            <button
              onClick={() => setActiveTab("self-build")}
              className={`px-5 py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all ${
                activeTab === "self-build"
                  ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              {t("tabSelfBuild")}
            </button>
            <button
              onClick={() => setActiveTab("done-for-you")}
              className={`px-5 py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all ${
                activeTab === "done-for-you"
                  ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              {t("tabDoneForYou")}
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <AnimatePresence mode="wait">
          {activeTab === "self-build" ? (
            <motion.div
              key="self-build"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Free trial banner */}
              <div className="md:col-span-3 liquid-glass-callout rounded-2xl px-6 py-4 text-center mb-2">
                <p className="text-[14px] text-white/70">
                  <span className="text-violet-400 font-medium">{t("freeTrial")}</span>
                  {" "}{t("freeTrialDesc")}
                </p>
              </div>

              {selfBuildPlans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className={`relative ${plan.popular ? "liquid-glass-card-accent" : "liquid-glass-card"} rounded-2xl px-6 py-8 flex flex-col`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="liquid-glass-badge rounded-full px-3 py-1 text-[11px] font-medium text-violet-300">
                        {t("mostPopular")}
                      </span>
                    </div>
                  )}
                  <h3 className="text-[18px] font-semibold text-white mb-1">
                    {t(`plan_${plan.id}`)}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-[36px] font-bold text-white">${plan.price}</span>
                    <span className="text-[14px] text-white/40">{t("perMonth")}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-[13px] text-white/60">
                        <svg className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t(`feat_${feat}`)}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loadingTier === plan.id}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta text-white"
                        : "liquid-glass text-white/80 hover:text-white"
                    }`}
                  >
                    {loadingTier === plan.id ? "..." : t("getStarted")}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="done-for-you"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {doneForYouPackages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className={`relative ${pkg.popular ? "liquid-glass-card-accent" : "liquid-glass-card"} rounded-2xl px-6 py-8 flex flex-col`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="liquid-glass-badge rounded-full px-3 py-1 text-[11px] font-medium text-violet-300">
                        {t("mostPopular")}
                      </span>
                    </div>
                  )}
                  <h3 className="text-[18px] font-semibold text-white mb-1">
                    {t(`pkg_${pkg.id}`)}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[36px] font-bold text-white">
                      ${pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[13px] text-white/40 mb-6">
                    {t("delivery")}: {pkg.delivery}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-[13px] text-white/60">
                        <svg className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t(`feat_${feat}`)}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout(pkg.id)}
                    disabled={loadingTier === pkg.id}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait ${
                      pkg.popular
                        ? "bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta text-white"
                        : "liquid-glass text-white/80 hover:text-white"
                    }`}
                  >
                    {loadingTier === pkg.id ? "..." : t("orderNow")}
                  </button>
                </motion.div>
              ))}

              {/* Maintenance add-on */}
              <div className="md:col-span-2 liquid-glass-callout rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-[16px] font-medium text-white">{t("maintenanceTitle")}</h4>
                  <p className="text-[13px] text-white/50 mt-1">{t("maintenanceDesc")}</p>
                </div>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-[24px] font-bold text-white">$149</span>
                  <span className="text-[13px] text-white/40">{t("perMonth")}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-[14px] text-white/40">
            {t("enterpriseText")}{" "}
            <Link href="/contact" className="text-violet-400 hover:text-violet-300 transition-colors">
              {t("contactUs")}
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
