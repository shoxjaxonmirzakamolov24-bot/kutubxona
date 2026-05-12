import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function ensureAdminExists() {
  try {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, "Kuafadmin0824@gmail.com"));

    if (!existing) {
      const hashed = await bcrypt.hash("Admin2408Kuaf", 10);
      await db.insert(usersTable).values({
        email: "Kuafadmin0824@gmail.com",
        password: hashed,
        name: "KUAF Admin",
        role: "admin",
      });
      logger.info("Admin user created automatically");
    }
  } catch (err) {
    logger.warn({ err }, "Could not ensure admin user exists");
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await ensureAdminExists();
});
