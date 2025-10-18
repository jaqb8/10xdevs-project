import type { APIRoute } from "astro";
import { z } from "zod";
import {
  LearningItemsService,
  LearningItemsDatabaseError,
  LearningItemNotFoundError,
  LearningItemForbiddenError,
} from "../../../lib/services/learning-items";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import { createErrorResponse, createValidationErrorResponse } from "../../../lib/api-helpers";

export const prerender = false;

const idParamSchema = z.string().uuid({ message: "validation_error_invalid_uuid" });

/**
 * DELETE handler for deleting a specific learning item.
 *
 * This endpoint allows authenticated users to delete a learning item
 * that they own. Authorization is enforced at the service layer.
 *
 * @param context - Astro API context containing locals and params
 * @returns Empty response with 204 status on success, or error response
 *
 * @example
 * DELETE /api/learning-items/b2c3d4e5-f6a7-8901-2345-67890abcdef1
 *
 * Response (204): No content
 *
 * Error responses:
 * - 400: Invalid UUID format
 * - 401: Authentication required
 * - 403: User does not have permission to delete this item
 * - 404: Learning item not found
 * - 500: Internal server error
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const itemId = params.id;

    if (!itemId) {
      return createErrorResponse("validation_error_id_required", 400);
    }

    const validationResult = idParamSchema.safeParse(itemId);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const validatedId = validationResult.data;

    // MVP: Using DEFAULT_USER_ID. In production, this would use authenticated user's ID
    await new LearningItemsService(locals.supabase).deleteLearningItem(validatedId, DEFAULT_USER_ID);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof LearningItemNotFoundError) {
      return createErrorResponse("not_found", 404);
    }

    if (error instanceof LearningItemForbiddenError) {
      return createErrorResponse("forbidden", 403);
    }

    if (error instanceof LearningItemsDatabaseError) {
      return createErrorResponse("database_error", 500);
    }

    console.error("Unexpected error in DELETE /api/learning-items/:id:", error);
    return createErrorResponse("unknown_error", 500);
  }
};
