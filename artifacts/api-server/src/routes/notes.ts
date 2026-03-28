import { Router, type IRouter } from "express";
import { db, notesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateNoteBody,
  GetNotesResponse,
  DeleteNoteResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/notes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.userId;

  const notes = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.userId, userId))
    .orderBy(notesTable.createdAt);

  res.json(GetNotesResponse.parse(notes.map(n => ({
    id: n.id,
    bookId: n.bookId ?? null,
    userId: n.userId,
    title: n.title,
    content: n.content,
    sourceText: n.sourceText ?? null,
    aiAction: n.aiAction ?? null,
    createdAt: n.createdAt.toISOString(),
  }))));
});

router.post("/notes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user!.userId;
  const [note] = await db.insert(notesTable).values({
    ...parsed.data,
    userId,
  }).returning();

  res.status(201).json({
    id: note.id,
    bookId: note.bookId ?? null,
    userId: note.userId,
    title: note.title,
    content: note.content,
    sourceText: note.sourceText ?? null,
    aiAction: note.aiAction ?? null,
    createdAt: note.createdAt.toISOString(),
  });
});

router.delete("/notes/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid note ID" });
    return;
  }

  const userId = req.user!.userId;
  const [note] = await db
    .delete(notesTable)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
    .returning();

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.json(DeleteNoteResponse.parse({ message: "Note deleted" }));
});

export default router;
