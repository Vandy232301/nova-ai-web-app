import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { NOVA_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const history = body.messages ?? [];
    const locale = body.locale || "en";

    // Debug: log API key status (first 10 chars only)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const hasKey = !!apiKey;
    const keyPreview = apiKey ? apiKey.substring(0, 10) + "..." : "undefined";
    console.log("[NOVA API] API Key present:", hasKey, "Preview:", keyPreview);

    // If no API key, fall back to a simple response
    if (!apiKey) {
      console.log("[NOVA API] No API key found, using fallback");
      return createFallbackResponse(locale);
    }

    // Initialize Anthropic client with the API key
    const anthropic = new Anthropic({ apiKey });

    // Convert our message format to Anthropic's format
    const claudeMessages = history
      .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // Create streaming response from Claude
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: NOVA_SYSTEM_PROMPT,
      messages: claudeMessages,
    });

    // Convert Anthropic stream to our format
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const response = await stream.finalMessage();
          
          // Stream text chunks
          for (const block of response.content) {
            if (block.type === "text") {
              // Split into smaller chunks for smoother streaming feel
              const words = block.text.split(" ");
              let buffer = "";
              
              for (let i = 0; i < words.length; i++) {
                buffer += (i > 0 ? " " : "") + words[i];
                
                // Send every few words
                if (buffer.length > 20 || i === words.length - 1) {
                  const chunk = JSON.stringify({ type: "text", content: buffer }) + "\n";
                  controller.enqueue(new TextEncoder().encode(chunk));
                  buffer = "";
                }
              }

              // Send done with full message
              const doneChunk = JSON.stringify({
                type: "done",
                finalMessage: {
                  id: `assistant-${Date.now()}`,
                  role: "assistant",
                  content: block.text,
                  createdAt: Date.now(),
                },
              }) + "\n";
              controller.enqueue(new TextEncoder().encode(doneChunk));
            }
          }
          
          controller.close();
        } catch (error) {
          console.error("Claude API error:", error);
          const errorChunk = JSON.stringify({
            type: "error",
            message: "An error occurred while processing your request.",
          }) + "\n";
          controller.enqueue(new TextEncoder().encode(errorChunk));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Request error:", error);
    return new Response(
      JSON.stringify({ type: "error", message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Fallback when no API key is set (dev/demo mode)
function createFallbackResponse(locale: string) {
  const fallbackMessages: Record<string, string> = {
    en: "Hi! I'm NOVA, your AI product advisor. To enable the full AI experience, the ANTHROPIC_API_KEY needs to be configured. For now, please use the structured discovery flow or contact us directly!",
    ro: "Salut! Sunt NOVA, consilierul tău de produs AI. Pentru experiența AI completă, cheia ANTHROPIC_API_KEY trebuie configurată. Deocamdată, folosește flow-ul structurat de discovery sau contactează-ne direct!",
    fr: "Bonjour! Je suis NOVA, votre conseiller produit IA. Pour l'expérience IA complète, la clé ANTHROPIC_API_KEY doit être configurée. Pour l'instant, utilisez le flux de découverte structuré ou contactez-nous directement!",
    de: "Hallo! Ich bin NOVA, Ihr KI-Produktberater. Für das vollständige KI-Erlebnis muss der ANTHROPIC_API_KEY konfiguriert werden. Nutzen Sie vorerst den strukturierten Discovery-Flow oder kontaktieren Sie uns direkt!",
    es: "¡Hola! Soy NOVA, tu asesor de producto IA. Para la experiencia IA completa, se necesita configurar ANTHROPIC_API_KEY. Por ahora, usa el flujo de descubrimiento estructurado o contáctanos directamente!",
    it: "Ciao! Sono NOVA, il tuo consulente prodotto IA. Per l'esperienza IA completa, è necessario configurare ANTHROPIC_API_KEY. Per ora, usa il flusso di scoperta strutturato o contattaci direttamente!",
    ru: "Привет! Я NOVA, ваш ИИ-консультант по продуктам. Для полного ИИ-опыта необходимо настроить ANTHROPIC_API_KEY. Пока используйте структурированный поток обнаружения или свяжитесь с нами напрямую!",
    zh: "你好！我是NOVA，您的AI产品顾问。要启用完整的AI体验，需要配置ANTHROPIC_API_KEY。目前请使用结构化的发现流程或直接联系我们！",
    ja: "こんにちは！NOVAです。AI製品アドバイザーです。完全なAI体験にはANTHROPIC_API_KEYの設定が必要です。現在は構造化されたディスカバリーフローをご利用いただくか、直接お問い合わせください！",
  };

  const message = fallbackMessages[locale] || fallbackMessages.en;
  
  const stream = new ReadableStream({
    start(controller) {
      const textChunk = JSON.stringify({ type: "text", content: message }) + "\n";
      controller.enqueue(new TextEncoder().encode(textChunk));
      
      const doneChunk = JSON.stringify({
        type: "done",
        finalMessage: {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: message,
          createdAt: Date.now(),
        },
      }) + "\n";
      controller.enqueue(new TextEncoder().encode(doneChunk));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
