"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function OrderPage() {
  const t = useTranslations("order");
  const searchParams = useSearchParams();
  const packageType = searchParams.get("package");
  const stripeSessionId = searchParams.get("session_id");

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [references, setReferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description,
          references,
          package: packageType,
          stripeSessionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-transparent px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">{t("submitted")}</h2>
          <p className="text-[14px] text-white/50 mb-8">{t("submittedDesc")}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-6 py-3 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Go to Dashboard &rarr;
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden bg-transparent">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between px-5 sm:px-10 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 sm:py-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Image src="/nova-logo-icon.png" alt="NOVA" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
          <span className="tracking-tight font-bold text-[17px] sm:text-[18px]">NOVA</span>
        </Link>
        <Link href="/dashboard" className="liquid-glass rounded-full px-3 py-1 text-[12px] text-white/70 hover:text-white/90">
          Dashboard
        </Link>
      </header>

      {/* Form */}
      <section className="relative z-10 w-full max-w-2xl px-4 sm:px-8 pt-28 sm:pt-36 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[24px] sm:text-[36px] font-medium tracking-[-0.02em] text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-[14px] text-white/50 mb-10">
            {t("subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="projectName" className="block text-[13px] text-white/60 mb-2">
                {t("projectName")}
              </label>
              <input
                id="projectName"
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t("projectNamePlaceholder")}
                className="w-full liquid-glass-input rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-[13px] text-white/60 mb-2">
                {t("description")}
              </label>
              <textarea
                id="description"
                required
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                className="w-full liquid-glass-input rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
              />
            </div>

            <div>
              <label htmlFor="references" className="block text-[13px] text-white/60 mb-2">
                {t("references")}
              </label>
              <textarea
                id="references"
                rows={3}
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder={t("referencesPlaceholder")}
                className="w-full liquid-glass-input rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-8 py-3.5 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <>
                  {t("submit")}
                  <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
