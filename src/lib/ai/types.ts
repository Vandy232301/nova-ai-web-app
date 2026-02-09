export type Role = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

export type AgentStage =
  | "idle"
  | "clarifying"
  | "scoping"
  | "estimating"
  | "recommending";

export type AgentState = {
  stage: AgentStage;
  summary?: string;
  productType?: string;
  features?: string[];
  estimate?: {
    timeline: string;
    complexity: "low" | "medium" | "high";
    relativeCost: "subscription" | "custom";
  };
};

export type StreamChunk =
  | { type: "text"; content: string }
  | { type: "done"; finalMessage: Message; state: AgentState }
  | { type: "error"; message: string };

