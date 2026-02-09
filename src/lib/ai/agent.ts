import { AgentState, Message, StreamChunk } from "./types";

const SYSTEM_PRIMER = `
You are NOVA AI, an integrated product architect for software projects.
Act as a calm, precise Senior CTO, Product Manager, and Estimator in one.

Conversation protocol:
1) Understand the idea.
2) Clarify the product type (web app, mobile app, internal tool, AI agent, etc.).
3) Extract 5–9 core capabilities, focusing on user-facing value.
4) Summarise scope in concise, neutral language.
5) Provide a high-level timeline and relative cost (low / medium / high).
6) Recommend one of:
   - Subscription: NOVA AI-led ongoing product interface.
   - Custom project: bespoke build with deeper involvement.

Tone:
- No hype, no selling language, no emojis.
- Short, information-dense paragraphs.
- Avoid bullet lists unless necessary for clarity.
- Prefer plain numbers and simple wording.
`.trim();

export function buildSystemPrompt(): string {
  return SYSTEM_PRIMER;
}

export function planNextTurn(history: Message[]): AgentState {
  const lastUser = [...history].reverse().find((m) => m.role === "user");

  if (!lastUser) {
    return { stage: "idle" };
  }

  const text = lastUser.content.toLowerCase();

  if (text.includes("timeline") || text.includes("estimate")) {
    return { stage: "estimating" };
  }

  if (text.includes("feature") || text.includes("scope")) {
    return { stage: "scoping" };
  }

  if (text.includes("subscription") || text.includes("custom")) {
    return { stage: "recommending" };
  }

  if (history.length < 4) {
    return { stage: "clarifying" };
  }

  return { stage: "scoping" };
}

export function* mockStreamResponse(messages: Message[]): Generator<StreamChunk> {
  const state = planNextTurn(messages);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  const base = lastUser?.content ?? "your product idea";

  const text =
    state.stage === "clarifying"
      ? `Tell me, in one or two sentences, what you want this software to change for your users. I will then narrow it into a concrete product shape.`
      : state.stage === "scoping"
        ? `I will outline the core capabilities for this product, then we will convert them into scope, timeline, and a calm recommendation.` +
          " Start by confirming the primary user and the single most important workflow."
        : state.stage === "estimating"
          ? `Based on what you shared, we can treat this as a focused build. For a first production release, expect roughly six to ten weeks of work with a phased rollout.` +
            " I will break the phases down after you confirm that this framing matches your expectations."
          : `Given your description, we can handle this as an ongoing subscription with NOVA AI guiding the product, or as a custom engagement with a defined build window. ` +
            `Once you confirm which path is closer to your constraints, I will translate ${base} into a lean implementation plan.`;

  const id = `assistant-${Date.now()}`;
  let buffer = "";
  for (const token of text.split(" ")) {
    buffer += (buffer ? " " : "") + token;
    yield { type: "text", content: token + " " };
  }

  const finalMessage: Message = {
    id,
    role: "assistant",
    content: buffer,
    createdAt: Date.now(),
  };

  yield {
    type: "done",
    finalMessage,
    state,
  };
}

