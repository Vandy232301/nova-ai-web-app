// Simple in-memory rate limiter for serverless environments
// For production, consider using Redis or Vercel Edge Config

import type { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly CLEANUP_INTERVAL = 60 * 1000; // Clean up every minute

  constructor() {
    // Clean up old entries periodically
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  private getKey(identifier: string, window: string): string {
    return `${identifier}:${window}`;
  }

  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const key = this.getKey(identifier, `${windowStart}`);

    const entry = this.store.get(key) || {
      count: 0,
      resetTime: windowStart + windowMs,
      firstRequest: now,
    };

    entry.count += 1;
    this.store.set(key, entry);

    const remaining = Math.max(0, limit - entry.count);
    const allowed = entry.count <= limit;

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  // Check multiple limits (e.g., per minute and per hour)
  checkMultiple(
    identifier: string,
    limits: Array<{ limit: number; windowMs: number }>
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const results = limits.map(({ limit, windowMs }) =>
      this.check(identifier, limit, windowMs)
    );

    const allowed = results.every((r) => r.allowed);
    const remaining = Math.min(...results.map((r) => r.remaining));
    const resetTime = Math.max(...results.map((r) => r.resetTime));

    return { allowed, remaining, resetTime };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Helper function to get client identifier
export function getClientIdentifier(req: NextRequest): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");

  const ip =
    forwarded?.split(",")[0]?.trim() ||
    realIp ||
    cfConnectingIp ||
    (req as unknown as { ip?: string }).ip ||
    "unknown";

  // Also use a session identifier if available
  const sessionId = req.headers.get("x-session-id") || "no-session";

  return `${ip}:${sessionId}`;
}
