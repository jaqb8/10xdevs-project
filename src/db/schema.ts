import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const analysisModeEnum = pgEnum("analysis_mode", ["grammar_and_spelling", "colloquial_speech"]);

export const learningItems = pgTable("learning_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  originalSentence: text("original_sentence").notNull(),
  correctedSentence: text("corrected_sentence").notNull(),
  explanation: text("explanation").notNull(),
  analysisMode: analysisModeEnum("analysis_mode").notNull().default("grammar_and_spelling"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
