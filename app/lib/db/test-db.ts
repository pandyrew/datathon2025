import { getConnection } from "./drizzle";
import { sql } from "drizzle-orm";

async function testDb() {
  try {
    console.log("Testing database connection...");
    console.log("Database URL:", process.env.DATABASE_URL);

    const db = await getConnection();

    // Create teams table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "teams" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "size" integer NOT NULL DEFAULT 1,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      );
    `);

    // Create students table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "students" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL UNIQUE,
        "email" text NOT NULL,
        "first_name" text NOT NULL,
        "last_name" text NOT NULL,
        "team_id" uuid REFERENCES "teams" ("id"),
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      );
    `);

    // Create applications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL REFERENCES "students" ("id"),
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "full_name" text,
        "gender" varchar(20),
        "pronouns" varchar(20),
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
        "feedback" text,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Created all tables");

    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

    console.log("Tables found:", tables.rows);
  } catch (error) {
    console.error("Error:", error);
  }
}

testDb().catch(console.error);
