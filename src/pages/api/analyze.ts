import type { APIRoute } from "astro";
import { z } from "zod";
import { AnalysisService } from "../../lib/services/analysis.service";

export const prerender = false;

/**
 * Zod schema for validating the AnalyzeTextCommand.
 * Ensures the text is a non-empty string with a maximum length of 500 characters.
 */
const analyzeTextSchema = z.object({
  text: z.string().min(1, "Text cannot be empty").max(500, "Text cannot exceed 500 characters").trim(),
});

/**
 * POST /api/analyze
 *
 * Analyzes the provided text for grammatical errors using AI.
 * Returns either a confirmation that the text is correct or a corrected version with explanation.
 *
 * @body { text: string } - The text to analyze (max 500 characters)
 * @returns {TextAnalysisDto} Analysis result with corrections if needed
 *
 * @throws {400} Bad Request - Invalid input (empty text, too long, etc.)
 * @throws {500} Internal Server Error - Analysis service error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validationResult = analyzeTextSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return new Response(JSON.stringify({ error: firstError.message, path: firstError.path }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { text } = validationResult.data;

    // Call the analysis service
    const result = await new AnalysisService(locals.supabase).analyzeText(text);

    // Return successful response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("An error occurred while analyzing the text.", error);
    return new Response(JSON.stringify({ error: "An error occurred while analyzing the text." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
