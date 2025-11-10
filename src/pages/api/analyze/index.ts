import type { APIRoute } from "astro";
import { z } from "zod";
import {
  AnalysisService,
  AnalysisConfigurationError,
  AnalysisAuthenticationError,
  AnalysisRateLimitError,
  AnalysisInvalidRequestError,
  AnalysisValidationError,
  AnalysisNetworkError,
  AnalysisUnknownError,
} from "@/lib/services/analysis";
import { createErrorResponse, createValidationErrorResponse } from "@/lib/api-helpers";

export const prerender = false;

const analyzeTextSchema = z.object({
  text: z.string().min(1, "validation_error_text_empty").max(500, "validation_error_text_too_long").trim(),
  mode: z
    .enum(["grammar_and_spelling", "colloquial_speech"], {
      message: "validation_error_invalid_mode",
    })
    .default("grammar_and_spelling"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return createErrorResponse("authentication_error_unauthorized", 401);
    }

    const body = await request.json();
    const validationResult = analyzeTextSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { text, mode } = validationResult.data;

    const result = await new AnalysisService(locals.supabase).analyzeText(text, mode, locals.user.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof AnalysisConfigurationError) {
      return createErrorResponse("configuration_error", 500);
    }

    if (error instanceof AnalysisAuthenticationError) {
      return createErrorResponse("authentication_error", 500);
    }

    if (error instanceof AnalysisRateLimitError) {
      return createErrorResponse("rate_limit_error", 429);
    }

    if (error instanceof AnalysisInvalidRequestError) {
      return createErrorResponse("invalid_request_error", 500);
    }

    if (error instanceof AnalysisValidationError) {
      return createErrorResponse("validation_error", 500);
    }

    if (error instanceof AnalysisNetworkError) {
      return createErrorResponse("network_error", 500);
    }

    if (error instanceof AnalysisUnknownError) {
      return createErrorResponse("unknown_error", 500);
    }

    console.error("Unexpected error in POST /api/analyze:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
