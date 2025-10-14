import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateLearningItemCommand,
  LearningItem,
  LearningItemDto,
  PaginatedResponseDto,
  PaginationDto,
  ServiceResult,
  ServiceVoidResult,
} from "../../types";

export class LearningItemsService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Retrieves a paginated list of learning items for a specific user.
   *
   * This function performs two database queries:
   * 1. Count query to get the total number of items
   * 2. Data query to fetch the paginated results
   *
   * @param userId - The authenticated user's ID
   * @param page - The page number (1-based)
   * @param pageSize - Number of items per page
   * @returns An object indicating success with data or failure with error type
   */
  async getLearningItems(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<ServiceResult<PaginatedResponseDto<LearningItemDto>, "database_error">> {
    const offset = (page - 1) * pageSize;

    const { count, error: countError } = await this.supabase
      .from("learning_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Database error in getLearningItems (count):", countError);
      return { success: false, error: "database_error" };
    }

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalItems === 0 || offset >= totalItems) {
      const pagination: PaginationDto = {
        page,
        pageSize,
        totalItems,
        totalPages,
      };

      return {
        success: true,
        data: {
          data: [],
          pagination,
        },
      };
    }

    const { data, error } = await this.supabase
      .from("learning_items")
      .select("id, original_sentence, corrected_sentence, explanation, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Database error in getLearningItems:", error);
      return { success: false, error: "database_error" };
    }

    const learningItems: LearningItemDto[] = data ?? [];

    const pagination: PaginationDto = {
      page,
      pageSize,
      totalItems,
      totalPages,
    };

    return {
      success: true,
      data: {
        data: learningItems,
        pagination,
      },
    };
  }

  /**
   * Creates a new learning item for a specific user.
   *
   * This function inserts a new learning item record into the database
   * with the provided data and user ID.
   *
   * @param itemData - The learning item data (original sentence, corrected sentence, explanation)
   * @param userId - The authenticated user's ID
   * @returns An object indicating success with the created item or failure with error type
   */
  async createLearningItem(
    itemData: CreateLearningItemCommand,
    userId: string
  ): Promise<ServiceResult<LearningItem, "database_error">> {
    const insertData = {
      ...itemData,
      user_id: userId,
    };

    const { data, error } = await this.supabase.from("learning_items").insert(insertData).select().single();

    if (error) {
      console.error("Database error in createLearningItem:", error);
      return { success: false, error: "database_error" };
    }

    if (!data) {
      console.error("No data returned from createLearningItem");
      return { success: false, error: "database_error" };
    }

    return { success: true, data };
  }

  /**
   * Deletes a learning item after verifying ownership.
   *
   * This function performs the following steps:
   * 1. Fetches the learning item by ID to verify it exists
   * 2. Checks if the user_id matches the provided userId (authorization)
   * 3. Deletes the item if authorization passes
   *
   * @param id - The unique identifier of the learning item to delete
   * @param userId - The authenticated user's ID
   * @returns An object indicating success or the type of failure
   */
  async deleteLearningItem(
    id: string,
    userId: string
  ): Promise<ServiceVoidResult<"not_found" | "forbidden" | "database_error">> {
    const { data: existingItem, error: fetchError } = await this.supabase
      .from("learning_items")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return { success: false, error: "not_found" };
      }
      console.error("Database error in deleteLearningItem (fetch):", fetchError);
      return { success: false, error: "database_error" };
    }

    if (!existingItem) {
      return { success: false, error: "not_found" };
    }

    if (existingItem.user_id !== userId) {
      return { success: false, error: "forbidden" };
    }

    const { error: deleteError } = await this.supabase.from("learning_items").delete().eq("id", id);

    if (deleteError) {
      console.error("Database error in deleteLearningItem (delete):", deleteError);
      return { success: false, error: "database_error" };
    }

    return { success: true };
  }
}
