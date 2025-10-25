import type { APIRoute } from "astro";
import { z } from "zod";
import { createErrorResponse, createValidationErrorResponse } from "@/lib/api-helpers";
import { isFeatureEnabled } from "@/features/feature-flags.service";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "validation_error_password_too_short"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isFeatureEnabled("auth")) {
    return createErrorResponse("feature_not_available", 404);
  }
  try {
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { password } = validationResult.data;

    const { error } = await locals.supabase.auth.updateUser({
      password,
    });

    if (error) {
      if (error.message.includes("Password should be at least")) {
        return createErrorResponse("authentication_error_weak_password", 400);
      }

      console.error("Reset password error:", error);
      return createErrorResponse("authentication_error", 400);
    }

    return new Response(JSON.stringify({ message: "Password updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected reset password error:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
