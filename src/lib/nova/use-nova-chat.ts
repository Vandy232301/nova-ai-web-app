"use client";

import { useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface UseNovaChatOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: string) => void;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiresAt - 30_000) {
    return cachedToken;
  }

  const supabase = createClient();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  cachedToken = session.access_token;
  tokenExpiresAt = (session.expires_at ?? 0) * 1000;
  return cachedToken;
}

export function useNovaChat(options: UseNovaChatOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const sendMessage = useCallback(async (messages: ChatMessage[]): Promise<string | null> => {
    const token = await getAccessToken();
    if (!token) {
      optionsRef.current.onError?.("Please sign in to continue");
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_NOVA_API_URL;
    if (!apiUrl) {
      optionsRef.current.onError?.("Builder service not configured");
      return null;
    }

    abortRef.current = new AbortController();
    setIsStreaming(true);

    let fullContent = "";

    try {
      const res = await fetch(`${apiUrl}/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (res.status === 401) {
        optionsRef.current.onError?.("Session expired. Please sign in again.");
        return null;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        optionsRef.current.onError?.(errBody.error || `Error: ${res.status}`);
        return null;
      }

      if (!res.body) {
        optionsRef.current.onError?.("No response body");
        return null;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;

          const dataPrefix = "data: ";
          if (!trimmed.startsWith(dataPrefix)) continue;

          try {
            const json = JSON.parse(trimmed.slice(dataPrefix.length));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              optionsRef.current.onToken?.(fullContent);
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              optionsRef.current.onToken?.(fullContent);
            }
          } catch {}
        }

        if (!trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed);
            const content = json.choices?.[0]?.message?.content;
            if (content) {
              fullContent = content;
            }
          } catch {}
        }
      }

      optionsRef.current.onComplete?.(fullContent);
      return fullContent;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return fullContent || null;
      }
      optionsRef.current.onError?.("Connection error. Please try again.");
      return null;
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { sendMessage, abort, isStreaming };
}
