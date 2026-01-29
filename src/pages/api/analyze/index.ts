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
import { GamificationService } from "@/lib/services/gamification";
import { SettingsService } from "@/lib/services/settings";
import { createErrorResponse, createValidationErrorResponse } from "@/lib/api-helpers";

export const prerender = false;

const analyzeTextSchema = z.object({
  text: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(1, "validation_error_text_empty").max(500, "validation_error_text_too_long")),
  mode: z
    .enum(["grammar_and_spelling", "colloquial_speech"], {
      message: "validation_error_invalid_mode",
    })
    .default("grammar_and_spelling"),
  analysisContext: z
    .string()
    .max(500, "validation_error_analysis_context_too_long")
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validationResult = analyzeTextSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { text, mode, analysisContext } = validationResult.data;

    const result = await new AnalysisService().analyzeText(text, mode, analysisContext);

    let pointsEnabled = true;
    if (locals.user) {
      try {
        const settings = await new SettingsService(locals.supabase).getUserSettings();
        pointsEnabled = settings.pointsEnabled;
      } catch (settingsError) {
        console.error("Failed to load user settings:", settingsError);
      }
    }

    if (result.is_correct && locals.user && pointsEnabled) {
      try {
        await new GamificationService(locals.supabase).recordCorrectAnalysis();
      } catch (pointsError) {
        console.error("Failed to handle gamification points:", pointsError);
      }
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (locals.analysisQuota) {
      headers["X-Daily-Quota-Remaining"] = locals.analysisQuota.remaining.toString();
      headers["X-Daily-Quota-Reset-At"] = locals.analysisQuota.resetAt;
      headers["X-Daily-Quota-Limit"] = locals.analysisQuota.limit.toString();
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers,
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
