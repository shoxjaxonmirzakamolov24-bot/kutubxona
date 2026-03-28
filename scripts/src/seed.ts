import { db, usersTable, booksTable } from "@workspace/db";
import { logger } from "../../artifacts/api-server/src/lib/logger";
import bcrypt from "bcryptjs";

async function seed() {
  logger.info("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  const [admin] = await db
    .insert(usersTable)
    .values({
      email: "admin@medical.uz",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    logger.info({ email: admin.email }, "Admin user created");
  } else {
    logger.info("Admin user already exists");
  }

  const [student] = await db
    .insert(usersTable)
    .values({
      email: "student@medical.uz",
      password: studentPassword,
      name: "Test Student",
      role: "student",
    })
    .onConflictDoNothing()
    .returning();

  if (student) {
    logger.info({ email: student.email }, "Student user created");
  } else {
    logger.info("Student user already exists");
  }

  const sampleBooks = [
    {
      title: "Clinical Anatomy: A Core Text with Self-Assessment",
      author: "Roger Blackwood",
      description: "A comprehensive guide to clinical anatomy with case studies and self-assessment questions for medical students.",
      category: "Anatomy",
      fileUrl: "https://www.africau.edu/images/default/sample.pdf",
      fileType: "pdf" as const,
      processed: false,
    },
    {
      title: "Physiology Made Incredibly Easy",
      author: "Lippincott Williams",
      description: "Clear, concise explanations of physiology concepts with helpful illustrations and memory aids.",
      category: "Physiology",
      fileUrl: "https://www.africau.edu/images/default/sample.pdf",
      fileType: "pdf" as const,
      processed: false,
    },
    {
      title: "Pathology: Principles and Practice",
      author: "James Lowe",
      description: "An essential textbook covering the principles of general pathology with clinical correlations.",
      category: "Pathology",
      fileUrl: "https://www.africau.edu/images/default/sample.pdf",
      fileType: "pdf" as const,
      processed: false,
    },
    {
      title: "Pharmacology: Drug Actions and Reactions",
      author: "Ruth Levine",
      description: "A concise reference covering drug mechanisms, clinical uses, and adverse effects for medical students.",
      category: "Pharmacology",
      fileUrl: "https://www.africau.edu/images/default/sample.pdf",
      fileType: "pdf" as const,
      processed: false,
    },
    {
      title: "Introduction to Microbiology",
      author: "Ananthanarayan",
      description: "Covers bacteria, viruses, fungi, and parasites with emphasis on clinical relevance and pathogenesis.",
      category: "Microbiology",
      fileUrl: "https://www.africau.edu/images/default/sample.pdf",
      fileType: "pdf" as const,
      processed: false,
    },
  ];

  for (const book of sampleBooks) {
    const [created] = await db
      .insert(booksTable)
      .values(book)
      .onConflictDoNothing()
      .returning();
    if (created) {
      logger.info({ title: created.title }, "Book seeded");
    }
  }

  logger.info("Seeding complete!");
  logger.info("Admin login: admin@medical.uz / admin123");
  logger.info("Student login: student@medical.uz / student123");

  process.exit(0);
}

seed().catch((err) => {
  logger.error(err, "Seeding failed");
  process.exit(1);
});
