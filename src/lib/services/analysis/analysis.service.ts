import type { SupabaseClient } from "@/db/supabase.client";
import type { TextAnalysisDto } from "../../../types";
import { getMockAnalysis } from "./analysis.mocks";
import { openRouterService } from "../openrouter";
import {
  OpenRouterConfigurationError,
  OpenRouterAuthenticationError,
  OpenRouterRateLimitError,
  OpenRouterInvalidRequestError,
  OpenRouterResponseValidationError,
  OpenRouterNetworkError,
} from "../openrouter";
import {
  AnalysisConfigurationError,
  AnalysisAuthenticationError,
  AnalysisRateLimitError,
  AnalysisInvalidRequestError,
  AnalysisValidationError,
  AnalysisNetworkError,
  AnalysisUnknownError,
} from "./analysis.errors";
import { z } from "zod";
import grammarPrompt from "@/lib/prompts/grammar-analysis.prompt.md?raw";
import { USE_MOCKS } from "astro:env/server";

const TextAnalysisSchema = z.discriminatedUnion("is_correct", [
  z.object({
    is_correct: z.literal(true),
    original_text: z.string(),
  }),
  z.object({
    is_correct: z.literal(false),
    original_text: z.string(),
    corrected_text: z.string(),
    explanation: z.string(),
  }),
]);

export class AnalysisService {
  private useMocks: boolean;

  constructor(private readonly supabase: SupabaseClient) {
    this.useMocks = USE_MOCKS;
  }

  async analyzeText(text: string): Promise<TextAnalysisDto> {
    if (this.useMocks) {
      return this.analyzeMocked(text);
    }

    return this.analyzeWithAI(text);
  }

  private async analyzeMocked(text: string): Promise<TextAnalysisDto> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getMockAnalysis(text);
  }

  private async analyzeWithAI(text: string): Promise<TextAnalysisDto> {
    try {
      return await openRouterService.getChatCompletion({
        model: "google/gemini-2.0-flash-001",
        systemMessage: grammarPrompt,
        userMessage: text,
        responseSchema: TextAnalysisSchema,
        temperature: 0.3,
        maxTokens: 1000,
      });
    } catch (error) {
      if (error instanceof OpenRouterConfigurationError) {
        console.error("OpenRouter configuration error:", error.message);
        throw new AnalysisConfigurationError();
      }

      if (error instanceof OpenRouterAuthenticationError) {
        console.error("OpenRouter authentication error:", error.message);
        throw new AnalysisAuthenticationError();
      }

      if (error instanceof OpenRouterRateLimitError) {
        console.error("OpenRouter rate limit exceeded:", error.message);
        throw new AnalysisRateLimitError();
      }

      if (error instanceof OpenRouterInvalidRequestError) {
        console.error("OpenRouter invalid request:", error.message);
        throw new AnalysisInvalidRequestError();
      }

      if (error instanceof OpenRouterResponseValidationError) {
        console.error("OpenRouter response validation error:", error.message, error.validationErrors);
        throw new AnalysisValidationError(error.validationErrors);
      }

      if (error instanceof OpenRouterNetworkError) {
        console.error("OpenRouter network error:", error.message, error.cause);
        throw new AnalysisNetworkError(error.cause);
      }

      console.error("Unexpected error during text analysis:", error);
      throw new AnalysisUnknownError(error);
    }
  }
}
