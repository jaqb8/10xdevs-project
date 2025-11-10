import type { APIRoute } from "astro";
import { z } from "zod";
import { createErrorResponse, createValidationErrorResponse } from "@/lib/api-helpers";
import { trackUserSignup } from "@/lib/analytics/events";
import type { UserDto } from "@/types";
import { isFeatureEnabled } from "@/features/feature-flags.service";

const signupSchema = z.object({
  email: z.string().email("validation_error_invalid_email"),
  password: z.string().min(6, "validation_error_password_too_short"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isFeatureEnabled("auth")) {
    return createErrorResponse("feature_not_available", 404);
  }
  try {
    const body = await request.json();
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { email, password } = validationResult.data;

    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
      },
    });

    if (error) {
      console.error("Signup error:", error);
      return createErrorResponse(error.code || "authentication_error", 400);
    }

    if (!data.user) {
      return createErrorResponse("authentication_error", 400);
    }

    const userDto: UserDto = {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at,
    };

    trackUserSignup({
      user_id: userDto.id,
      email_domain: userDto.email.split("@")[1],
    });

    return new Response(JSON.stringify({ user: userDto }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected signup error:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
