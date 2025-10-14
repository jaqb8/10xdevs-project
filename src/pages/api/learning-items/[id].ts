import type { APIRoute } from "astro";
import { z } from "zod";
import { LearningItemsService } from "../../../lib/services/learning-items.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

const idParamSchema = z.string().uuid({ message: "Invalid learning item ID format" });

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
      return new Response(JSON.stringify({ error: "Learning item ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validationResult = idParamSchema.safeParse(itemId);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid learning item ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validatedId = validationResult.data;

    // MVP: Using DEFAULT_USER_ID. In production, this would use authenticated user's ID
    const result = await new LearningItemsService(locals.supabase).deleteLearningItem(validatedId, DEFAULT_USER_ID);

    if (!result.success) {
      if (result.error === "not_found") {
        return new Response(JSON.stringify({ error: "Learning item not found." }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (result.error === "forbidden") {
        return new Response(JSON.stringify({ error: "You do not have permission to delete this item." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/learning-items/:id:", error);

    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
