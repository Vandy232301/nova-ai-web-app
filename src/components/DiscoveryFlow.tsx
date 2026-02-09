"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export default function DiscoveryFlow({ onClose }: { onClose: () => void }) {
  const t = useTranslations("discovery");
  const locale = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  // Send message to Claude API
  const sendToAPI = useCallback(
    async (allMessages: ChatMessage[]) => {
      setIsStreaming(true);
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
            } catch { /* ignore incomplete chunks */ }
          }
        }

        // Check if the response contains a summary (project summary section)
        if (fullContent.includes("📋") || fullContent.toLowerCase().includes("project summary") || fullContent.toLowerCase().includes("next step")) {
          setShowSummary(true);
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
    [locale, scrollToBottom]
  );

  // Initial greeting — trigger Claude to start the conversation
  useEffect(() => {
    if (messages.length === 0) {
      // Send an initial "start" message to get Claude to greet and ask first question
      const initMessage: ChatMessage = {
        id: `user-init-${Date.now()}`,
        role: "user",
        content: `[System: The user just clicked "Start building" on the NOVA website. Begin the product discovery conversation. Greet them warmly and ask your first question. Respond in the language: ${locale}]`,
        createdAt: Date.now(),
      };
      // Don't show this system message in UI, but send it to API
      sendToAPI([initMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

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

  // Message count for progress estimation (typical discovery is ~14 exchanges)
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
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
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

          {/* Schedule call CTA — appears after summary */}
          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="pt-4 text-center space-y-3"
              >
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-8 py-3.5 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("scheduleCall")}
                  <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </Link>
                <p className="text-[13px] text-white/25">{t("scheduleSubtitle")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar — always visible */}
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
