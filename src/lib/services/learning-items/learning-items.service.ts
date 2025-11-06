import type { DrizzleDb } from "../../../db/drizzle.client";
import type {
  CreateLearningItemCommand,
  LearningItem,
  LearningItemDto,
  PaginatedResponseDto,
  PaginationDto,
} from "../../../types";
import {
  LearningItemsDatabaseError,
  LearningItemNotFoundError,
  LearningItemForbiddenError,
} from "./learning-items.errors";
import { learningItems } from "../../../db/schema";
import { eq, desc, count } from "drizzle-orm";
import { toISOString } from "../../utils.ts";

export class LearningItemsService {
  constructor(private readonly db: DrizzleDb) {}

  async getLearningItems(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<PaginatedResponseDto<LearningItemDto>> {
    const offset = (page - 1) * pageSize;

    try {
      const countResult = await this.db
        .select({ count: count() })
        .from(learningItems)
        .where(eq(learningItems.userId, userId));

      const totalItems = countResult[0]?.count ?? 0;
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

      const data = await this.db
        .select({
          id: learningItems.id,
          original_sentence: learningItems.originalSentence,
          corrected_sentence: learningItems.correctedSentence,
          explanation: learningItems.explanation,
          analysis_mode: learningItems.analysisMode,
          created_at: learningItems.createdAt,
        })
        .from(learningItems)
        .where(eq(learningItems.userId, userId))
        .orderBy(desc(learningItems.createdAt))
        .limit(pageSize)
        .offset(offset);

      const learningItemsDto: LearningItemDto[] = data.map((item) => ({
        id: item.id,
        original_sentence: item.original_sentence,
        corrected_sentence: item.corrected_sentence,
        explanation: item.explanation,
        analysis_mode: item.analysis_mode as "grammar_and_spelling" | "colloquial_speech",
        created_at: toISOString(item.created_at),
      }));

      const pagination: PaginationDto = {
        page,
        pageSize,
        totalItems,
        totalPages,
      };

      return {
        data: learningItemsDto,
        pagination,
      };
    } catch (error) {
      console.error("Database error in getLearningItems:", error);
      throw new LearningItemsDatabaseError(error);
    }
  }

  async createLearningItem(itemData: CreateLearningItemCommand, userId: string): Promise<LearningItem> {
    try {
      const insertData = {
        userId,
        originalSentence: itemData.original_sentence,
        correctedSentence: itemData.corrected_sentence,
        explanation: itemData.explanation,
        analysisMode: itemData.analysis_mode ?? "grammar_and_spelling",
      };

      const result = await this.db.insert(learningItems).values(insertData).returning();

      if (!result || result.length === 0) {
        console.error("No data returned from createLearningItem");
        throw new LearningItemsDatabaseError();
      }

      const item = result[0];

      return {
        id: item.id,
        user_id: item.userId,
        original_sentence: item.originalSentence,
        corrected_sentence: item.correctedSentence,
        explanation: item.explanation,
        analysis_mode: item.analysisMode,
        created_at: toISOString(item.createdAt),
      };
    } catch (error) {
      console.error("Database error in createLearningItem:", error);
      throw new LearningItemsDatabaseError(error);
    }
  }

  async deleteLearningItem(id: string, userId: string): Promise<void> {
    try {
      const existingItem = await this.db
        .select({ userId: learningItems.userId })
        .from(learningItems)
        .where(eq(learningItems.id, id))
        .limit(1);

      if (!existingItem || existingItem.length === 0) {
        throw new LearningItemNotFoundError();
      }

      if (existingItem[0].userId !== userId) {
        throw new LearningItemForbiddenError();
      }

      const deleteResult = await this.db.delete(learningItems).where(eq(learningItems.id, id)).returning();

      if (!deleteResult || deleteResult.length === 0) {
        throw new LearningItemNotFoundError();
      }
    } catch (error) {
      if (error instanceof LearningItemNotFoundError || error instanceof LearningItemForbiddenError) {
        throw error;
      }

      console.error("Database error in deleteLearningItem:", error);
      throw new LearningItemsDatabaseError(error);
    }
  }
}
