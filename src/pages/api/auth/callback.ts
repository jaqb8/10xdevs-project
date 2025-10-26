import type { APIRoute } from "astro";
import { createErrorResponse } from "@/lib/api-helpers";
import { isFeatureEnabled } from "@/features/feature-flags.service";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  if (!isFeatureEnabled("auth")) {
    return createErrorResponse("feature_not_available", 404);
  }
  try {
    const code = url.searchParams.get("code");

    if (!code) {
      return createErrorResponse("authentication_error_missing_code", 400);
    }

    const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Code exchange error:", error);
      return createErrorResponse(error.code || "authentication_error", 400);
    }

    return redirect("/", 302);
  } catch (error) {
    console.error("Unexpected callback error:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
