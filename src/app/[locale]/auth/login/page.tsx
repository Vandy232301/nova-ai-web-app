"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const enabledProviders = {
    google: !!process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED,
    apple: !!process.env.NEXT_PUBLIC_APPLE_OAUTH_ENABLED,
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }
    if (!enabledProviders[provider]) {
      setError(t("oauthComingSoon"));
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-transparent px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Image src="/nova-logo-icon.png" alt="NOVA" width={40} height={40} className="w-10 h-10 object-contain" />
          <span className="tracking-tight font-bold text-xl text-white">NOVA</span>
        </Link>

        {/* Card */}
        <div className="liquid-glass-card rounded-2xl px-6 py-8 sm:px-8 sm:py-10">
          <h1 className="text-2xl font-semibold text-white text-center mb-2">
            {t("loginTitle")}
          </h1>
          <p className="text-[14px] text-white/50 text-center mb-8">
            {t("loginSubtitle")}
          </p>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="w-full liquid-glass rounded-xl px-4 py-3 text-[14px] text-white/80 hover:text-white flex items-center justify-center gap-3 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("continueWithGoogle")}
            </button>
            <button
              onClick={() => handleOAuth("apple")}
              disabled={loading}
              className="w-full liquid-glass rounded-xl px-4 py-3 text-[14px] text-white/80 hover:text-white flex items-center justify-center gap-3 disabled:opacity-50 transition-colors"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {t("continueWithApple")}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[12px] text-white/30 uppercase tracking-wider">{t("or")}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[12px] text-white/50 mb-1.5">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[12px] text-white/50 mb-1.5">
                {t("password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-8 py-3 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                t("login")
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-[13px] text-white/40 text-center mt-6">
            {t("noAccount")}{" "}
            <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
              {t("signUp")}
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
