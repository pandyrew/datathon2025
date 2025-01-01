import { sql } from "drizzle-orm";
import { closeConnection, getConnection } from "./drizzle";
import { participantApplications, judgeApplications, students } from "./schema";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";

config({ path: ".env" });

const sampleData = [
  {
    student: {
      userId: uuidv4(),
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "participant",
    },
    application: {
      fullName: "John Doe",
      gender: "male",
      pronouns: "he/him",
      pronounsOther: null,
      university: "MIT",
      major: "Computer Science",
      educationLevel: "undergraduate",
      isFirstDatathon: true,
      comfortLevel: 4,
      hasTeam: false,
      teammates: null,
      dietaryRestrictions: "vegetarian",
      developmentGoals: "Learn more about data science",
      githubUrl: "https://github.com/johndoe",
      linkedinUrl: "https://linkedin.com/in/johndoe",
      attendanceConfirmed: true,
      feedback: null,
      status: "pending",
    },
  },
  {
    student: {
      userId: uuidv4(),
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "judge",
    },
    application: {
      fullName: "Jane Smith",
      pronouns: "she/her",
      pronounsOther: null,
      affiliation: "Stanford University",
      experience: "5 years of experience in data science and machine learning",
      motivation: "Want to help guide the next generation of data scientists",
      feedbackComfort: 5,
      availability: true,
      linkedinUrl: "https://linkedin.com/in/janesmith",
      githubUrl: "https://github.com/janesmith",
      websiteUrl: "https://janesmith.dev",
      feedback: null,
      status: "pending",
    },
  },
];

async function main() {
  console.log("Starting seed process...");
  const db = await getConnection();

  try {
    // First check if tables exist
    const tables = await db.execute(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);

    const tableNames = tables.rows.map((row) => row.tablename);
    console.log("Existing tables:", tableNames);

    // Create tables if they don't exist
    if (!tableNames.includes("teams")) {
      console.log("Creating teams table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "teams" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" text NOT NULL,
          "size" integer NOT NULL DEFAULT 1,
          "created_at" timestamp NOT NULL DEFAULT NOW(),
          "updated_at" timestamp NOT NULL DEFAULT NOW()
        );
      `);
    }

    if (!tableNames.includes("students")) {
      console.log("Creating students table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "students" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id" text NOT NULL UNIQUE,
          "email" text NOT NULL,
          "first_name" text NOT NULL,
          "last_name" text NOT NULL,
          "team_id" uuid REFERENCES "teams" ("id"),
          "role" text NOT NULL,
          "created_at" timestamp NOT NULL DEFAULT NOW(),
          "updated_at" timestamp NOT NULL DEFAULT NOW()
        );
      `);
    }

    if (!tableNames.includes("participant_applications")) {
      console.log("Creating participant_applications table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "participant_applications" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "student_id" uuid NOT NULL REFERENCES "students" ("id"),
          "status" varchar(20) NOT NULL DEFAULT 'draft',
          "full_name" text,
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
          "feedback" text,
          "created_at" timestamp NOT NULL DEFAULT NOW(),
          "updated_at" timestamp NOT NULL DEFAULT NOW()
        );
      `);
    }

    if (!tableNames.includes("judge_applications")) {
      console.log("Creating judge_applications table...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "judge_applications" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "student_id" uuid NOT NULL REFERENCES "students" ("id"),
          "status" varchar(20) NOT NULL DEFAULT 'draft',
          "full_name" text,
          "pronouns" varchar(20),
          "pronouns_other" text,
          "affiliation" text,
          "experience" text,
          "motivation" text,
          "feedback_comfort" integer,
          "availability" boolean,
          "linkedin_url" text,
          "github_url" text,
          "website_url" text,
          "feedback" text,
          "created_at" timestamp NOT NULL DEFAULT NOW(),
          "updated_at" timestamp NOT NULL DEFAULT NOW()
        );
      `);
    }

    console.log("Seeding fresh data...");
    for (const data of sampleData) {
      // First create the student
      const [student] = await db
        .insert(students)
        .values(data.student)
        .returning();

      // Then create the appropriate application with the student's ID
      if (data.student.role === "participant") {
        await db.insert(participantApplications).values({
          ...data.application,
          studentId: student.id,
        });
      } else if (data.student.role === "judge") {
        await db.insert(judgeApplications).values({
          ...data.application,
          studentId: student.id,
        });
      }
    }

    console.log("Verifying seeded data...");
    const seededStudents = await db.select().from(students);
    const seededParticipantApps = await db.select().from(participantApplications);
    const seededJudgeApps = await db.select().from(judgeApplications);
    console.log("Seeded students:", seededStudents);
    console.log("Seeded participant applications:", seededParticipantApps);
    console.log("Seeded judge applications:", seededJudgeApps);
  } catch (error) {
    console.error("Error in seed process:", error);
    throw error;
  }

  console.log("Seed completed successfully!");
  await closeConnection();
  process.exit();
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
