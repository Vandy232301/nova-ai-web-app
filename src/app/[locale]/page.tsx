"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";
import DiscoveryFlow from "@/components/DiscoveryFlow";

export default function Home() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const [showDiscovery, setShowDiscovery] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-transparent text-sm sm:text-base">
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-4 text-[13px] sm:px-10 sm:py-6">
        <button
          onClick={() => setShowDiscovery(false)}
          className="pointer-events-auto flex items-center gap-2.5 text-white"
        >
          <Image src="/nova-logo-icon.png" alt="NOVA" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" priority />
          <span className="tracking-tight font-bold text-[16px] sm:text-[18px]">NOVA</span>
        </button>
        <nav className="pointer-events-auto hidden items-center gap-1.5 sm:flex">
          <Link
            href="/about"
            className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90"
          >
            {tNav("about")}
          </Link>
          <Link
            href="/contact"
            className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90"
          >
            {tNav("contact")}
          </Link>
          <LanguageSwitcher />
        </nav>
        <MobileNav />
      </header>

      <AnimatePresence mode="wait">
        {!showDiscovery ? (
          /* ═══ LANDING STATE ═══ */
          <motion.section
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-5 pb-20 pt-20 sm:px-8 sm:pb-32 sm:pt-32"
          >
            <div className="max-w-5xl text-center">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-[32px] sm:text-[56px] lg:text-[72px] font-medium leading-[1.08] tracking-[-0.03em] text-white"
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
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3"
              >
                <button
                  onClick={() => setShowDiscovery(true)}
                  className="pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-6 py-2.5 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("startBuilding")}
                  <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </button>
                <Link
                  href="/contact"
                  className="pointer-events-auto liquid-glass flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] text-white/70 hover:text-white/90"
                >
                  {t("contactUs")}
                  <span className="text-[11px]">&rarr;</span>
                </Link>
              </motion.div>
            </div>
          </motion.section>
        ) : (
          /* ═══ DISCOVERY FLOW ═══ */
          <motion.div
            key="discovery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex w-full flex-1"
          >
            <DiscoveryFlow onClose={() => setShowDiscovery(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
