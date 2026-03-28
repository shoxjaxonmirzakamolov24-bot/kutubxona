import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody, LoginResponse, GetCurrentUserResponse } from "@workspace/api-zod";
import { hashPassword, comparePassword, signToken, requireAuth, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }

  const hashed = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({ email, password: hashed, name, role: "student" }).returning();

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.status(201).json(LoginResponse.parse({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt.toISOString() },
    token,
  }));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.json(LoginResponse.parse({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt.toISOString() },
    token,
  }));
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(GetCurrentUserResponse.parse({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }));
});

export default router;
