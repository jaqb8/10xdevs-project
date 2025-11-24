import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance, DEFAULT_USER_ID } from "../db/supabase.client.ts";
import { analysisRateLimiter } from "../lib/rate-limiter.ts";
import { DailyQuotaService } from "../lib/services/daily-quota";
import { createErrorResponse } from "@/lib/api-helpers.ts";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

const PRIVATE_PATHS = ["/learning-list"];

function getClientIP(request: Request): string {
  const headers = request.headers;

  const cfConnectingIP = headers.get("CF-Connecting-IP");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  const xForwardedFor = headers.get("X-Forwarded-For");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIP = headers.get("X-Real-IP");
  if (xRealIP) {
    return xRealIP;
  }

  return "unknown";
}

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email!,
      id: user.id,
    };
  } else {
    locals.user = null;
  }

  if (user && AUTH_PAGES.includes(url.pathname)) {
    return redirect("/");
  }

  if (!user && PRIVATE_PATHS.some((path) => url.pathname.startsWith(path))) {
    return redirect("/login");
  }

  if (url.pathname === "/api/analyze") {
    if (locals.user) {
      const userId = locals.user.id || DEFAULT_USER_ID;

      if (!analysisRateLimiter.isAllowed(userId)) {
        const timeUntilReset = analysisRateLimiter.getTimeUntilReset(userId);

        return createErrorResponse("rate_limit_error", 429, {
          time_until_reset: timeUntilReset,
        });
      }
    } else {
      const clientIP = getClientIP(request);
      const dailyQuotaService = new DailyQuotaService(supabase);

      try {
        const result = await dailyQuotaService.checkAndIncrementAnonymousUsage(clientIP);

        if (!result.allowed) {
          return createErrorResponse("daily_quota_exceeded", 429, {
            remaining: result.remaining,
            reset_at: result.resetAt,
          });
        }
      } catch (error) {
        console.error("Error checking daily quota:", error);
        return createErrorResponse("unknown_error", 500);
      }
    }
  }

  return next();
});
