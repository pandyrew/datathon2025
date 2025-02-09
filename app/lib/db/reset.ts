import { sql } from "drizzle-orm";
import { closeConnection, getConnection } from "./drizzle";
import fs from "fs/promises";
import path from "path";

async function reset() {
  console.log("Starting database reset...");

  // 1. Drop all tables if they exist
  const db = await getConnection();
  try {
    // First check if tables exist
    const tables = await db.execute(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);

    if (tables.rows.length > 0) {
      console.log("Dropping existing tables...");
      await db.execute(sql`
        DROP TABLE IF EXISTS "judge_applications" CASCADE;
        DROP TABLE IF EXISTS "participant_applications" CASCADE;
        DROP TABLE IF EXISTS "mentor_applications" CASCADE;
        DROP TABLE IF EXISTS "students" CASCADE;
        DROP TABLE IF EXISTS "participant_details" CASCADE;
        DROP TABLE IF EXISTS "judge_details" CASCADE;
        DROP TABLE IF EXISTS "mentor_details" CASCADE;
        DROP TABLE IF EXISTS "ratings" CASCADE;
        DROP TABLE IF EXISTS "applications" CASCADE;
        DROP TABLE IF EXISTS "users" CASCADE;
        DROP TABLE IF EXISTS "teams" CASCADE;
      `);
      console.log("Dropped all tables");
    } else {
      console.log("No tables to drop");
    }

    // 2. Ensure migrations directory exists
    const migrationsDir = path.join(process.cwd(), "drizzle", "migrations");
    const metaDir = path.join(migrationsDir, "meta");

    await fs.mkdir(metaDir, { recursive: true });

    // 3. Create _journal.json
    const journalContent = {
      version: "5",
      dialect: "pg",
      entries: [],
    };

    await fs.writeFile(
      path.join(metaDir, "_journal.json"),
      JSON.stringify(journalContent, null, 2)
    );

    console.log("Created migrations directory structure");
  } catch (error) {
    console.error("Error during reset:", error);
    throw error;
  }

  await closeConnection();
  console.log("Database reset completed");
}

reset().catch(console.error);
