"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface QuickReply {
  label: string;
}

export default function DiscoveryFlow({ onClose }: { onClose: () => void }) {
  const t = useTranslations("discovery");
  const locale = useLocale();
  const calendarLink =
    (process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_LINK as string | undefined) || "/contact";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const hasSentReport = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return;
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  // Quick reply option sets based on detected topics
  const optionSets = useMemo(() => ({
    projectType: [
      { label: t("opt_webapp") },
      { label: t("opt_mobile") },
      { label: t("opt_saas") },
      { label: t("opt_dashboard") },
      { label: t("opt_ecommerce") },
      { label: t("opt_other") },
    ],
    industry: [
      { label: t("opt_healthcare") },
      { label: t("opt_fintech") },
      { label: t("opt_education") },
      { label: t("opt_retail") },
      { label: t("opt_logistics") },
      { label: t("opt_hr") },
      { label: t("opt_media") },
      { label: t("opt_otherindustry") },
    ],
    audience: [
      { label: t("opt_b2b") },
      { label: t("opt_b2c") },
      { label: t("opt_internal") },
      { label: t("opt_both") },
    ],
    stage: [
      { label: t("opt_idea") },
      { label: t("opt_design") },
      { label: t("opt_existing") },
      { label: t("opt_mvp") },
    ],
    budget: [
      { label: t("opt_under10") },
      { label: t("opt_10to25") },
      { label: t("opt_25to50") },
      { label: t("opt_50to100") },
      { label: t("opt_over100") },
      { label: t("opt_unsure") },
    ],
    scale: [
      { label: t("opt_scale_small") },
      { label: t("opt_scale_medium") },
      { label: t("opt_scale_large") },
      { label: t("opt_scale_massive") },
      { label: t("opt_scale_unsure") },
    ],
    timeline: [
      { label: t("opt_timeline_1m") },
      { label: t("opt_timeline_3m") },
      { label: t("opt_timeline_6m") },
      { label: t("opt_timeline_12m") },
      { label: t("opt_timeline_flexible") },
    ],
  }), [t]);

  // Detect which quick replies to show based on Claude's response
  const detectQuickReplies = useCallback((text: string): QuickReply[] => {
    const lower = text.toLowerCase();

    // Project type detection
    if (
      (lower.includes("web app") || lower.includes("mobile app") || lower.includes("saas") || lower.includes("e-commerce") || lower.includes("dashboard")) &&
      (lower.includes("what type") || lower.includes("quel type") || lower.includes("ce tip") || lower.includes("welche art") || lower.includes("qué tipo") || lower.includes("che tipo") || lower.includes("какой тип") || lower.includes("什么类型") || lower.includes("どのタイプ") || lower.includes("looking to build") || lower.includes("thinking about") || lower.includes("thinking of"))
    ) {
      return optionSets.projectType;
    }

    // Industry detection
    if (
      lower.includes("industry") || lower.includes("domain") || lower.includes("sector") ||
      lower.includes("industrie") || lower.includes("domeniu") || lower.includes("domaine") ||
      lower.includes("branche") || lower.includes("settore") || lower.includes("отрасл") ||
      lower.includes("行业") || lower.includes("業界")
    ) {
      return optionSets.industry;
    }

    // Audience detection
    if (
      (lower.includes("who") && (lower.includes("user") || lower.includes("using") || lower.includes("audience") || lower.includes("target"))) ||
      lower.includes("b2b") || lower.includes("b2c") ||
      lower.includes("cine") || lower.includes("utilizator") ||
      lower.includes("qui") || lower.includes("utilisera") ||
      lower.includes("wer") || lower.includes("nutzen") ||
      lower.includes("quién") || lower.includes("chi") ||
      lower.includes("кто") || lower.includes("谁") || lower.includes("誰")
    ) {
      return optionSets.audience;
    }

    // Stage detection
    if (
      (lower.includes("where are you") && (lower.includes("process") || lower.includes("project") || lower.includes("currently"))) ||
      lower.includes("current stage") || lower.includes("right now with") ||
      lower.includes("unde ești") || lower.includes("stadiu") ||
      lower.includes("où en êtes") || lower.includes("wo stehen") ||
      lower.includes("dónde estás") || lower.includes("dove sei") ||
      lower.includes("на каком этапе") || lower.includes("目前") || lower.includes("現在どの")
    ) {
      return optionSets.stage;
    }

    // Budget detection
    if (
      lower.includes("budget") || lower.includes("buget") || lower.includes("budgétaire") ||
      lower.includes("presupuesto") || lower.includes("бюджет") || lower.includes("预算") || lower.includes("予算")
    ) {
      return optionSets.budget;
    }

    // Scale / users detection
    if (
      (lower.includes("how many") && lower.includes("user")) ||
      lower.includes("expect in the first year") ||
      lower.includes("câți utilizatori") || lower.includes("combien d'utilisateurs") ||
      lower.includes("wie viele") || lower.includes("cuántos usuarios") ||
      lower.includes("quanti utenti") || lower.includes("сколько пользователей") ||
      lower.includes("多少用户") || lower.includes("何人のユーザー")
    ) {
      return optionSets.scale;
    }

    // Timeline detection
    if (
      (lower.includes("timeline") || lower.includes("when") || lower.includes("deadline")) &&
      (lower.includes("ready") || lower.includes("first version") || lower.includes("launch") || lower.includes("ideal")) ||
      lower.includes("când") || lower.includes("calendrier") || lower.includes("zeitrahmen") ||
      lower.includes("cronograma") || lower.includes("таймлайн") || lower.includes("时间") || lower.includes("タイムライン")
    ) {
      return optionSets.timeline;
    }

    return [];
  }, [optionSets]);

  // Send message to Claude API
  const sendToAPI = useCallback(
    async (allMessages: ChatMessage[]) => {
      setIsStreaming(true);
      setQuickReplies([]);
      scrollToBottom();

      const assistantId = `assistant-${Date.now()}`;
      let fullContent = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
            })),
            locale,
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!response.body) { setIsStreaming(false); return; }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const pushAssistant = (content: string) => {
          setMessages((prev) => {
            const others = prev.filter((m) => m.id !== assistantId);
            return [
              ...others,
              { id: assistantId, role: "assistant", content, createdAt: Date.now() },
            ];
          });
          scrollToBottom();
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            if (buffer.trim()) {
              try {
                const parsed = JSON.parse(buffer.trim());
                if (parsed.type === "text") {
                  fullContent += parsed.content;
                  pushAssistant(fullContent);
                } else if (parsed.type === "done") {
                  fullContent = parsed.finalMessage.content;
                  pushAssistant(fullContent);
                }
              } catch { /* ignore */ }
            }
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.type === "text") {
                fullContent += parsed.content;
                pushAssistant(fullContent);
              } else if (parsed.type === "done") {
                fullContent = parsed.finalMessage.content;
                pushAssistant(fullContent);
              } else if (parsed.type === "error") {
                pushAssistant("Something went wrong. Please try again.");
              }
            } catch { /* ignore */ }
          }
        }

        // Check for summary
        if (
          fullContent.includes("📋") ||
          fullContent.toLowerCase().includes("project summary") ||
          fullContent.toLowerCase().includes("next step")
        ) {
          setShowSummary(true);
        }

        // Detect and show quick replies
        const detected = detectQuickReplies(fullContent);
        if (detected.length > 0) {
          setQuickReplies(detected);
        }

        reader.releaseLock();
      } catch (error) {
        console.error("API error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "I'm having trouble connecting right now. Please try again in a moment.",
            createdAt: Date.now(),
          },
        ]);
      } finally {
        setIsStreaming(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [locale, scrollToBottom, detectQuickReplies]
  );

  // Check if user returned from calendar booking
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("scheduled") === "true") {
        setIsScheduled(true);
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      }
      // Also check sessionStorage
      if (sessionStorage.getItem("nova_scheduled") === "true") {
        setIsScheduled(true);
        sessionStorage.removeItem("nova_scheduled");
      }
    }
  }, []);

  // Initial greeting - start immediately without delay
  useEffect(() => {
    if (messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      // Use requestIdleCallback for non-blocking initialization
      const initializeChat = () => {
        const initMessage: ChatMessage = {
          id: `user-init-${Date.now()}`,
          role: "user",
          content: `[System: The user just clicked "Start building" on the NOVA website. Begin the product discovery conversation. Greet them warmly and ask your first question. Respond in the language: ${locale}]`,
          createdAt: Date.now(),
        };
        sendToAPI([initMessage]);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(initializeChat, { timeout: 100 });
      } else {
        setTimeout(initializeChat, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle quick reply click
  const handleQuickReply = (label: string) => {
    if (isStreaming) return;
    setQuickReplies([]);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: label,
      createdAt: Date.now(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    sendToAPI(newMessages);
  };

  // Handle text submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    setQuickReplies([]);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    sendToAPI(newMessages);
  };

  // Progress estimation
  const messageCount = messages.filter((m) => m.role === "user").length;
  const estimatedProgress = Math.min((messageCount / 13) * 100, showSummary ? 100 : 95);

  return (
    <div className="relative z-10 flex w-full flex-1 flex-col items-center px-3 sm:px-8 pt-20 sm:pt-24 pb-4">
      <div className="w-full max-w-2xl flex flex-col flex-1">
        {/* Progress bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex-shrink-0">
          <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
              animate={{ width: `${estimatedProgress}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>

        {/* Chat area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pb-4 nova-scroll-fade"
          style={{ maxHeight: "calc(100dvh - 180px)" }}
        >
          {/* Initial loading state - show while waiting for first NOVA message */}
          {messages.length === 0 && isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center py-12 space-y-6 min-h-[60vh]"
            >
              {/* NOVA portrait image */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-[180px] sm:max-w-[220px] aspect-square rounded-2xl overflow-hidden"
              >
                <Image
                  src="/nova-loading.png"
                  alt="NOVA"
                  fill
                  className="object-cover"
                  priority
                  quality={90}
                />
                {/* Subtle overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/60 via-transparent to-transparent" />
              </motion.div>

              {/* Animated text */}
              <div className="space-y-2 text-center px-4">
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[14px] text-white/70 font-medium"
                >
                  NOVA is preparing your session...
                </motion.p>
                <div className="flex items-center gap-1.5 justify-center">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400/60"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400/60"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400/60"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[90%] sm:max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-[13px] sm:text-[15px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "liquid-glass-card-accent text-white/90 rounded-br-md"
                        : "liquid-glass-card text-white/70 rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <span className="text-[11px] uppercase tracking-[0.12em] text-violet-400/70 font-medium block mb-1.5">NOVA</span>
                    )}
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isStreaming && messages.length > 0 && messages[messages.length - 1]?.role !== "assistant" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="liquid-glass-card rounded-2xl rounded-bl-md px-4 py-3 sm:px-5 sm:py-3.5">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-violet-400/70 font-medium block mb-1.5">NOVA</span>
                  <div className="flex items-center gap-1.5">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-violet-400/50" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-violet-400/50" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-violet-400/50" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick reply buttons */}
          <AnimatePresence>
            {quickReplies.length > 0 && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap gap-2 pt-1"
              >
                {quickReplies.map((qr, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    onClick={() => handleQuickReply(qr.label)}
                    className="liquid-glass rounded-full px-4 py-2 text-[13px] text-white/60 hover:text-white/90 transition-all hover:scale-[1.03] active:scale-[0.97]"
                  >
                    {qr.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thank you message after scheduling */}
          <AnimatePresence>
            {isScheduled && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="pt-4 text-center space-y-4"
              >
                <div className="liquid-glass-card rounded-2xl px-6 py-5 space-y-3">
                  <h3 className="text-lg font-semibold text-white">{t("thankYouTitle")}</h3>
                  <p className="text-[14px] leading-relaxed text-white/70">{t("thankYouMessage")}</p>
                  <p className="text-[15px] font-medium text-violet-400">{t("seeYouAtCall")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Schedule call CTA */}
          <AnimatePresence>
            {showSummary && !isScheduled && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="pt-4 text-center space-y-4"
              >
                {/* Email input (optional) */}
                <div className="space-y-2">
                  <label htmlFor="user-email" className="block text-[12px] text-white/40 text-left px-1">
                    {t("emailLabel")}
                  </label>
                  <input
                    ref={emailInputRef}
                    id="user-email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                  <p className="text-[11px] text-white/30 px-1">{t("emailDescription")}</p>
                </div>

                <a
                  href={calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Mark as scheduled when user clicks (they'll complete booking externally)
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem("nova_scheduled", "true");
                    }
                    
                    // Send discovery report email to NOVA team when user schedules call
                    if (!hasSentReport.current) {
                      hasSentReport.current = true;
                      (async () => {
                        try {
                          // Get the final assistant message (summary) - find last assistant message
                          const assistantMessages = messages.filter((m) => m.role === "assistant");
                          const finalMessage = assistantMessages.length > 0 
                            ? assistantMessages[assistantMessages.length - 1].content 
                            : "";
                          
                          await fetch("/api/discovery/report", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              locale,
                              messages: messages,
                              finalAssistantMessage: finalMessage,
                              userEmail: userEmail || undefined,
                            }),
                          });
                        } catch (err) {
                          console.error("Failed to send discovery report:", err);
                        }
                      })();
                    }
                  }}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-8 py-3.5 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("scheduleCall")}
                  <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </a>
                <p className="text-[13px] text-white/25">{t("scheduleSubtitle")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="flex-shrink-0 mt-2"
        >
          <div className="liquid-glass-input flex items-center gap-3 rounded-2xl px-4 sm:px-5 py-3">
            <input
              ref={inputRef}
              autoFocus
              spellCheck={false}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isStreaming ? "..." : t("inputPlaceholder")}
              disabled={isStreaming}
              className="h-10 w-full bg-transparent text-[14px] tracking-tight text-white placeholder:text-white/25 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="shrink-0 liquid-glass rounded-xl px-4 py-2 text-[12px] text-white/70 hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &rarr;
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
