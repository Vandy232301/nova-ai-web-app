"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function MobileNav({ activePage }: { activePage?: "about" | "contact" }) {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden pointer-events-auto">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="liquid-glass rounded-xl w-9 h-9 flex items-center justify-center"
        aria-label="Menu"
      >
        <motion.div animate={open ? "open" : "closed"} className="w-4 h-3 flex flex-col justify-between">
          <motion.span
            variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: 45, y: 5 } }}
            className="block w-4 h-px bg-white/70 origin-center"
          />
          <motion.span
            variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }}
            className="block w-4 h-px bg-white/70"
          />
          <motion.span
            variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: -45, y: -7 } }}
            className="block w-4 h-px bg-white/70 origin-center"
          />
        </motion.div>
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] px-6 py-8 flex flex-col"
              style={{
                background: "linear-gradient(180deg, rgba(10,10,18,0.98) 0%, rgba(5,5,8,0.99) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="self-end mb-8 w-9 h-9 rounded-xl liquid-glass flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Navigation links */}
              <nav className="flex flex-col gap-2 mb-8">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-[15px] text-white/70 hover:text-white/90 hover:bg-white/5 transition-all"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-[15px] transition-all ${
                    activePage === "about" ? "text-white bg-white/8" : "text-white/70 hover:text-white/90 hover:bg-white/5"
                  }`}
                >
                  {tNav("about")}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-[15px] transition-all ${
                    activePage === "contact" ? "text-white bg-white/8" : "text-white/70 hover:text-white/90 hover:bg-white/5"
                  }`}
                >
                  {tNav("contact")}
                </Link>
              </nav>

              {/* Divider */}
              <div className="h-px bg-white/[0.06] mb-6" />

              {/* Legal links */}
              <nav className="flex flex-col gap-1 mb-8">
                <Link href="/terms" onClick={() => setOpen(false)} className="px-4 py-2 text-[13px] text-white/30 hover:text-white/50 transition-colors">
                  {tFooter("terms")}
                </Link>
                <Link href="/privacy" onClick={() => setOpen(false)} className="px-4 py-2 text-[13px] text-white/30 hover:text-white/50 transition-colors">
                  {tFooter("privacy")}
                </Link>
                <Link href="/cookies" onClick={() => setOpen(false)} className="px-4 py-2 text-[13px] text-white/30 hover:text-white/50 transition-colors">
                  {tFooter("cookies")}
                </Link>
              </nav>

              {/* Language switcher at bottom */}
              <div className="mt-auto">
                <LanguageSwitcher />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
