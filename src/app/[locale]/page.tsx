"use client";

import { useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";

const DiscoveryFlow = lazy(() => import("@/components/DiscoveryFlow"));

export default function Home() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const [showDiscovery, setShowDiscovery] = useState(false);

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden bg-transparent">
      {/* Header */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-10 sm:py-6">
        <button
          onClick={() => setShowDiscovery(false)}
          className="pointer-events-auto flex items-center gap-2 text-white"
        >
          <Image src="/nova-logo-icon.png" alt="NOVA" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" priority fetchPriority="high" />
          <span className="tracking-tight font-bold text-[17px] sm:text-[18px]">NOVA</span>
        </button>
        <nav className="pointer-events-auto hidden items-center gap-1.5 sm:flex">
          <Link href="/about" className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90">
            {tNav("about")}
          </Link>
          <Link href="/contact" className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90">
            {tNav("contact")}
          </Link>
          <LanguageSwitcher />
        </nav>
        <MobileNav />
      </header>

      <AnimatePresence mode="wait">
        {!showDiscovery ? (
          <motion.section
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6 pb-16 pt-24 sm:px-8 sm:pb-32 sm:pt-32"
          >
            <div className="w-full max-w-5xl text-center">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-[28px] sm:text-[56px] lg:text-[72px] font-medium leading-[1.1] tracking-[-0.03em] text-white"
              >
                {t("headline")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="mt-5 sm:mt-8 max-w-2xl mx-auto text-[14px] sm:text-[18px] leading-relaxed text-white/50 px-2 sm:px-0"
              >
                {t("subheadline")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3"
              >
                <button
                  onClick={() => setShowDiscovery(true)}
                  className="pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-7 py-3 text-[15px] font-medium text-white hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("startBuilding")}
                  <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </button>
                <Link
                  href="/contact"
                  className="pointer-events-auto liquid-glass flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[14px] text-white/70 hover:text-white/90"
                >
                  {t("contactUs")}
                  <span className="text-[12px]">&rarr;</span>
                </Link>
              </motion.div>
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="discovery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex w-full flex-1"
          >
            <Suspense fallback={
              <div className="flex items-center justify-center h-full w-full">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-violet-400/50 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-violet-400/50 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-violet-400/50 animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            }>
              <DiscoveryFlow onClose={() => setShowDiscovery(false)} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
