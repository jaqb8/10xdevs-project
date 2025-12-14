import type { APIRoute } from "astro";
import { createErrorResponse } from "@/lib/api-helpers";
import { validateReturnUrl } from "@/lib/utils";
import { isFeatureEnabled } from "@/features/feature-flags.service";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals, redirect, request }) => {
  if (!isFeatureEnabled("auth")) {
    return createErrorResponse("feature_not_available", 404);
  }
  try {
    const returnUrl = url.searchParams.get("returnUrl");
    const validatedReturnUrl = validateReturnUrl(returnUrl);

    const origin = new URL(request.url).origin;
    const callbackUrl = new URL("/api/auth/callback", origin);
    if (validatedReturnUrl) {
      callbackUrl.searchParams.set("returnUrl", validatedReturnUrl);
    }

    const { data, error } = await locals.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      console.error("Google OAuth initiation error:", error);
      return createErrorResponse(error.code || "authentication_error", 400);
    }

    if (!data.url) {
      return createErrorResponse("authentication_error", 400);
    }

    console.log(data);
    return redirect(data.url, 302);
  } catch (error) {
    console.error("Unexpected Google OAuth error:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
