import { createWriteStream, mkdirSync } from "fs";
import { join, extname } from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "uploads");

export function ensureUploadDir(): void {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function getUploadPath(originalName: string): { filePath: string; fileUrl: string; fileName: string } {
  const ext = extname(originalName).toLowerCase();
  const fileName = `${randomUUID()}${ext}`;
  const filePath = join(UPLOAD_DIR, fileName);
  const fileUrl = `/api/files/${fileName}`;
  return { filePath, fileUrl, fileName };
}

export function getUploadsDir(): string {
  return UPLOAD_DIR;
}
