"use client";

import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";
import { useRef, useState } from "react";

/* ─── Scroll-triggered section wrapper ─── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ContactPage() {
  const t = useTranslations("contact");
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-transparent">
      {/* ═══ HEADER ═══ */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-4 text-[13px] sm:px-10 sm:py-6">
        <Link href="/" className="pointer-events-auto flex items-center gap-2.5 text-white">
          <Image src="/nova-logo-icon.png" alt="NOVA" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" priority />
          <span className="tracking-tight font-bold text-[16px] sm:text-[18px]">NOVA</span>
        </Link>
        <nav className="pointer-events-auto hidden items-center gap-1.5 sm:flex">
          <Link href="/about" className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90">
            {tNav("about")}
          </Link>
          <Link href="/contact" className="liquid-glass-active rounded-full px-3 py-1 text-[12px] text-white/90">
            {tNav("contact")}
          </Link>
          <LanguageSwitcher />
        </nav>
        <MobileNav activePage="contact" />
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center px-5 sm:px-6 pt-24 sm:pt-32 pb-12 sm:pb-16">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-violet-500/10 to-blue-500/5 blur-[100px]" />
          <div className="absolute bottom-1/4 right-[15%] w-48 h-48 rounded-full bg-gradient-to-tl from-blue-500/10 to-violet-500/5 blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full liquid-glass-badge px-4 py-1.5 text-[12px] tracking-wider text-white/50 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 animate-pulse" />
              {t("badge")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[28px] sm:text-[52px] lg:text-[64px] font-medium leading-[1.1] tracking-[-0.03em] text-white"
          >
            {t("title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 sm:mt-6 text-[14px] sm:text-[18px] leading-relaxed text-white/50 max-w-xl mx-auto px-2 sm:px-0"
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — INFO BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full px-6 sm:px-10 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                {
                  label: t("responseLabel"),
                  value: t("responseValue"),
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                },
                {
                  label: t("locationLabel"),
                  value: t("locationValue"),
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group liquid-glass-card flex items-center gap-4 rounded-2xl p-5"
                >
                  <div className="w-10 h-10 rounded-xl liquid-glass-icon flex items-center justify-center text-white/40 group-hover:text-violet-400/80 transition-colors flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-0.5">{item.label}</div>
                    <div className="text-[14px] text-white/80 font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — THREE METHODS
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full px-6 sm:px-10 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-violet-500/50" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-violet-400/70">{t("methodTitle")}</span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-violet-500/50" />
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {/* Method 1 — Talk to NOVA (featured) */}
            <Reveal delay={0}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="group relative h-full liquid-glass-card-accent rounded-2xl p-8 sm:p-9 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br from-violet-500/10 to-transparent blur-3xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 liquid-glass-cta flex items-center justify-center mb-6">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full liquid-glass-badge px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-violet-400 font-medium mb-4">
                    <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                    AI-powered
                  </div>
                  <h3 className="text-[20px] sm:text-[22px] font-medium text-white mb-3">{t("method1Title")}</h3>
                  <p className="text-[14px] leading-relaxed text-white/50 mb-8 group-hover:text-white/60 transition-colors">{t("method1Desc")}</p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-6 py-2.5 text-[13px] font-medium text-white hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t("method1Cta")}
                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </motion.div>
            </Reveal>

            {/* Method 2 — Schedule a call */}
            <Reveal delay={0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="group relative h-full liquid-glass-card rounded-2xl p-8 sm:p-9"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl liquid-glass-icon flex items-center justify-center mb-6 text-white/50 group-hover:text-white/70 transition-colors">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                    </svg>
                  </div>
                  <h3 className="text-[20px] sm:text-[22px] font-medium text-white mb-3">{t("method2Title")}</h3>
                  <p className="text-[14px] leading-relaxed text-white/50 mb-8 group-hover:text-white/60 transition-colors">{t("method2Desc")}</p>
                  <button className="inline-flex items-center gap-2 rounded-full liquid-glass px-6 py-2.5 text-[13px] font-medium text-white/70 hover:text-white/90">
                    {t("method2Cta")}
                    <span>&rarr;</span>
                  </button>
                </div>
              </motion.div>
            </Reveal>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — FAQ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full px-6 sm:px-10 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-500/50" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-blue-400/70">{t("faqTitle")}</span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-500/50" />
              </div>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div
                  className={`group rounded-2xl overflow-hidden transition-all duration-300 ${
                    openFaq === i
                      ? "liquid-glass-card-accent"
                      : "liquid-glass-card"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="text-[15px] sm:text-[16px] font-medium text-white/90 pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 w-8 h-8 rounded-full liquid-glass-icon flex items-center justify-center"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === i ? "auto" : 0,
                      opacity: openFaq === i ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-[14px] sm:text-[15px] leading-relaxed text-white/50">
                      {faq.a}
                    </p>
                  </motion.div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 — FINAL CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full px-6 sm:px-10 pt-24 sm:pt-32 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-gradient-to-t from-violet-500/15 to-blue-500/8 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <Reveal>
            <h2 className="text-[24px] sm:text-[44px] font-medium text-white leading-[1.1] tracking-[-0.03em] mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-[15px] sm:text-[16px] text-white/50 mb-8">{t("ctaSubtitle")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-8 py-3.5 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("talkToNova")}
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="relative z-10 w-full mt-32 sm:mt-44 pb-6 px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/20">
            <span>&copy; {new Date().getFullYear()} NOVA.</span>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
              <Link href="/about" className="hover:text-white/50 transition-colors">{tNav("about")}</Link>
              <Link href="/contact" className="hover:text-white/50 transition-colors">{tNav("contact")}</Link>
              <span className="text-white/10">|</span>
              <Link href="/terms" className="hover:text-white/50 transition-colors">{tFooter("terms")}</Link>
              <Link href="/privacy" className="hover:text-white/50 transition-colors">{tFooter("privacy")}</Link>
              <Link href="/cookies" className="hover:text-white/50 transition-colors">{tFooter("cookies")}</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
