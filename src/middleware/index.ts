import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance, DEFAULT_USER_ID } from "../db/supabase.client.ts";
import { analysisRateLimiter } from "../lib/rate-limiter.ts";
import { createErrorResponse } from "@/lib/api-helpers.ts";
import { trackRateLimitExceeded } from "@/lib/analytics/events";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

const PRIVATE_PATHS = ["/learning-list"];

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

  if (locals.user && url.pathname === "/api/analyze") {
    const userId = locals.user.id || DEFAULT_USER_ID;

    if (!analysisRateLimiter.isAllowed(userId)) {
      const timeUntilReset = analysisRateLimiter.getTimeUntilReset(userId);

      trackRateLimitExceeded({
        user_id: userId,
        endpoint: url.pathname,
        max_requests: analysisRateLimiter.getMaxRequests(),
        window_ms: analysisRateLimiter.getWindowMs(),
        time_until_reset: timeUntilReset,
      });

      return createErrorResponse("rate_limit_error", 429, {
        time_until_reset: timeUntilReset,
      });
    }
  }

  return next();
});
