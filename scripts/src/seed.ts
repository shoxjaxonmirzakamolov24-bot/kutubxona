import { db, usersTable } from "@workspace/db";
import { logger } from "../../artifacts/api-server/src/lib/logger";
import bcrypt from "bcryptjs";

async function seed() {
  logger.info("Seeding database...");

  const adminPassword = await bcrypt.hash("Admin2408Kuaf", 10);

  const [admin] = await db
    .insert(usersTable)
    .values({
      email: "Kuafadmin0824@gmail.com",
      password: adminPassword,
      name: "KUAF Admin",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    logger.info({ email: admin.email }, "Admin user created");
  } else {
    logger.info("Admin user already exists, skipping");
  }

  logger.info("Seeding complete!");

  process.exit(0);
}

seed().catch((err) => {
  logger.error(err, "Seeding failed");
  process.exit(1);
});
