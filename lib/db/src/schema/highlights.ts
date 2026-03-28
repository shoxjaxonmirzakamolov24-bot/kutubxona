import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { booksTable } from "./books";

export const highlightsTable = pgTable("highlights", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => booksTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  selectedText: text("selected_text").notNull(),
  pageNumber: integer("page_number"),
  color: text("color").notNull().default("yellow"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHighlightSchema = createInsertSchema(highlightsTable).omit({ id: true, createdAt: true });
export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
export type Highlight = typeof highlightsTable.$inferSelect;
