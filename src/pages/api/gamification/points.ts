import type { APIRoute } from "astro";
import { GamificationService, GamificationDatabaseError } from "@/lib/services/gamification";
import { createErrorResponse } from "@/lib/api-helpers";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return createErrorResponse("unauthorized", 401);
  }

  try {
    const gamificationService = new GamificationService(locals.supabase);
    const total = await gamificationService.getUserPointsTotal(locals.user.id);

    return new Response(JSON.stringify({ total }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof GamificationDatabaseError) {
      return createErrorResponse("database_error", 500);
    }

    console.error("Unexpected error in GET /api/gamification/points:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
