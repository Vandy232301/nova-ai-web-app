import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Health check endpoint - never exposes sensitive data
export async function GET(_req: NextRequest): Promise<Response> {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      resend: !!process.env.RESEND_API_KEY,
      reports: !!process.env.NOVA_REPORTS_EMAIL,
    },
  };

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
