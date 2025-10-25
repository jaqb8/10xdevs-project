import type { APIRoute } from "astro";
import { z } from "zod";
import { createErrorResponse, createValidationErrorResponse } from "@/lib/api-helpers";
import { isFeatureEnabled } from "@/features/feature-flags.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("validation_error_invalid_email"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isFeatureEnabled("auth")) {
    return createErrorResponse("feature_not_available", 404);
  }
  try {
    const body = await request.json();
    const validationResult = forgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { email } = validationResult.data;

    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    });

    if (error) {
      console.error("Forgot password error:", error);
    }

    return new Response(
      JSON.stringify({
        message: "If an account with that email exists, a password reset link has been sent.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected forgot password error:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
