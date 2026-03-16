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
  const [isScheduled, setIsScheduled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    heardFrom: "",
  });
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    heardFrom: "",
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const hasSentReport = useRef(false);
  const lastMessageTime = useRef<number>(0);
  const messageCount = useRef<number>(0);
  const sessionStartTime = useRef<number>(Date.now());

  // Client-side rate limiting: minimum 500ms between messages (barely noticeable)
  // These limits prevent rapid automated requests while allowing natural conversation
  const MESSAGE_COOLDOWN_MS = 500; // Half a second - natural typing speed is slower
  const MAX_MESSAGES_PER_SESSION = 60; // Increased for longer discovery conversations
  const MAX_MESSAGE_LENGTH = 2000; // Very generous - normal messages are much shorter

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 max length
  };

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters except + for international format
    const cleaned = phone.replace(/[^\d+]/g, "");
    // Valid phone: 7-15 digits (international format), can start with +
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    return phoneRegex.test(cleaned) && cleaned.length >= 7 && cleaned.length <= 15;
  };

  const validateFullName = (name: string): boolean => {
    // Name should be 2-100 characters, contain only letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/;
    return nameRegex.test(name.trim());
  };

  const sanitizeInput = (input: string): string => {
    // Remove potential XSS vectors
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .trim()
      .slice(0, 500); // Max length limit
  };

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
  // Buttons must match the actual question topic (no audience buttons when NOVA asks about design, game elements, etc.)
  const detectQuickReplies = useCallback((text: string): QuickReply[] => {
    const lower = text.toLowerCase();

    // Exclude quick replies when NOVA is asking about design, visuals, game mechanics, or integrations
    const isAboutDesign =
      lower.includes("design") || lower.includes("visual") || lower.includes("theme") || lower.includes("look and feel") ||
      lower.includes("minimal") || lower.includes("colorful") || lower.includes("inspiration") || lower.includes("wireframe");
    const isAboutGameMechanics =
      lower.includes("game element") || lower.includes("level up") || lower.includes("achievement") || lower.includes("badge") ||
      lower.includes("challenge") || lower.includes("reward") || lower.includes("gamif");
    const isAboutIntegration =
      lower.includes("integration") || lower.includes("external service") || lower.includes("api") || lower.includes("third-party");
    if (isAboutDesign || isAboutGameMechanics || isAboutIntegration) {
      return [];
    }

    // Project type detection
    if (
      (lower.includes("web app") || lower.includes("mobile app") || lower.includes("saas") || lower.includes("e-commerce") || lower.includes("dashboard")) &&
      (lower.includes("what type") || lower.includes("quel type") || lower.includes("ce tip") || lower.includes("welche art") || lower.includes("qué tipo") || lower.includes("che tipo") || lower.includes("looking to build") || lower.includes("thinking about") || lower.includes("thinking of"))
    ) {
      return optionSets.projectType;
    }

    // Industry detection – only when clearly asking about industry/sector
    if (
      lower.includes("industry") || lower.includes("sector") || lower.includes("vertical") ||
      lower.includes("industrie") || lower.includes("domeniu") || lower.includes("domaine") ||
      lower.includes("branche") || lower.includes("settore") || lower.includes("行业") || lower.includes("業界")
    ) {
      return optionSets.industry;
    }

    // Audience detection – only when NOVA clearly asks WHO the product is for (target audience), not when "user" appears in other contexts
    const asksTargetAudience =
      lower.includes("target audience") || lower.includes("who will use") || lower.includes("who will be using") ||
      lower.includes("who is this for") || lower.includes("who are your users") || lower.includes("who are the users") ||
      lower.includes("businesses or consumers") || lower.includes("b2b or b2c") || lower.includes("b2b and b2c") ||
      (lower.includes("who") && (lower.includes("audience") || lower.includes("target market") || lower.includes("end user")));
    const hasExplicitB2B2C =
      (lower.includes("b2b") || lower.includes("b2c")) &&
      (lower.includes("?") || lower.includes("choose") || lower.includes("select") || lower.includes("prefer"));
    if (asksTargetAudience || hasExplicitB2B2C) {
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

  const novaApiUrl = process.env.NEXT_PUBLIC_NOVA_API_URL;

  // Send message to Nova via OpenClaw proxy (SSE streaming)
  const sendToAPI = useCallback(
    async (allMessages: ChatMessage[]) => {
      setIsStreaming(true);
      setQuickReplies([]);
      scrollToBottom();

      const assistantId = `assistant-${Date.now()}`;
      let fullContent = "";

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

      try {
        const apiEndpoint = novaApiUrl
          ? `${novaApiUrl}/v1/chat/public`
          : "/api/chat";

        const chatMessages = allMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatMessages,
            locale,
          }),
        });

        if (response.status === 429) {
          const errBody = await response.json().catch(() => ({}));
          const waitTime = errBody.retryAfter || 60;
          setIsStreaming(false);
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-rate-limit-${Date.now()}`,
              role: "assistant",
              content: `Rate limit exceeded. Please wait ${waitTime} second${waitTime > 1 ? "s" : ""} before sending another message.`,
              createdAt: Date.now(),
            },
          ]);
          return;
        }

        if (!response.ok) {
          if (response.status === 400) {
            setIsStreaming(false);
            setMessages((prev) => [
              ...prev,
              {
                id: `assistant-error-${Date.now()}`,
                role: "assistant",
                content: "Invalid request. Please check your message and try again.",
                createdAt: Date.now(),
              },
            ]);
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        if (!response.body) { setIsStreaming(false); return; }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const isSSE = response.headers.get("content-type")?.includes("text/event-stream");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (isSSE) {
              if (trimmed === "data: [DONE]") continue;
              if (!trimmed.startsWith("data: ")) continue;
              try {
                const json = JSON.parse(trimmed.slice(6));
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  pushAssistant(fullContent);
                }
              } catch { /* ignore parse errors */ }
            } else {
              try {
                const parsed = JSON.parse(trimmed);
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
        }

        if (buffer.trim() && isSSE) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                pushAssistant(fullContent);
              }
            } catch {}
          }
        }

        const lower = fullContent.toLowerCase();
        if (
          fullContent.includes("📋") ||
          lower.includes("project summary") ||
          lower.includes("here's your summary") ||
          lower.includes("ready to schedule") ||
          (lower.includes("next step") && lower.includes("schedule"))
        ) {
          setShowSummary(true);
        }

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
    [locale, scrollToBottom, detectQuickReplies, novaApiUrl]
  );

  // Send discovery report email to NOVA team
  const sendDiscoveryReport = useCallback(async () => {
    if (hasSentReport.current) return;
    hasSentReport.current = true;
    
    try {
      // Get form data from sessionStorage if available
      let formDataFromStorage = null;
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("nova_form_data");
        if (stored) {
          try {
            formDataFromStorage = JSON.parse(stored);
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

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
          userEmail: formDataFromStorage?.email || undefined,
          formData: formDataFromStorage || undefined,
        }),
      });
    } catch (err) {
      console.error("Failed to send discovery report:", err);
    }
  }, [locale, messages]);

  // Check if user returned from calendar booking and send report
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkScheduled = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("scheduled") === "true") {
        setIsScheduled(true);
        sendDiscoveryReport();
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
        return true;
      }
      // Also check sessionStorage (both "pending" and "true" indicate user went to calendar)
      const scheduledStatus = sessionStorage.getItem("nova_scheduled");
      if (scheduledStatus === "true" || scheduledStatus === "pending") {
        setIsScheduled(true);
        sendDiscoveryReport();
        sessionStorage.removeItem("nova_scheduled");
        return true;
      }
      return false;
    };

    // Check immediately
    checkScheduled();

    // Listen for window focus (user returns to tab after booking)
    const handleFocus = () => {
      // Small delay to allow Google Calendar redirect to set sessionStorage
      setTimeout(() => {
        const scheduledStatus = sessionStorage.getItem("nova_scheduled");
        if ((scheduledStatus === "true" || scheduledStatus === "pending") && !isScheduled) {
          setIsScheduled(true);
          sendDiscoveryReport();
          sessionStorage.removeItem("nova_scheduled");
        }
      }, 1000);
    };

    // Also poll periodically to catch when user returns (in case focus event doesn't fire)
    let pollInterval: NodeJS.Timeout | null = null;
    pollInterval = setInterval(() => {
      const scheduledStatus = sessionStorage.getItem("nova_scheduled");
      if ((scheduledStatus === "true" || scheduledStatus === "pending") && !isScheduled) {
        setIsScheduled(true);
        sendDiscoveryReport();
        sessionStorage.removeItem("nova_scheduled");
        if (pollInterval) clearInterval(pollInterval);
      }
    }, 2000);

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isScheduled, sendDiscoveryReport]);

  // Initial greeting - start immediately without delay
  useEffect(() => {
    if (messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const initializeChat = () => {
        const initMessage: ChatMessage = {
          id: `user-init-${Date.now()}`,
          role: "user",
          content: locale === "en"
            ? "Hi, I want to build something!"
            : locale === "ro"
              ? "Salut, vreau să construiesc ceva!"
              : locale === "fr"
                ? "Bonjour, je veux créer quelque chose !"
                : locale === "de"
                  ? "Hallo, ich möchte etwas bauen!"
                  : locale === "es"
                    ? "¡Hola, quiero construir algo!"
                    : "Hi, I want to build something!",
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

    // Check cooldown
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime.current;
    if (timeSinceLastMessage < MESSAGE_COOLDOWN_MS) {
      return; // Silently ignore if too soon
    }

    // Check message count (very generous limit)
    if (messageCount.current >= MAX_MESSAGES_PER_SESSION) {
      alert(`You've reached the maximum number of messages for this session (${MAX_MESSAGES_PER_SESSION}). This helps us maintain service quality. Please refresh the page to start a new conversation.`);
      return;
    }

    // Update tracking
    lastMessageTime.current = now;
    messageCount.current += 1;

    setQuickReplies([]);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: label,
      createdAt: now,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    sendToAPI(newMessages);
  };

  // Handle text submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    // Validation checks
    if (!trimmedInput || isStreaming) return;

    // Check message length
    if (trimmedInput.length > MAX_MESSAGE_LENGTH) {
      alert(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
      return;
    }

    // Check cooldown between messages (very short - only prevents rapid automated requests)
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime.current;
    if (timeSinceLastMessage < MESSAGE_COOLDOWN_MS && lastMessageTime.current > 0) {
      // Only show warning if user is trying to send messages too rapidly (likely automated)
      // Normal users type slower than 500ms between messages
      return; // Silently ignore - user won't notice this in normal usage
    }

    // Check total message count per session (very generous limit)
    if (messageCount.current >= MAX_MESSAGES_PER_SESSION) {
      alert(`You've reached the maximum number of messages for this session (${MAX_MESSAGES_PER_SESSION}). This helps us maintain service quality. Please refresh the page to start a new conversation.`);
      return;
    }

    // Check for suspicious patterns (client-side)
    const suspiciousPatterns = [
      /(.)\1{20,}/, // Repeated characters
      /.{500,}/, // Very long single word
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(trimmedInput))) {
      alert("Invalid message format. Please rephrase your message.");
      return;
    }

    // Update tracking
    lastMessageTime.current = now;
    messageCount.current += 1;

    setQuickReplies([]);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      createdAt: now,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    sendToAPI(newMessages);
  };

  // Progress estimation
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const estimatedProgress = Math.min((userMessageCount / 13) * 100, showSummary ? 100 : 95);

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
          style={{ maxHeight: "calc(100dvh - 180px)", overflowX: "visible" }}
        >
          {/* Thank you message after scheduling - hide conversation */}
          <AnimatePresence>
            {isScheduled && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center min-h-[60vh] pt-12 px-4"
              >
                {/* NOVA portrait image */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="relative w-full max-w-[180px] sm:max-w-[220px] aspect-square rounded-2xl overflow-hidden mb-6"
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

                <div className="liquid-glass-card rounded-2xl px-6 py-8 space-y-4 max-w-md text-center">
                  <h3 className="text-xl font-semibold text-white">{t("thankYouTitle") || "Thank You!"}</h3>
                  <p className="text-[15px] leading-relaxed text-white/70">
                    {t("thankYouMessage") || "We've received your information and are excited to learn more about your project."}
                  </p>
                  <p className="text-[16px] font-medium text-violet-400 mt-4">
                    {t("seeYouAtCall") || "We can't wait to meet you at the Discovery Call!"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Initial loading state - show while waiting for first NOVA message */}
          {messages.length === 0 && isStreaming && !isScheduled && (
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
            {!isScheduled && messages.map((msg) => (
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
            {!isScheduled && isStreaming && messages.length > 0 && messages[messages.length - 1]?.role !== "assistant" && (
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
            {!isScheduled && quickReplies.length > 0 && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap gap-2 pt-1 pl-1 pr-1"
                style={{ overflow: "visible", marginLeft: "-4px", marginRight: "-4px", paddingLeft: "8px", paddingRight: "8px" }}
              >
                {quickReplies.map((qr, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    onClick={() => handleQuickReply(qr.label)}
                    className="liquid-glass rounded-full px-4 py-2 text-[13px] text-white/60 hover:text-white/90 transition-all hover:scale-[1.03] active:scale-[0.97]"
                    style={{ transformOrigin: "center" }}
                  >
                    {qr.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Schedule call form */}
          <AnimatePresence>
            {showSummary && !isScheduled && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="pt-4 space-y-4"
              >
                <div className="liquid-glass-card rounded-2xl px-5 py-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white text-center mb-2">
                    {t("scheduleCall") || "Schedule Your Discovery Call"}
                  </h3>
                  
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      
                      // Validate all fields
                      const errors = {
                        fullName: "",
                        email: "",
                        phone: "",
                        heardFrom: "",
                      };

                      // Validate Full Name
                      if (!formData.fullName.trim()) {
                        errors.fullName = t("formErrorRequired") || "This field is required";
                      } else if (!validateFullName(formData.fullName)) {
                        errors.fullName = t("formErrorInvalidName") || "Please enter a valid name (2-100 characters, letters only)";
                      }

                      // Validate Email
                      if (!formData.email.trim()) {
                        errors.email = t("formErrorRequired") || "This field is required";
                      } else if (!validateEmail(formData.email)) {
                        errors.email = t("formErrorInvalidEmail") || "Please enter a valid email address";
                      }

                      // Validate Phone
                      if (!formData.phone.trim()) {
                        errors.phone = t("formErrorRequired") || "This field is required";
                      } else if (!validatePhone(formData.phone)) {
                        errors.phone = t("formErrorInvalidPhone") || "Please enter a valid phone number (7-15 digits)";
                      }

                      // Validate Heard From
                      if (!formData.heardFrom) {
                        errors.heardFrom = t("formErrorRequired") || "Please select an option";
                      }

                      setFormErrors(errors);

                      // If there are errors, don't submit
                      if (Object.values(errors).some(err => err !== "")) {
                        return;
                      }

                      // Sanitize form data before storing
                      const sanitizedData = {
                        fullName: sanitizeInput(formData.fullName),
                        email: sanitizeInput(formData.email).toLowerCase(),
                        phone: sanitizeInput(formData.phone),
                        heardFrom: sanitizeInput(formData.heardFrom),
                      };

                      // Mark that user is going to schedule
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("nova_scheduled", "pending");
                        sessionStorage.setItem("nova_form_data", JSON.stringify(sanitizedData));
                      }
                      // Open Google Calendar
                      window.open(calendarLink, "_blank");
                    }}
                    className="space-y-4"
                  >
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className="block text-[12px] text-white/60 mb-1.5">
                        {t("formFullName") || "Full Name"}
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        maxLength={100}
                        value={formData.fullName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, fullName: value });
                          // Clear error when user starts typing
                          if (formErrors.fullName) {
                            setFormErrors({ ...formErrors, fullName: "" });
                          }
                        }}
                        onBlur={() => {
                          if (formData.fullName && !validateFullName(formData.fullName)) {
                            setFormErrors({
                              ...formErrors,
                              fullName: t("formErrorInvalidName") || "Please enter a valid name (2-100 characters, letters only)",
                            });
                          }
                        }}
                        placeholder={t("formFullNamePlaceholder") || "John Doe"}
                        className={`w-full liquid-glass-input rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 ${
                          formErrors.fullName ? "focus:ring-red-500/50 border-red-500/30" : "focus:ring-violet-500/50"
                        }`}
                      />
                      {formErrors.fullName && (
                        <p className="text-[11px] text-red-400 mt-1">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-[12px] text-white/60 mb-1.5">
                        {t("formEmail") || "Email"}
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        maxLength={254}
                        value={formData.email}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase();
                          setFormData({ ...formData, email: value });
                          // Clear error when user starts typing
                          if (formErrors.email) {
                            setFormErrors({ ...formErrors, email: "" });
                          }
                        }}
                        onBlur={() => {
                          if (formData.email && !validateEmail(formData.email)) {
                            setFormErrors({
                              ...formErrors,
                              email: t("formErrorInvalidEmail") || "Please enter a valid email address",
                            });
                          }
                        }}
                        placeholder={t("formEmailPlaceholder") || "john@example.com"}
                        className={`w-full liquid-glass-input rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 ${
                          formErrors.email ? "focus:ring-red-500/50 border-red-500/30" : "focus:ring-violet-500/50"
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-red-400 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-[12px] text-white/60 mb-1.5">
                        {t("formPhone") || "Phone"}
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        maxLength={20}
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, phone: value });
                          // Clear error when user starts typing
                          if (formErrors.phone) {
                            setFormErrors({ ...formErrors, phone: "" });
                          }
                        }}
                        onBlur={() => {
                          if (formData.phone && !validatePhone(formData.phone)) {
                            setFormErrors({
                              ...formErrors,
                              phone: t("formErrorInvalidPhone") || "Please enter a valid phone number (7-15 digits)",
                            });
                          }
                        }}
                        placeholder={t("formPhonePlaceholder") || "+1 234 567 8900"}
                        className={`w-full liquid-glass-input rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 ${
                          formErrors.phone ? "focus:ring-red-500/50 border-red-500/30" : "focus:ring-violet-500/50"
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[11px] text-red-400 mt-1">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Heard From */}
                    <div>
                      <label className="block text-[12px] text-white/60 mb-2">
                        {t("formHeardFrom") || "How did you hear about NOVA?"}
                      </label>
                      <div className="space-y-2">
                        {[
                          t("formHeardFromGoogle") || "Google Search",
                          t("formHeardFromSocial") || "Social Media",
                          t("formHeardFromReferral") || "Referral",
                          t("formHeardFromOther") || "Other",
                        ].map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <input
                              type="radio"
                              name="heardFrom"
                              value={option}
                              checked={formData.heardFrom === option}
                              onChange={(e) => {
                                setFormData({ ...formData, heardFrom: e.target.value });
                                // Clear error when user selects
                                if (formErrors.heardFrom) {
                                  setFormErrors({ ...formErrors, heardFrom: "" });
                                }
                              }}
                              required
                              className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
                            />
                            <span className="text-[13px] text-white/70 group-hover:text-white/90 transition-colors">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                      {formErrors.heardFrom && (
                        <p className="text-[11px] text-red-400 mt-1">{formErrors.heardFrom}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-8 py-3.5 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      {t("scheduleCall") || "Schedule Call"}
                      <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar - hide when scheduled */}
        {!isScheduled && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
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
              maxLength={MAX_MESSAGE_LENGTH}
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
        )}
      </div>
    </div>
  );
}
