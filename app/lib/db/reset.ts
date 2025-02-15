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
      // Drop tables one by one in correct order
      await db.execute(
        sql`DROP TABLE IF EXISTS "participant_applications" CASCADE;`
      );
      await db.execute(sql`DROP TABLE IF EXISTS "judge_applications" CASCADE;`);
      await db.execute(
        sql`DROP TABLE IF EXISTS "mentor_applications" CASCADE;`
      );
      await db.execute(sql`DROP TABLE IF EXISTS "applications" CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS "ratings" CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS "users" CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS "students" CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS "teams" CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS "sessions" CASCADE;`);
      console.log("Dropped all tables");
    } else {
      console.log("No tables to drop");
    }

    // 2. Create tables in correct order
    console.log("Creating tables...");

    // Create teams table first (no dependencies)
    await db.execute(sql`
      CREATE TABLE "teams" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "size" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create students table (depends on teams)
    await db.execute(sql`
      CREATE TABLE "students" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL UNIQUE,
        "email" text NOT NULL,
        "first_name" text NOT NULL,
        "last_name" text NOT NULL,
        "team_id" uuid REFERENCES "teams"("id"),
        "role" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create judge_applications table (depends on students)
    await db.execute(sql`
      CREATE TABLE "judge_applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL REFERENCES "students"("id"),
        "status" varchar(20) DEFAULT 'draft' NOT NULL,
        "full_name" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "pronouns" varchar(20),
        "pronouns_other" text,
        "affiliation" text,
        "experience" text,
        "motivation" text,
        "feedback_comfort" integer,
        "availability" boolean,
        "linkedin_url" text,
        "github_url" text,
        "website_url" text
      );
    `);

    // Create mentor_applications table (depends on students)
    await db.execute(sql`
      CREATE TABLE "mentor_applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL REFERENCES "students"("id"),
        "status" varchar(20) DEFAULT 'draft' NOT NULL,
        "full_name" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "pronouns" varchar(20),
        "pronouns_other" text,
        "affiliation" text,
        "programming_languages" text[],
        "comfort_level" integer,
        "has_hackathon_experience" boolean,
        "motivation" text,
        "mentor_role_description" text,
        "availability" text,
        "linkedin_url" text,
        "github_url" text,
        "website_url" text,
        "dietary_restrictions" text[]
      );
    `);

    // Create participant_applications table (depends on students)
    await db.execute(sql`
      CREATE TABLE "participant_applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL REFERENCES "students"("id"),
        "status" varchar(20) DEFAULT 'draft' NOT NULL,
        "full_name" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "gender" varchar(20),
        "pronouns" varchar(20),
        "pronouns_other" text,
        "university" text,
        "major" text,
        "education_level" varchar(20),
        "is_first_datathon" boolean,
        "comfort_level" integer,
        "has_team" boolean,
        "teammates" text,
        "dietary_restrictions" text,
        "development_goals" text,
        "github_url" text,
        "linkedin_url" text,
        "attendance_confirmed" boolean,
        "feedback" text
      );
    `);

    // Create ratings table
    await db.execute(sql`
      CREATE TABLE "ratings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "application_id" uuid NOT NULL,
        "score" integer NOT NULL,
        "feedback" text,
        "rated_by" uuid NOT NULL REFERENCES "students"("id"),
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("Created all tables");
  } catch (error) {
    console.error("Error during reset:", error);
    throw error;
  }

  // 3. Ensure migrations directory exists
  const migrationsDir = path.join(process.cwd(), "drizzle");
  await fs.mkdir(migrationsDir, { recursive: true });

  // 4. Create meta directory and _journal.json
  const metaDir = path.join(migrationsDir, "meta");
  await fs.mkdir(metaDir, { recursive: true });

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

  await closeConnection();
  console.log("Database reset completed");
}

reset().catch(console.error);
