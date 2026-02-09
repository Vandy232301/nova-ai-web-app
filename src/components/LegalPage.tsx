"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";

export default function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-transparent">
      {/* Header */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-4 text-[13px] sm:px-10 sm:py-6">
        <Link href="/" className="pointer-events-auto flex items-center gap-2.5 text-white">
          <Image src="/nova-logo-icon.png" alt="NOVA" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" priority />
          <span className="tracking-tight font-bold text-[16px] sm:text-[18px]">NOVA</span>
        </Link>
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

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto px-5 sm:px-10 pt-24 sm:pt-40 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[24px] sm:text-[44px] font-medium text-white leading-[1.1] tracking-[-0.03em] mb-2 sm:mb-3">
            {title}
          </h1>
          <p className="text-[12px] sm:text-[13px] text-white/30 mb-8 sm:mb-12">{lastUpdated}</p>

          <div className="legal-content space-y-6 sm:space-y-8 text-[14px] sm:text-[15px] leading-[1.8] text-white/60">
            {children}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-white/20 mt-24 pb-6">
          <span>&copy; {new Date().getFullYear()} NOVA.</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/terms" className="hover:text-white/50 transition-colors">{tFooter("terms")}</Link>
            <Link href="/privacy" className="hover:text-white/50 transition-colors">{tFooter("privacy")}</Link>
            <Link href="/cookies" className="hover:text-white/50 transition-colors">{tFooter("cookies")}</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
