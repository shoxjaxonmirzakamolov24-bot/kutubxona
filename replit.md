# Medical Learning Platform

## Overview

A full-stack AI-powered medical learning platform for university students. Students can read medical books (PDF/DOCX/TXT), highlight text, and use AI to explain concepts in Uzbek, generate MCQ tests, create bullet-point notes, and summarize content. Admins can upload and manage books.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: Express 5 + Node.js
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Google Gemini API (`gemini-2.0-flash`)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **File Upload**: Multer
- **PDF Viewer**: react-pdf
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── medical-learning/   # React frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeding script
```

## Environment Variables Required

- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned by Replit)
- `SESSION_SECRET` — JWT signing secret (set in Replit secrets)
- `GEMINI_API_KEY` — Google Gemini API key (must be added by user)
- `PORT` — Server port (auto-assigned by Replit)

## Database Schema

- `users` — Students and admins (role: student|admin)
- `books` — Uploaded medical books (PDF/DOCX/TXT)
- `highlights` — Text highlights by users within books
- `notes` — Saved AI-generated notes
- `ai_history` — History of AI interactions per user

## Default Accounts (from seed)

- **Admin**: `admin@medical.uz` / `admin123`
- **Student**: `student@medical.uz` / `student123`

## API Endpoints

### Auth
- `POST /api/auth/register` — Register student
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user

### Books
- `GET /api/books` — List books (with category/search filters)
- `GET /api/books/:id` — Get book details
- `POST /api/books/upload` — Upload book (admin only)
- `DELETE /api/books/:id` — Delete book (admin only)
- `POST /api/books/:id/process` — Trigger document processing (admin only)
- `GET /api/categories` — Get book categories

### Highlights
- `GET /api/highlights` — Get user's highlights
- `POST /api/highlights` — Create highlight
- `DELETE /api/highlights/:id` — Delete highlight

### Notes
- `GET /api/notes` — Get user's notes
- `POST /api/notes` — Save note
- `DELETE /api/notes/:id` — Delete note

### AI
- `POST /api/ai/explain` — Explain text in Uzbek with examples
- `POST /api/ai/test` — Generate MCQ test questions
- `POST /api/ai/notes` — Convert to bullet-point notes
- `POST /api/ai/summary` — Summarize in 3-5 sentences
- `GET /api/ai/history` — Get AI interaction history

## Pages

- `/login` — Authentication (login + register)
- `/` — Book library (filtered by category)
- `/books/:id` — Book reader with PDF viewer + AI panel
- `/notes` — Saved notes
- `/highlights` — All highlights
- `/history` — AI interaction history
- `/admin` — Admin panel (upload books, manage library)

## Running

```bash
# API server dev
pnpm --filter @workspace/api-server run dev

# Frontend dev
pnpm --filter @workspace/medical-learning run dev

# Seed database
pnpm --filter @workspace/scripts run seed

# Run codegen after OpenAPI spec changes
pnpm --filter @workspace/api-spec run codegen

# Push database schema
pnpm --filter @workspace/db run push
```
