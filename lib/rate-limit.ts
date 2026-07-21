type RateLimitConfig = {
  key: string;
  limit: number;
  windowSecs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

const memStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMemory(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = memStore.get(config.key);
  const resetAt = now + config.windowSecs * 1000;

  if (!entry || now > entry.resetAt) {
    memStore.set(config.key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt: new Date(resetAt) };
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: new Date(entry.resetAt) };
  }

  entry.count += 1;
  return { allowed: true, remaining: config.limit - entry.count, resetAt: new Date(entry.resetAt) };
}

export const RATE_LIMITS = {
  aiTutor: (userId: string) => ({
    key: `ai-tutor:${userId}`,
    limit: 20,
    windowSecs: 60,
  }),
  checkout: (userId: string) => ({
    key: `checkout:${userId}`,
    limit: 5,
    windowSecs: 3600,
  }),
  sendEmail: (userId: string) => ({
    key: `email:${userId}`,
    limit: 10,
    windowSecs: 3600,
  }),
  badgeCheck: (userId: string) => ({
    key: `badge:${userId}`,
    limit: 50,
    windowSecs: 60,
  }),
  completeLesson: (userId: string) => ({
    key: `complete:${userId}`,
    limit: 100,
    windowSecs: 3600,
  }),
  globalApi: (ip: string) => ({
    key: `global:${ip}`,
    limit: 200,
    windowSecs: 60,
  }),
};

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

export function applyRateLimit(
  config: RateLimitConfig,
  onExceeded?: string,
): { allowed: boolean; response?: Response } {
  const result = rateLimitMemory(config);

  if (!result.allowed) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: "rate_limit_exceeded",
          message: onExceeded || "Too many requests. Please slow down.",
          resetAt: result.resetAt.toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": config.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.resetAt.toISOString(),
          },
        },
      ),
    };
  }

  return { allowed: true };
}
