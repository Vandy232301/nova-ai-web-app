"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";
import { useRef } from "react";


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
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated number counter ─── */
function Counter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      {value}
      {suffix}
    </motion.span>
  );
}

export default function AboutPage() {
  const t = useTranslations("about");
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const problems = [
    { number: "01", title: t("problem1Title"), desc: t("problem1Desc") },
    { number: "02", title: t("problem2Title"), desc: t("problem2Desc") },
    { number: "03", title: t("problem3Title"), desc: t("problem3Desc") },
    { number: "04", title: t("problem4Title"), desc: t("problem4Desc") },
  ];

  const steps = [
    { step: "01", title: t("step1Title"), desc: t("step1Desc"), color: "from-violet-500 to-violet-400" },
    { step: "02", title: t("step2Title"), desc: t("step2Desc"), color: "from-violet-400 to-blue-500" },
    { step: "03", title: t("step3Title"), desc: t("step3Desc"), color: "from-blue-500 to-blue-400" },
    { step: "04", title: t("step4Title"), desc: t("step4Desc"), color: "from-blue-400 to-violet-500" },
    { step: "05", title: t("step5Title"), desc: t("step5Desc"), color: "from-violet-500 to-blue-500" },
    { step: "06", title: t("step6Title"), desc: t("step6Desc"), color: "from-blue-500 to-violet-400" },
  ];

  const advantages = [
    { title: t("adv1Title"), desc: t("adv1Desc"), size: "", accent: true, icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    )},
    { title: t("adv2Title"), desc: t("adv2Desc"), size: "", accent: false, icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
    )},
    { title: t("adv3Title"), desc: t("adv3Desc"), size: "", accent: false, icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    )},
    { title: t("adv4Title"), desc: t("adv4Desc"), size: "", accent: false, icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    )},
    { title: t("adv5Title"), desc: t("adv5Desc"), size: "", accent: true, icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    )},
    { title: t("adv6Title"), desc: t("adv6Desc"), size: "", accent: false, icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    )},
  ];

  const produces = [
    { icon: "01", label: t("coreProduce1") },
    { icon: "02", label: t("coreProduce2") },
    { icon: "03", label: t("coreProduce3") },
    { icon: "04", label: t("coreProduce4") },
    { icon: "05", label: t("coreProduce5") },
    { icon: "06", label: t("coreProduce6") },
  ];

  const tags = [
    t("tagStartups"), t("tagSMEs"), t("tagCorporate"), t("tagProduct"), t("tagCTOs"),
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-transparent">
      {/* ═══ FIXED HEADER ═══ */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-4 text-[13px] sm:px-10 sm:py-6">
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-2.5 text-white"
        >
          <Image src="/nova-logo-icon.png" alt="NOVA" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" priority />
          <span className="tracking-tight font-bold text-[16px] sm:text-[18px]">NOVA</span>
        </Link>
        <nav className="pointer-events-auto hidden items-center gap-1.5 sm:flex">
          <Link
            href="/about"
            className="liquid-glass-active rounded-full px-3 py-1 text-[12px] text-white/90"
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
        <MobileNav activePage="about" />
      </header>

      {/* SECTION 1 — IMMERSIVE HERO */}
      <div ref={heroRef} className="relative w-full min-h-[85vh] sm:min-h-[100vh] flex items-center justify-center px-5 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full liquid-glass-badge px-4 py-1.5 text-[12px] tracking-wider text-white/50 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 animate-pulse" />
              {t("badge")}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="text-[28px] sm:text-[56px] lg:text-[72px] font-medium leading-[1.1] tracking-[-0.03em] text-white">
            {t("heroTitle1")} {t("heroPrecision")} {t("heroAnd")} {t("heroIntelligence")}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} className="mt-5 sm:mt-8 text-[14px] sm:text-[18px] leading-relaxed text-white/50 max-w-2xl mx-auto px-2 sm:px-0">
            {t("heroSubtitle")}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="mt-16 sm:mt-20 flex flex-col items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/25">{t("scrollToExplore")}</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      {/* SECTION 2 — STATS BAR */}
      <div className="w-full px-5 sm:px-10 py-14 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
              {[
                { value: "10x", label: t("statFasterOnboarding") },
                { value: "0", suffix: " weeks", label: t("statDiscoveryPhase") },
                { value: "100", suffix: "%", label: t("statSeniorEngineers") },
                { value: "24h", label: t("statFirstSpec") },
              ].map((stat, i) => (
                <div key={i} className="relative text-center group">
                  <div className="text-[36px] sm:text-[48px] lg:text-[56px] font-medium tracking-[-0.04em] text-white leading-none mb-3">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[13px] sm:text-[14px] text-white/40 tracking-wide uppercase">{stat.label}</div>
                  {i < 3 && <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* SECTION 3 — THE PROBLEM */}
      <div className="w-full px-5 sm:px-10 py-14 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-24">
            <div className="lg:w-[360px] flex-shrink-0">
              <div className="lg:sticky lg:top-32">
                <Reveal>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px w-8 bg-gradient-to-r from-violet-500 to-transparent" />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-violet-400/70">{t("problemLabel")}</span>
                  </div>
                  <h2 className="text-[24px] sm:text-[44px] font-medium text-white leading-[1.1] tracking-[-0.03em] mb-6">
                    {t("problemTitle")}{" "}<span className="text-white/40">{t("problemTitleBroken")}</span>
                  </h2>
                  <p className="text-[15px] leading-relaxed text-white/40">{t("problemSubtitle")}</p>
                </Reveal>
              </div>
            </div>
            <div className="flex-1 space-y-5">
              {problems.map((problem, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="group relative liquid-glass-card rounded-2xl p-7 sm:p-8">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/[0.04] to-blue-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex items-start gap-5 sm:gap-6">
                      <span className="flex-shrink-0 text-[13px] font-mono text-white/20 mt-1 group-hover:text-violet-400/60 transition-colors duration-500">{problem.number}</span>
                      <div>
                        <h3 className="text-[17px] sm:text-[18px] font-medium text-white/90 mb-2 group-hover:text-white transition-colors">{problem.title}</h3>
                        <p className="text-[14px] sm:text-[15px] leading-relaxed text-white/40 group-hover:text-white/55 transition-colors">{problem.desc}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 — THE SOLUTION */}
      <div className="w-full relative py-20 sm:py-44">
        <div className="absolute -inset-y-20 inset-x-0 pointer-events-none">
          <div className="nova-heavy-blur absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-r from-violet-500/15 via-blue-500/10 to-violet-500/15 blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 text-center">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-500/50" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-blue-400/70">{t("approachLabel")}</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-500/50" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-[26px] sm:text-[52px] lg:text-[64px] font-medium text-white leading-[1.1] tracking-[-0.03em] mb-8 sm:mb-10">
              {t("approachTitle")}{" "}
              <span className="relative inline-block">
                <span className="relative z-10">{t("approachFriction")}</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-violet-500/30 to-blue-500/30 -skew-x-3 rounded-sm" />
              </span>{" "}
              {t("approachWithIntelligence")}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="space-y-6 text-[16px] sm:text-[18px] leading-relaxed text-white/60 max-w-3xl mx-auto">
              <p>
                {t("approachP1")}{" "}
                <span className="text-white/90 font-medium">{t("approachSeniorDevs")}</span>{" "}
                {t("approachAndWord")}{" "}
                <span className="text-white/90 font-medium">{t("approachAI")}</span>
                {t("approachP1End")}
              </p>
              <p>{t("approachP2")}</p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* SECTION 5 — CORE TECHNOLOGY (Galactic) */}
      <div className="w-full relative py-28 sm:py-40">
        {/* Galactic background */}
        {/* Galactic background — nebula glow only */}
        <div className="absolute -inset-y-32 inset-x-0 pointer-events-none">
          <div className="nova-heavy-blur absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-r from-violet-600/20 via-blue-500/15 to-violet-500/20 blur-[150px]" />
          <div className="nova-heavy-blur absolute top-[15%] left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-500/12 to-transparent blur-[100px]" />
          <div className="nova-heavy-blur absolute top-[25%] right-1/4 w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-violet-500/12 to-transparent blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10">
          {/* Galactic visual area — orb, rings, stars all contained here */}
          <Reveal>
            <div className="relative flex justify-center mb-14 sm:mb-16" style={{ minHeight: "280px" }}>
              {/* Star field around the orb */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[5%] left-[10%] w-1 h-1 rounded-full bg-white/30" />
                <div className="absolute top-[20%] left-[22%] w-0.5 h-0.5 rounded-full bg-white/20" />
                <div className="absolute top-[10%] right-[15%] w-1 h-1 rounded-full bg-white/25" />
                <div className="absolute top-[35%] right-[25%] w-0.5 h-0.5 rounded-full bg-white/15" />
                <div className="absolute bottom-[15%] left-[18%] w-0.5 h-0.5 rounded-full bg-white/20" />
                <div className="absolute bottom-[20%] right-[12%] w-1 h-1 rounded-full bg-white/20" />
                <div className="absolute top-[55%] left-[8%] w-0.5 h-0.5 rounded-full bg-white/15" />
                <div className="absolute top-[40%] right-[8%] w-0.5 h-0.5 rounded-full bg-white/10" />
                <div className="absolute bottom-[5%] left-[40%] w-1 h-1 rounded-full bg-white/25" />
                <div className="absolute top-[8%] left-[55%] w-0.5 h-0.5 rounded-full bg-white/15" />
                <div className="absolute bottom-[30%] right-[20%] w-0.5 h-0.5 rounded-full bg-white/20" />
                <div className="absolute top-[65%] left-[15%] w-0.5 h-0.5 rounded-full bg-white/15" />
                {/* Pulsing stars */}
                <motion.div animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[15%] right-[20%] w-1.5 h-1.5 rounded-full bg-violet-300/50" />
                <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[20%] left-[25%] w-1.5 h-1.5 rounded-full bg-blue-300/50" />
                <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-[50%] right-[10%] w-1 h-1 rounded-full bg-white/50" />
              </div>

              {/* Orb + rings — all absolutely centered on the same point */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                {/* Orbital ring 1 */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+80px)] h-[calc(100%+80px)] sm:w-[calc(100%+100px)] sm:h-[calc(100%+100px)]">
                  <div className="w-full h-full rounded-full border border-white/[0.04]" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-400/60 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
                </motion.div>
                {/* Orbital ring 2 */}
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+140px)] h-[calc(100%+140px)] sm:w-[calc(100%+170px)] sm:h-[calc(100%+170px)]">
                  <div className="w-full h-full rounded-full border border-white/[0.03]" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400/60 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                </motion.div>
                {/* Orbital ring 3 */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+210px)] h-[calc(100%+210px)] sm:w-[calc(100%+250px)] sm:h-[calc(100%+250px)]">
                  <div className="w-full h-full rounded-full border border-dashed border-white/[0.03]" />
                  <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-violet-300/40" />
                </motion.div>

                {/* Core orb — same center */}
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 rounded-full flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/40 to-blue-500/40 blur-xl" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500/50 to-blue-600/50 blur-md" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500/70 to-blue-500/60 shadow-[0_0_80px_rgba(129,140,248,0.4)]" />
                  <Image src="/nova-logo-icon.png" alt="NOVA" width={56} height={56} className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
                </motion.div>
              </div>
            </div>
          </Reveal>

          {/* Text content — below all visuals */}
          <Reveal delay={0.1}>
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-violet-500/50" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-violet-400/70">{t("coreLabel")}</span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-violet-500/50" />
              </div>
              <h2 className="text-[24px] sm:text-[44px] lg:text-[52px] font-medium text-white leading-[1.1] tracking-[-0.03em] mb-4 sm:mb-5">{t("coreTitle")}</h2>
              <p className="text-[15px] sm:text-[17px] leading-relaxed text-white/50 max-w-2xl mx-auto">{t("coreSubtitle")}</p>
            </div>
          </Reveal>

          {/* What AI produces — orbital grid */}
          <Reveal delay={0.15}>
            <p className="text-[12px] uppercase tracking-[0.15em] text-white/30 mb-6 font-medium text-center">{t("coreProducesLabel")}</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {produces.map((item, i) => (
              <Reveal key={i} delay={0.15 + i * 0.05}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -3 }}
                  transition={{ duration: 0.25 }}
                  className="group relative liquid-glass-card rounded-2xl p-5 text-center overflow-hidden"
                >
                  {/* Subtle nebula glow on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/[0.05] via-transparent to-blue-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl liquid-glass-icon mx-auto mb-4 flex items-center justify-center text-[11px] font-mono text-white/25 group-hover:text-violet-400/70 transition-colors duration-300">
                      {item.icon}
                    </div>
                    <span className="text-[14px] text-white/60 group-hover:text-white/85 transition-colors duration-300 font-medium">{item.label}</span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Callout */}
          <Reveal delay={0.4}>
            <div className="max-w-3xl mx-auto relative liquid-glass-callout rounded-2xl overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 via-blue-500 to-violet-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/[0.03] to-transparent" />
              <p className="relative z-10 p-6 sm:p-8 text-[15px] sm:text-[16px] text-white/80 font-medium leading-relaxed text-center">{t("coreCallout")}</p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* SECTION 6 — THE PROCESS */}
      <div className="w-full px-6 sm:px-10 py-20 sm:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16 sm:mb-20">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-500/50" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-blue-400/70">{t("processLabel")}</span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-500/50" />
              </div>
              <h2 className="text-[24px] sm:text-[44px] font-medium text-white leading-[1.1] tracking-[-0.03em]">{t("processTitle")}</h2>
            </div>
          </Reveal>
          <div className="relative">
            <div className="hidden lg:block absolute top-[52px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {steps.map((item, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="group relative h-full">
                    <div className="relative flex flex-col items-start liquid-glass-card rounded-2xl p-7 sm:p-8 h-full">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                        <span className="text-[12px] font-bold text-white">{item.step}</span>
                      </div>
                      <h3 className="text-[16px] sm:text-[17px] font-medium text-white mb-2">{item.title}</h3>
                      <p className="text-[13px] sm:text-[14px] leading-relaxed text-white/40 group-hover:text-white/55 transition-colors">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.3}>
            <div className="mt-12 sm:mt-16 text-center">
              <div className="inline-flex items-center gap-3 rounded-full liquid-glass-badge px-6 py-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 animate-pulse" />
                <span className="text-[13px] sm:text-[14px] text-white/60">
                  {t("processCallout1")}{" "}
                  <span className="text-white/90 font-medium">{t("processCalloutFaster")}</span>{" "}
                  {t("processCalloutAnd")}{" "}
                  <span className="text-white/90 font-medium">{t("processCalloutClearer")}</span>.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* SECTION 7 — WHY THIS WORKS (Bento Grid) */}
      <div className="w-full px-6 sm:px-10 py-20 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14 sm:mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-violet-500/50" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-violet-400/70">{t("advantagesLabel")}</span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-violet-500/50" />
              </div>
              <h2 className="text-[24px] sm:text-[44px] font-medium text-white leading-[1.1] tracking-[-0.03em]">{t("advantagesTitle")}</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {advantages.map((item, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }} className={`group relative rounded-2xl p-8 sm:p-10 h-full ${item.accent ? "liquid-glass-card-accent" : "liquid-glass-card"} ${item.size}`}>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl liquid-glass-icon flex items-center justify-center mb-5 text-white/40 group-hover:text-violet-400/80 transition-colors duration-300">
                      {item.icon}
                    </div>
                    <h3 className="text-[18px] sm:text-[20px] font-medium text-white mb-3 group-hover:text-white transition-colors">{item.title}</h3>
                    <p className="text-[14px] sm:text-[15px] leading-relaxed text-white/40 group-hover:text-white/55 transition-colors max-w-lg">{item.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 8 — WHO IS NOVA FOR */}
      <div className="w-full px-6 sm:px-10 py-20 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-500/50" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-blue-400/70">{t("builtForLabel")}</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-500/50" />
            </div>
            <h2 className="text-[24px] sm:text-[44px] font-medium text-white leading-[1.1] tracking-[-0.03em] mb-8 sm:mb-10">{t("builtForTitle")}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {tags.map((tag, i) => (
                <motion.span key={i} whileHover={{ scale: 1.05, y: -2 }} className="liquid-glass px-6 py-3 rounded-full text-white/70 text-[14px] font-medium hover:text-white/90 cursor-default">
                  {tag}
                </motion.span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[16px] sm:text-[18px] leading-relaxed text-white/50 max-w-2xl mx-auto">
              {t("builtForText1")}{" "}
              <span className="text-white/80 font-medium">{t("builtForClarity")}</span>,{" "}
              <span className="text-white/80 font-medium">{t("builtForSpeed")}</span>,{" "}
              <span className="text-white/80 font-medium">{t("builtForPrecision")}</span>.
            </p>
          </Reveal>
        </div>
      </div>

      {/* SECTION 9 — FINAL CTA + FOOTER */}
      <div className="w-full px-6 sm:px-10 pt-32 sm:pt-44 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="nova-heavy-blur absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-t from-violet-500/20 to-blue-500/10 blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-[24px] sm:text-[44px] lg:text-[52px] font-medium text-white leading-[1.1] tracking-[-0.03em] mb-5 sm:mb-6">
              {t("ctaTitle1")} {t("ctaExtraordinary")}?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[15px] sm:text-[16px] text-white/50 mb-10 max-w-lg mx-auto">{t("ctaSubtitle")}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-8 py-3.5 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98]">
                {t("ctaTalkAgent")}
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full liquid-glass px-8 py-3.5 text-[14px] text-white/70 hover:text-white/90">
                {t("ctaScheduleCall")}
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Footer inside CTA section — no separation */}
        <div className="relative z-10 w-full mt-32 sm:mt-44 pb-6 px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/20">
            <span>&copy; {new Date().getFullYear()} NOVA. {t("footerRights")}</span>
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
