import type { Database } from "./db/database.types";

// ============================================================================
// Database Entities
// ============================================================================

/**
 * Represents a single learning item record from the `learning_items` table.
 * This is the core entity type that other DTOs will be derived from.
 */
export type LearningItem = Database["public"]["Tables"]["learning_items"]["Row"];

// ============================================================================
// API DTOs (Data Transfer Objects)
// ============================================================================

/**
 * DTO for a learning item returned to the client.
 * It omits the `user_id` to avoid exposing it unnecessarily.
 *
 * @see GET /api/learning-items
 */
export type LearningItemDto = Pick<
  LearningItem,
  "id" | "original_sentence" | "corrected_sentence" | "explanation" | "created_at"
>;

/**
 * DTO for the response of a text analysis request.
 * It's a discriminated union based on whether errors were found.
 *
 * @see POST /api/analyze
 */
export type TextAnalysisDto =
  | {
      is_correct: true;
      original_text: string;
    }
  | {
      is_correct: false;
      original_text: string;
      corrected_text: string;
      explanation: string;
    };

/**
 * DTO for a user after a successful sign-up.
 * Represents the public-facing user data.
 *
 * @see POST /api/auth/signup
 */
export interface UserDto {
  id: string;
  email: string;
  created_at: string;
}

/**
 * DTO for a user after a successful sign-in.
 * It's a subset of the full UserDto.
 *
 * @see POST /api/auth/signin
 */
export type SignedInUserDto = Omit<UserDto, "created_at">;

// ============================================================================
// API Command Models
// ============================================================================

/**
 * Command model for creating a new learning item.
 * It includes only the properties required from the client, as `user_id`
 * will be derived from the session on the server.
 *
 * @see POST /api/learning-items
 */
export type CreateLearningItemCommand = Pick<LearningItem, "original_sentence" | "corrected_sentence" | "explanation">;

/**
 * Command model for analyzing a piece of text.
 *
 * @see POST /api/analyze
 */
export interface AnalyzeTextCommand {
  text: string;
}

/**
 * Base command model for authentication credentials.
 */
interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Command model for user sign-up.
 *
 * @see POST /api/auth/signup
 */
export type SignUpCommand = AuthCredentials;

/**
 * Command model for user sign-in.
 *
 * @see POST /api/auth/signin
 */
export type SignInCommand = AuthCredentials;
