import { defineMiddleware } from "astro:middleware";

import { supabaseClient, DEFAULT_USER_ID } from "../db/supabase.client.ts";
import { analysisRateLimiter } from "../lib/rate-limiter.ts";
import type { UserViewModel } from "../types.ts";

const MOCKED_USER: UserViewModel = {
  id: "12345",
  email: "test@example.com",
};

export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  context.locals.user = MOCKED_USER;

  // Apply rate limiting to /api/analyze endpoint
  if (context.locals.user && context.url.pathname === "/api/analyze") {
    const userId = context.locals.user["id"] || DEFAULT_USER_ID;

    if (!analysisRateLimiter.isAllowed(userId)) {
      return new Response(JSON.stringify({ error: "You have exceeded the analysis limit. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return next();
});
