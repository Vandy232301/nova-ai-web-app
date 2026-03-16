"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useNovaChat } from "@/lib/nova/use-nova-chat";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export default function BuildPage() {
  const t = useTranslations("build");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentStreamId = useRef<string | null>(null);
  const scrollThrottleRef = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    const now = Date.now();
    if (now - scrollThrottleRef.current < 100) return;
    scrollThrottleRef.current = now;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const { sendMessage, isStreaming } = useNovaChat({
    onToken: (fullContent) => {
      const streamId = currentStreamId.current;
      if (!streamId) return;
      setMessages((prev) => {
        const others = prev.filter((m) => m.id !== streamId);
        return [...others, { id: streamId, role: "assistant", content: fullContent, createdAt: Date.now() }];
      });
      scrollToBottom();
    },
    onComplete: () => {
      currentStreamId.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    onError: (error) => {
      setStatusMessage(error);
      currentStreamId.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    },
  });

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setAuthChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      setAuthChecked(true);
      if (session) {
        setMessages([{
          id: "greeting",
          role: "assistant",
          content: t("greeting"),
          createdAt: Date.now(),
        }]);
      }
    });
  }, [t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setStatusMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    scrollToBottom();

    const streamId = `nova-${Date.now()}`;
    currentStreamId.current = streamId;

    const chatHistory = newMessages
      .filter((m) => m.id !== "greeting" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    await sendMessage(chatHistory);
  }, [input, isStreaming, messages, scrollToBottom, sendMessage]);

  if (!authChecked) {
    return (
      <main className="relative flex h-[100dvh] flex-col items-center justify-center bg-transparent">
        <div className="flex items-center gap-2 text-white/50">
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-violet-400/50" />
          <span className="text-sm">Loading...</span>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="relative flex h-[100dvh] flex-col items-center justify-center bg-transparent px-4">
        <div className="liquid-glass-card rounded-2xl p-8 max-w-md text-center space-y-4">
          <Image src="/nova-logo-icon.png" alt="NOVA" width={48} height={48} className="w-12 h-12 mx-auto object-contain" />
          <h2 className="text-xl font-semibold text-white">Sign in to Build</h2>
          <p className="text-sm text-white/60">You need to sign in to access the NOVA AI Builder.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Sign In &rarr;
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-transparent">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2 text-white">
          <Image src="/nova-logo-icon.png" alt="NOVA" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="tracking-tight font-bold text-[15px]">NOVA</span>
          <span className="text-[11px] text-violet-400/70 font-medium uppercase tracking-wider ml-1">Builder</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-white/40">Connected</span>
          </div>
          <Link href="/dashboard" className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/50 hover:text-white/70">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Status bar */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 px-4 py-2 text-center text-[12px] text-amber-400/80 bg-amber-500/5 border-b border-amber-500/10"
          >
            {statusMessage}
            <button onClick={() => setStatusMessage(null)} className="ml-2 text-white/40 hover:text-white/60">&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.filter(m => m.role !== "system").map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%] sm:max-w-[80%]">
                  <div
                    className={`rounded-2xl px-4 py-3 text-[13px] sm:text-[14px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "liquid-glass-card-accent text-white/90 rounded-br-md"
                        : "liquid-glass-card text-white/70 rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <span className="text-[10px] uppercase tracking-[0.12em] text-violet-400/70 font-medium block mb-1">NOVA</span>
                    )}
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="liquid-glass-card rounded-2xl rounded-bl-md px-4 py-3">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-violet-400/70 font-medium block mb-1">NOVA</span>
                  <div className="flex items-center gap-1.5">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="shrink-0 px-4 sm:px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2">
        <div className="liquid-glass-input flex items-center gap-3 rounded-2xl px-4 py-3 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isStreaming ? "NOVA is thinking..." : t("placeholder")}
            disabled={isStreaming}
            maxLength={4000}
            className="h-10 w-full bg-transparent text-[14px] text-white placeholder:text-white/25 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="shrink-0 liquid-glass rounded-xl px-4 py-2 text-[12px] text-white/70 hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &rarr;
          </button>
        </div>
      </form>
    </main>
  );
}
