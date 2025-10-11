import { defineMiddleware } from "astro:middleware";

import { supabaseClient, DEFAULT_USER_ID } from "../db/supabase.client.ts";
import { analysisRateLimiter } from "../lib/rate-limiter.ts";

export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;

  // Apply rate limiting to /api/analyze endpoint
  if (context.url.pathname === "/api/analyze") {
    // For MVP, use DEFAULT_USER_ID. In future, use context.locals.user.id
    const userId = DEFAULT_USER_ID;

    if (!analysisRateLimiter.isAllowed(userId)) {
      return new Response(JSON.stringify({ error: "You have exceeded the analysis limit. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return next();
});
