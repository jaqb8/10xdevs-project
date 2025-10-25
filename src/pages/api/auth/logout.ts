import type { APIRoute } from "astro";
import { createErrorResponse } from "@/lib/api-helpers";
import { isFeatureEnabled } from "@/features/feature-flags.service";

export const prerender = false;

export const POST: APIRoute = async ({ locals, redirect }) => {
  if (!isFeatureEnabled("auth")) {
    return createErrorResponse("feature_not_available", 404);
  }
  try {
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return createErrorResponse("authentication_error", 400);
    }

    return redirect("/", 302);
  } catch (error) {
    console.error("Unexpected logout error:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
