import type { APIRoute } from "astro";
import { DailyQuotaService, DailyQuotaDatabaseError } from "@/lib/services/daily-quota";
import { createErrorResponse } from "@/lib/api-helpers";
import { getClientIP } from "@/lib/utils";
import { ANONYMOUS_DAILY_QUOTA } from "astro:env/server";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  if (locals.user) {
    return new Response(
      JSON.stringify({
        remaining: null,
        resetAt: null,
        limit: null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const clientIP = getClientIP(request);
  const dailyQuotaService = new DailyQuotaService(locals.supabase);

  try {
    const result = await dailyQuotaService.getAnonymousQuotaStatus(clientIP);

    return new Response(
      JSON.stringify({
        remaining: result.remaining,
        resetAt: result.resetAt,
        limit: ANONYMOUS_DAILY_QUOTA,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof DailyQuotaDatabaseError) {
      return createErrorResponse("database_error", 500);
    }

    console.error("Unexpected error in GET /api/analyze/quota:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
