import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateLearningItemCommand,
  LearningItem,
  LearningItemDto,
  PaginatedResponseDto,
  PaginationDto,
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
   * @param supabase - The Supabase client instance
   * @param userId - The authenticated user's ID
   * @param page - The page number (1-based)
   * @param pageSize - Number of items per page
   * @returns A paginated response containing learning items and pagination metadata
   * @throws Error if the database query fails
   */
  async getLearningItems(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<PaginatedResponseDto<LearningItemDto>> {
    const offset = (page - 1) * pageSize;

    const { count, error: countError } = await this.supabase
      .from("learning_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Database error in getLearningItems (count):", countError);
      throw new Error("Failed to fetch learning items count from database");
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
        data: [],
        pagination,
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
      throw new Error("Failed to fetch learning items from database");
    }

    const learningItems: LearningItemDto[] = data ?? [];

    const pagination: PaginationDto = {
      page,
      pageSize,
      totalItems,
      totalPages,
    };

    return {
      data: learningItems,
      pagination,
    };
  }

  /**
   * Creates a new learning item for a specific user.
   *
   * This function inserts a new learning item record into the database
   * with the provided data and user ID.
   *
   * @param supabase - The Supabase client instance
   * @param itemData - The learning item data (original sentence, corrected sentence, explanation)
   * @param userId - The authenticated user's ID
   * @returns The newly created learning item
   * @throws Error if the database insert operation fails
   */
  async createLearningItem(itemData: CreateLearningItemCommand, userId: string): Promise<LearningItem> {
    const insertData = {
      ...itemData,
      user_id: userId,
    };

    const { data, error } = await this.supabase.from("learning_items").insert(insertData).select().single();

    if (error) {
      console.error("Database error in createLearningItem:", error);
      throw new Error("Failed to create learning item in database");
    }

    if (!data) {
      console.error("No data returned from createLearningItem");
      throw new Error("Failed to create learning item: no data returned");
    }

    return data;
  }
}
