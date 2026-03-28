import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { booksTable } from "./books";

export const aiHistoryTable = pgTable("ai_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  bookId: integer("book_id").references(() => booksTable.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  inputText: text("input_text").notNull(),
  result: text("result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAiHistorySchema = createInsertSchema(aiHistoryTable).omit({ id: true, createdAt: true });
export type InsertAiHistory = z.infer<typeof insertAiHistorySchema>;
export type AiHistory = typeof aiHistoryTable.$inferSelect;
