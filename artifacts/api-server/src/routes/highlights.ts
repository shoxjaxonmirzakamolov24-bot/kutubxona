import { Router, type IRouter } from "express";
import { db, highlightsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateHighlightBody,
  GetHighlightsResponse,
  DeleteHighlightResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/highlights", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const bookIdRaw = req.query.bookId as string | undefined;
  const userId = req.user!.userId;

  const conditions = [eq(highlightsTable.userId, userId)];
  if (bookIdRaw) {
    const bookId = parseInt(bookIdRaw, 10);
    if (!isNaN(bookId)) {
      conditions.push(eq(highlightsTable.bookId, bookId));
    }
  }

  const highlights = await db
    .select()
    .from(highlightsTable)
    .where(and(...conditions))
    .orderBy(highlightsTable.createdAt);

  res.json(GetHighlightsResponse.parse(highlights.map(h => ({
    id: h.id,
    bookId: h.bookId,
    userId: h.userId,
    selectedText: h.selectedText,
    pageNumber: h.pageNumber ?? null,
    color: h.color,
    createdAt: h.createdAt.toISOString(),
  }))));
});

router.post("/highlights", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateHighlightBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user!.userId;
  const [highlight] = await db.insert(highlightsTable).values({
    ...parsed.data,
    userId,
  }).returning();

  res.status(201).json({
    id: highlight.id,
    bookId: highlight.bookId,
    userId: highlight.userId,
    selectedText: highlight.selectedText,
    pageNumber: highlight.pageNumber ?? null,
    color: highlight.color,
    createdAt: highlight.createdAt.toISOString(),
  });
});

router.delete("/highlights/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid highlight ID" });
    return;
  }

  const userId = req.user!.userId;
  const [highlight] = await db
    .delete(highlightsTable)
    .where(and(eq(highlightsTable.id, id), eq(highlightsTable.userId, userId)))
    .returning();

  if (!highlight) {
    res.status(404).json({ error: "Highlight not found" });
    return;
  }

  res.json(DeleteHighlightResponse.parse({ message: "Highlight deleted" }));
});

export default router;
