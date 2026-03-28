import { pgTable, text, serial, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fileTypeEnum = pgEnum("file_type", ["pdf", "docx", "txt"]);

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  description: text("description"),
  category: text("category"),
  fileUrl: text("file_url").notNull(),
  fileType: fileTypeEnum("file_type").notNull(),
  processed: boolean("processed").notNull().default(false),
  pageCount: integer("page_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, createdAt: true, processed: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
