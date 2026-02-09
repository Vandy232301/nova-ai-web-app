"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ChatMessage {
  id: string;
  role: "nova" | "user";
  content: string;
  options?: { key: string; label: string }[];
}

type Phase =
  | "greeting"
  | "project_type"
  | "industry"
  | "problem"
  | "description"
  | "audience"
  | "user_roles"
  | "features"
  | "integrations"
  | "design"
  | "scale"
  | "timeline"
  | "stage"
  | "budget"
  | "summary";

const PHASES: Phase[] = [
  "greeting", "project_type", "industry", "problem", "description",
  "audience", "user_roles", "features", "integrations", "design",
  "scale", "timeline", "stage", "budget", "summary",
];

export default function DiscoveryFlow({ onClose }: { onClose: () => void }) {
  const t = useTranslations("discovery");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<Phase>("greeting");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const addNovaMessage = useCallback(
    (content: string, options?: { key: string; label: string }[], delay = 600) => {
      setIsTyping(true);
      scrollToBottom();
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: `nova-${Date.now()}-${Math.random()}`, role: "nova", content, options },
        ]);
        scrollToBottom();
      }, delay);
    },
    [scrollToBottom]
  );

  const addUserMessage = useCallback(
    (content: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", content },
      ]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  const progress = Math.min((PHASES.indexOf(phase) / (PHASES.length - 1)) * 100, 100);

  // --- Option sets ---
  const projectTypeOpts = [
    { key: "webapp", label: t("opt_webapp") },
    { key: "mobile", label: t("opt_mobile") },
    { key: "saas", label: t("opt_saas") },
    { key: "dashboard", label: t("opt_dashboard") },
    { key: "ecommerce", label: t("opt_ecommerce") },
    { key: "other", label: t("opt_other") },
  ];
  const industryOpts = [
    { key: "healthcare", label: t("opt_healthcare") },
    { key: "fintech", label: t("opt_fintech") },
    { key: "education", label: t("opt_education") },
    { key: "retail", label: t("opt_retail") },
    { key: "realestate", label: t("opt_realestate") },
    { key: "logistics", label: t("opt_logistics") },
    { key: "hr", label: t("opt_hr") },
    { key: "media", label: t("opt_media") },
    { key: "otherindustry", label: t("opt_otherindustry") },
  ];
  const audienceOpts = [
    { key: "b2b", label: t("opt_b2b") },
    { key: "b2c", label: t("opt_b2c") },
    { key: "internal", label: t("opt_internal") },
    { key: "both", label: t("opt_both") },
  ];
  const stageOpts = [
    { key: "idea", label: t("opt_idea") },
    { key: "design", label: t("opt_design") },
    { key: "existing", label: t("opt_existing") },
    { key: "mvp", label: t("opt_mvp") },
  ];
  const budgetOpts = [
    { key: "under10", label: t("opt_under10") },
    { key: "10to25", label: t("opt_10to25") },
    { key: "25to50", label: t("opt_25to50") },
    { key: "50to100", label: t("opt_50to100") },
    { key: "over100", label: t("opt_over100") },
    { key: "unsure", label: t("opt_unsure") },
  ];
  const scaleOpts = [
    { key: "scale_small", label: t("opt_scale_small") },
    { key: "scale_medium", label: t("opt_scale_medium") },
    { key: "scale_large", label: t("opt_scale_large") },
    { key: "scale_massive", label: t("opt_scale_massive") },
    { key: "scale_unsure", label: t("opt_scale_unsure") },
  ];
  const timelineOpts = [
    { key: "timeline_1m", label: t("opt_timeline_1m") },
    { key: "timeline_3m", label: t("opt_timeline_3m") },
    { key: "timeline_6m", label: t("opt_timeline_6m") },
    { key: "timeline_12m", label: t("opt_timeline_12m") },
    { key: "timeline_flexible", label: t("opt_timeline_flexible") },
  ];

  // --- Initialization ---
  useEffect(() => {
    if (messages.length === 0) {
      const t1 = setTimeout(() => addNovaMessage(t("greetingMsg"), undefined, 400), 300);
      const t2 = setTimeout(() => {
        addNovaMessage(t("askProjectType"), projectTypeOpts, 1800);
        setPhase("project_type");
      }, 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Phase advance logic ---
  const advancePhase = useCallback(
    (currentPhase: Phase, _answerKey: string, answerDisplay: string) => {
      const newAnswers = { ...answers, [currentPhase]: answerDisplay };
      setAnswers(newAnswers);

      const ackDelay = 400;
      const askDelay = 1200;

      const ackThenAsk = (
        ackMsg: string,
        nextPhase: Phase,
        askMsg: string,
        opts?: { key: string; label: string }[],
        focusInput?: boolean
      ) => {
        setTimeout(() => addNovaMessage(ackMsg, undefined, ackDelay), 200);
        setTimeout(() => {
          addNovaMessage(askMsg, opts, askDelay);
          setPhase(nextPhase);
          if (focusInput) setTimeout(() => inputRef.current?.focus(), askDelay + 200);
        }, 700);
      };

      switch (currentPhase) {
        case "project_type":
          ackThenAsk(t("ackProjectType", { type: answerDisplay }), "industry", t("askIndustry"), industryOpts);
          break;
        case "industry":
          ackThenAsk(t("ackIndustry", { industry: answerDisplay }), "problem", t("askProblem"), undefined, true);
          break;
        case "problem":
          ackThenAsk(t("ackProblem"), "description", t("askDescription"), undefined, true);
          break;
        case "description":
          ackThenAsk(t("ackDescription"), "audience", t("askAudience"), audienceOpts);
          break;
        case "audience":
          ackThenAsk(t("ackAudience", { audience: answerDisplay }), "user_roles", t("askUserRoles"), undefined, true);
          break;
        case "user_roles":
          ackThenAsk(t("ackUserRoles"), "features", t("askFeatures"), undefined, true);
          break;
        case "features":
          ackThenAsk(t("ackFeatures"), "integrations", t("askIntegrations"), undefined, true);
          break;
        case "integrations":
          ackThenAsk(t("ackIntegrations"), "design", t("askDesign"), undefined, true);
          break;
        case "design":
          ackThenAsk(t("ackDesign"), "scale", t("askScale"), scaleOpts);
          break;
        case "scale":
          ackThenAsk(t("ackScale"), "timeline", t("askTimeline"), timelineOpts);
          break;
        case "timeline":
          ackThenAsk(t("ackTimeline"), "stage", t("askStage"), stageOpts);
          break;
        case "stage":
          ackThenAsk(t("ackStage"), "budget", t("askBudget"), budgetOpts);
          break;
        case "budget":
          setTimeout(() => addNovaMessage(t("ackBudget"), undefined, ackDelay), 200);
          setTimeout(() => {
            addNovaMessage(t("summaryIntro"), undefined, askDelay);
            setPhase("summary");
          }, 700);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, addNovaMessage, t]
  );

  const handleOption = (key: string, label: string) => {
    if (isTyping) return;
    addUserMessage(label);
    advancePhase(phase, key, label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    setInput("");
    addUserMessage(text);
    advancePhase(phase, text, text);
  };

  const freeTextPhases: Phase[] = ["problem", "description", "user_roles", "features", "integrations", "design"];
  const isFreeTextPhase = freeTextPhases.includes(phase);

  const placeholders: Partial<Record<Phase, string>> = {
    problem: t("problemPlaceholder"),
    description: t("descriptionPlaceholder"),
    user_roles: t("userRolesPlaceholder"),
    features: t("featuresPlaceholder"),
    integrations: t("integrationsPlaceholder"),
    design: t("designPlaceholder"),
  };

  // Summary labels
  const summaryRows = [
    { key: "summaryType", phase: "project_type" },
    { key: "summaryIndustry", phase: "industry" },
    { key: "summaryProblem", phase: "problem" },
    { key: "summaryDescription", phase: "description" },
    { key: "summaryAudience", phase: "audience" },
    { key: "summaryUserRoles", phase: "user_roles" },
    { key: "summaryFeatures", phase: "features" },
    { key: "summaryIntegrations", phase: "integrations" },
    { key: "summaryDesign", phase: "design" },
    { key: "summaryScale", phase: "scale" },
    { key: "summaryTimeline", phase: "timeline" },
    { key: "summaryStage", phase: "stage" },
    { key: "summaryBudget", phase: "budget" },
  ];

  return (
    <div className="relative z-10 flex w-full flex-1 flex-col items-center px-3 sm:px-8 pt-20 sm:pt-24 pb-4">
      <div className="w-full max-w-2xl flex flex-col flex-1">
        {/* Progress bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex-shrink-0">
          <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
              animate={{ width: `${progress}%` }}
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
                    className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-[13px] sm:text-[15px] leading-relaxed ${
                      msg.role === "user"
                        ? "liquid-glass-card-accent text-white/90 rounded-br-md"
                        : "liquid-glass-card text-white/70 rounded-bl-md"
                    }`}
                  >
                    {msg.role === "nova" && (
                      <span className="text-[11px] uppercase tracking-[0.12em] text-violet-400/70 font-medium block mb-1.5">NOVA</span>
                    )}
                    {msg.content}
                  </div>
                  {msg.options && msg.options.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="flex flex-wrap gap-2 mt-3"
                    >
                      {msg.options.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => handleOption(opt.key, opt.label)}
                          disabled={isTyping}
                          className="liquid-glass rounded-full px-4 py-2 text-[13px] text-white/60 hover:text-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="liquid-glass-card rounded-2xl rounded-bl-md px-5 py-3.5">
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

          {/* Summary card */}
          <AnimatePresence>
            {phase === "summary" && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="pt-4"
              >
                <div className="liquid-glass-card rounded-2xl p-6 sm:p-8 space-y-4 mb-8">
                  {summaryRows.map((row, i) => {
                    const value = answers[row.phase];
                    if (!value) return null;
                    return (
                      <div key={i} className={i < summaryRows.length - 1 ? "pb-4 border-b border-white/[0.05]" : ""}>
                        <div className="text-[11px] uppercase tracking-[0.15em] text-white/25 mb-1">{t(row.key)}</div>
                        <div className="text-[14px] text-white/75 leading-relaxed">{value}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center space-y-3">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 liquid-glass-cta px-8 py-3.5 text-[14px] font-medium text-white hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t("scheduleCall")}
                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </Link>
                  <p className="text-[13px] text-white/25">{t("scheduleSubtitle")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <AnimatePresence>
          {isFreeTextPhase && !isTyping && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="flex-shrink-0 mt-2"
            >
              <div className="liquid-glass-input flex items-center gap-3 rounded-2xl px-5 py-3">
                <input
                  ref={inputRef}
                  autoFocus
                  spellCheck={false}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholders[phase] || ""}
                  className="h-10 w-full bg-transparent text-[14px] tracking-tight text-white placeholder:text-white/25 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="shrink-0 liquid-glass rounded-xl px-4 py-2 text-[12px] text-white/70 hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &rarr;
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
