import type { APIRoute } from "astro";
import { z } from "zod";
import { createErrorResponse, createValidationErrorResponse } from "@/lib/api-helpers";
import { trackUserLogin } from "@/lib/analytics/events";
import type { SignedInUserDto } from "@/types";
import { isFeatureEnabled } from "@/features/feature-flags.service";

const loginSchema = z.object({
  email: z.string().email("validation_error_invalid_email"),
  password: z.string().min(6, "validation_error_password_too_short"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, waitUntil }) => {
  if (!isFeatureEnabled("auth")) {
    return createErrorResponse("feature_not_available", 404);
  }
  try {
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { email, password } = validationResult.data;

    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      return createErrorResponse(error.code || "authentication_error", 401);
    }

    if (!data.user) {
      return createErrorResponse("authentication_error", 401);
    }

    const userDto: SignedInUserDto = {
      id: data.user.id,
      email: data.user.email!,
    };

    trackUserLogin(
      {
        user_id: userDto.id,
        email_domain: userDto.email.split("@")[1],
      },
      waitUntil
    );

    return new Response(JSON.stringify({ user: userDto }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected login error:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
