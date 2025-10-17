import type { SupabaseClient } from "@/db/supabase.client";
import type { TextAnalysisDto } from "../../types";
import { getMockAnalysis } from "./analysis.mocks";

/**
 * Service for analyzing text for grammatical errors.
 * Currently uses mocked responses, but will be extended to use OpenRouter.ai API.
 */
export class AnalysisService {
  private useMocks: boolean;

  constructor(private readonly supabase: SupabaseClient) {
    // Check environment variable to determine if we should use mocks
    this.useMocks = import.meta.env.USE_MOCKS !== "false";
  }

  /**
   * Analyzes the provided text for grammatical errors.
   *
   * @param text - The text to analyze
   * @returns A promise that resolves to a TextAnalysisDto
   * @throws Error if the analysis fails
   */
  async analyzeText(text: string): Promise<TextAnalysisDto> {
    if (this.useMocks) {
      return this.analyzeMocked(text);
    }

    // TODO: Implement real API call to OpenRouter.ai
    // This will be implemented in a future iteration
    throw new Error("Real API integration not yet implemented");
  }

  /**
   * Returns a mocked analysis response based on the input text.
   * Simulates processing delay for realistic behavior.
   */
  private async analyzeMocked(text: string): Promise<TextAnalysisDto> {
    // Simulate a small delay to mimic API call
    await new Promise((resolve) => setTimeout(resolve, 100));

    return getMockAnalysis(text);
  }

  /**
   * Future method for calling the real OpenRouter.ai API.
   * This will include:
   * - API key validation
   * - Request construction with prompt injection protection
   * - Timeout handling (60 seconds)
   * - Response parsing and validation
   * - Error handling for API failures
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async analyzeWithAI(_text: string): Promise<TextAnalysisDto> {
    // TODO: Implement OpenRouter.ai integration
    throw new Error("Not implemented");
  }
}
