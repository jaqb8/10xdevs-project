import type { SupabaseClient } from "@/db/supabase.client";
import type { LearningItemDto, PaginatedResponseDto } from "@/types";
import { LearningItemsService } from "@/lib/services/learning-items";

export type InitialLearningItemsStatus = "ok" | "error" | "unauthenticated";

export interface InitialLearningItemsData {
  initialData: PaginatedResponseDto<LearningItemDto> | null;
  status: InitialLearningItemsStatus;
}

const PAGE_SIZE = 10;

/**
 * Fetches initial learning items for authenticated users (first page).
 * Returns status to distinguish unauthenticated from fetch errors.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to fetch items for
 * @returns Object containing initialData and status
 */
export async function fetchInitialLearningItems(
  supabase: SupabaseClient,
  userId: string
): Promise<InitialLearningItemsData> {
  try {
    const service = new LearningItemsService(supabase);
    const initialData = await service.getLearningItems(userId, 1, PAGE_SIZE);

    return { initialData, status: "ok" };
  } catch (error) {
    console.error("Failed to fetch initial learning items:", error);
    return { initialData: null, status: "error" };
  }
}
