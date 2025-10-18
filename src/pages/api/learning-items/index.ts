import type { APIRoute } from "astro";
import { z } from "zod";
import { LearningItemsService, LearningItemsDatabaseError } from "../../../lib/services/learning-items";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import { createErrorResponse, createValidationErrorResponse } from "../../../lib/api-helpers";

export const prerender = false;

const queryParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive({ message: "validation_error_page_invalid" })),
  pageSize: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int()
        .min(1, { message: "validation_error_page_size_too_small" })
        .max(100, { message: "validation_error_page_size_too_large" })
    ),
});

const createLearningItemSchema = z.object({
  original_sentence: z.string().min(1, { message: "validation_error_original_sentence_empty" }),
  corrected_sentence: z.string().min(1, { message: "validation_error_corrected_sentence_empty" }),
  explanation: z
    .string()
    .min(1, { message: "validation_error_explanation_empty" })
    .max(500, { message: "validation_error_explanation_too_long" }),
});

/**
 * GET handler for retrieving paginated learning items.
 *
 * This endpoint returns a paginated list of the authenticated user's
 * learning items, sorted by creation date (newest first).
 *
 * @param context - Astro API context containing locals and request
 * @returns JSON response with paginated learning items or error
 *
 * @example
 * GET /api/learning-items?page=1&pageSize=20
 *
 * Response:
 * {
 *   "data": [...],
 *   "pagination": {
 *     "page": 1,
 *     "pageSize": 20,
 *     "totalItems": 50,
 *     "totalPages": 3
 *   }
 * }
 */
export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const rawParams = {
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    };

    const validationResult = queryParamsSchema.safeParse(rawParams);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { page, pageSize } = validationResult.data;

    // MVP: Using DEFAULT_USER_ID. In production, this would use authenticated user's ID
    const result = await new LearningItemsService(locals.supabase).getLearningItems(DEFAULT_USER_ID, page, pageSize);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof LearningItemsDatabaseError) {
      return createErrorResponse("database_error", 500);
    }

    console.error("Unexpected error in GET /api/learning-items:", error);
    return createErrorResponse("unknown_error", 500);
  }
};

/**
 * POST handler for creating a new learning item.
 *
 * This endpoint allows users to create a new learning item
 * by providing the original sentence, corrected sentence, and explanation.
 *
 * @param context - Astro API context containing locals and request
 * @returns JSON response with the created learning item or error
 *
 * @example
 * POST /api/learning-items
 * Body:
 * {
 *   "original_sentence": "She have two cats.",
 *   "corrected_sentence": "She has two cats.",
 *   "explanation": "Use 'has' for the third-person singular present tense."
 * }
 *
 * Response (201):
 * {
 *   "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
 *   "user_id": "f1g2h3i4-j5k6-7890-1234-567890abcdef",
 *   "original_sentence": "She have two cats.",
 *   "corrected_sentence": "She has two cats.",
 *   "explanation": "Use 'has' for the third-person singular present tense.",
 *   "created_at": "2025-10-26T10:05:00Z"
 * }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const requestBody = await request.json();
    const validationResult = createLearningItemSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    // Create learning item
    // MVP: Using DEFAULT_USER_ID. In production, this would use authenticated user's ID
    const result = await new LearningItemsService(locals.supabase).createLearningItem(
      validationResult.data,
      DEFAULT_USER_ID
    );

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof LearningItemsDatabaseError) {
      return createErrorResponse("database_error", 500);
    }

    console.error("Unexpected error in POST /api/learning-items:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
