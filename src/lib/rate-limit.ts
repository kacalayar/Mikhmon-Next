// Simple in-memory rate limiter for API routes
// For production, consider using Redis-based solution like @upstash/ratelimit

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

// Default configurations for different route types
export const RATE_LIMIT_CONFIGS = {
  // Strict limit for auth endpoints (prevent brute force)
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes

  // Standard API endpoints
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute

  // Sensitive operations (reboot, shutdown, delete)
  sensitive: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 requests per minute

  // Read-only operations (more lenient)
  readonly: { windowMs: 60 * 1000, maxRequests: 120 }, // 120 requests per minute
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.api,
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  startCleanup();

  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header or falls back to a default
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback - in production, you should always have IP from headers
  return "unknown-client";
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: {
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
  };

  if (result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return headers;
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit(limitType: RateLimitType = "api") {
  const config = RATE_LIMIT_CONFIGS[limitType];

  return function createRateLimitCheck(request: Request): {
    allowed: boolean;
    headers: Record<string, string>;
    retryAfter?: number;
  } {
    const identifier = getClientIdentifier(request);
    const result = checkRateLimit(`${limitType}:${identifier}`, config);

    return {
      allowed: result.allowed,
      headers: createRateLimitHeaders(result),
      retryAfter: result.retryAfter,
    };
  };
}
