import { Router, type IRouter } from "express";
import { db, booksTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import multer from "multer";
import { join, extname } from "path";
import { mkdirSync } from "fs";
import { randomUUID } from "crypto";
import {
  GetBooksResponse,
  GetBookResponse,
  DeleteBookResponse,
  ProcessBookResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin, type AuthRequest } from "../lib/auth";
import { createReadStream, existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".docx", ".txt"];
    const ext = extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed"));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router: IRouter = Router();

router.get("/books", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { category, search } = req.query as { category?: string; search?: string };

  let query = db.select().from(booksTable);
  const conditions = [];

  if (category) {
    conditions.push(eq(booksTable.category, category));
  }
  if (search) {
    conditions.push(ilike(booksTable.title, `%${search}%`));
  }

  const books = conditions.length > 0
    ? await db.select().from(booksTable).where(and(...conditions)).orderBy(booksTable.createdAt)
    : await db.select().from(booksTable).orderBy(booksTable.createdAt);

  void query;

  res.json(GetBooksResponse.parse(books.map(b => ({
    id: b.id,
    title: b.title,
    author: b.author ?? null,
    description: b.description ?? null,
    category: b.category ?? null,
    fileUrl: b.fileUrl,
    fileType: b.fileType,
    processed: b.processed,
    pageCount: b.pageCount ?? null,
    createdAt: b.createdAt.toISOString(),
  }))));
});

router.get("/books/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid book ID" });
    return;
  }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  res.json(GetBookResponse.parse({
    id: book.id,
    title: book.title,
    author: book.author ?? null,
    description: book.description ?? null,
    category: book.category ?? null,
    fileUrl: book.fileUrl,
    fileType: book.fileType,
    processed: book.processed,
    pageCount: book.pageCount ?? null,
    createdAt: book.createdAt.toISOString(),
  }));
});

router.post("/books/upload", requireAdmin, upload.single("file"), async (req: AuthRequest, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "File is required" });
    return;
  }

  const { title, author, description, category } = req.body as {
    title?: string;
    author?: string;
    description?: string;
    category?: string;
  };

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const ext = extname(req.file.originalname).toLowerCase().slice(1) as "pdf" | "docx" | "txt";
  const fileUrl = `/api/files/${req.file.filename}`;

  const [book] = await db.insert(booksTable).values({
    title,
    author: author || null,
    description: description || null,
    category: category || null,
    fileUrl,
    fileType: ext,
  }).returning();

  res.status(201).json({
    id: book.id,
    title: book.title,
    author: book.author ?? null,
    description: book.description ?? null,
    category: book.category ?? null,
    fileUrl: book.fileUrl,
    fileType: book.fileType,
    processed: book.processed,
    pageCount: book.pageCount ?? null,
    createdAt: book.createdAt.toISOString(),
  });
});

router.delete("/books/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid book ID" });
    return;
  }

  const [book] = await db.delete(booksTable).where(eq(booksTable.id, id)).returning();
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  res.json(DeleteBookResponse.parse({ message: "Book deleted successfully" }));
});

router.post("/books/:id/process", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid book ID" });
    return;
  }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  await db.update(booksTable).set({ processed: true }).where(eq(booksTable.id, id));

  res.json(ProcessBookResponse.parse({ message: "Document processing started" }));
});

router.get("/categories", requireAuth, async (_req, res): Promise<void> => {
  const results = await db
    .select({
      name: booksTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(booksTable)
    .where(sql`${booksTable.category} IS NOT NULL`)
    .groupBy(booksTable.category);

  res.json(results.filter(r => r.name !== null).map(r => ({ name: r.name!, count: r.count })));
});

router.get("/files/:filename", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filePath = join(UPLOAD_DIR, raw);

  if (!existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  const ext = extname(raw).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
  };

  res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const stream = createReadStream(filePath);
  stream.pipe(res);
});

export default router;
