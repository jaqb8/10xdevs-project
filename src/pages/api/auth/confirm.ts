import type { APIRoute } from "astro";
import { z } from "zod";
import { parseZodErrorCode } from "@/lib/api-helpers";
import { isFeatureEnabled } from "@/features/feature-flags.service";

const confirmSchema = z.object({
  token_hash: z.string().min(1, "authentication_error_missing_token"),
  type: z.enum(["recovery", "signup", "email_change", "magiclink"], {
    errorMap: () => ({ message: "authentication_error_invalid_type" }),
  }),
  next: z.string().optional().default("/"),
});

export const prerender = false;

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  if (!isFeatureEnabled("auth")) {
    return redirect("/?error=feature_not_available", 302);
  }
  try {
    const params = {
      token_hash: url.searchParams.get("token_hash"),
      type: url.searchParams.get("type"),
      next: url.searchParams.get("next"),
    };

    const validationResult = confirmSchema.safeParse(params);

    if (!validationResult.success) {
      const errorCode = parseZodErrorCode(validationResult.error);
      return redirect(`/forgot-password?error=${errorCode}`, 302);
    }

    const { token_hash, type, next } = validationResult.data;

    const { error } = await locals.supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error("Token verification error:", error);
      return redirect(`/forgot-password?error=${error.code || "authentication_error"}`, 302);
    }

    return redirect(next, 302);
  } catch (error) {
    console.error("Unexpected confirm error:", error);
    return redirect("/forgot-password?error=unknown_error", 302);
  }
};
