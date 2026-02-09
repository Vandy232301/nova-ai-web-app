import { NextRequest } from "next/server";
import { mockStreamResponse } from "@/lib/ai/agent";
import { Message } from "@/lib/ai/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  const body = (await req.json()) as { messages: Message[] | undefined };
  const history = body.messages ?? [];

  const stream = new ReadableStream({
    start(controller) {
      try {
        for (const chunk of mockStreamResponse(history)) {
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify(chunk) + "\n"),
          );
        }
        controller.close();
      } catch (error) {
        const payload = JSON.stringify({
          type: "error",
          message: "The agent encountered an unexpected error.",
        });
        controller.enqueue(new TextEncoder().encode(payload + "\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

