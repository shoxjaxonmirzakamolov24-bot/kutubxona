import { Router, type IRouter } from "express";
import { db, aiHistoryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ExplainTextBody,
  ExplainTextResponse,
  GenerateTestBody,
  GenerateTestResponse,
  GenerateNotesBody,
  GenerateNotesResponse,
  SummarizeTextBody,
  SummarizeTextResponse,
  GetAiHistoryResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { explainText, generateTest, generateNotes, summarizeText } from "../lib/gemini";

const router: IRouter = Router();

router.post("/ai/explain", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = ExplainTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text, bookId } = parsed.data;
  const result = await explainText(text);

  await db.insert(aiHistoryTable).values({
    userId: req.user!.userId,
    bookId: bookId ?? null,
    action: "explain",
    inputText: text,
    result,
  });

  res.json(ExplainTextResponse.parse({ result, action: "explain" }));
});

router.post("/ai/test", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = GenerateTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text, bookId } = parsed.data;
  const questions = await generateTest(text);

  await db.insert(aiHistoryTable).values({
    userId: req.user!.userId,
    bookId: bookId ?? null,
    action: "test",
    inputText: text,
    result: JSON.stringify(questions),
  });

  res.json(GenerateTestResponse.parse({ questions, action: "test" }));
});

router.post("/ai/notes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = GenerateNotesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text, bookId } = parsed.data;
  const result = await generateNotes(text);

  await db.insert(aiHistoryTable).values({
    userId: req.user!.userId,
    bookId: bookId ?? null,
    action: "notes",
    inputText: text,
    result,
  });

  res.json(GenerateNotesResponse.parse({ result, action: "notes" }));
});

router.post("/ai/summary", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = SummarizeTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text, bookId } = parsed.data;
  const result = await summarizeText(text);

  await db.insert(aiHistoryTable).values({
    userId: req.user!.userId,
    bookId: bookId ?? null,
    action: "summary",
    inputText: text,
    result,
  });

  res.json(SummarizeTextResponse.parse({ result, action: "summary" }));
});

router.get("/ai/history", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.userId;

  const history = await db
    .select()
    .from(aiHistoryTable)
    .where(eq(aiHistoryTable.userId, userId))
    .orderBy(aiHistoryTable.createdAt);

  res.json(GetAiHistoryResponse.parse(history.map(h => ({
    id: h.id,
    action: h.action,
    inputText: h.inputText,
    result: h.result,
    bookId: h.bookId ?? null,
    createdAt: h.createdAt.toISOString(),
  }))));
});

export default router;
