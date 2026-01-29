import type { APIRoute } from "astro";
import { GamificationService, GamificationDatabaseError } from "@/lib/services/gamification";
import { createErrorResponse } from "@/lib/api-helpers";

export const prerender = false;

export const DELETE: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return createErrorResponse("authentication_error_unauthorized", 401);
  }

  try {
    await new GamificationService(locals.supabase).resetUserPoints();

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    if (error instanceof GamificationDatabaseError) {
      return createErrorResponse("database_error", 500);
    }

    console.error("Unexpected error in DELETE /api/gamification/reset:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
