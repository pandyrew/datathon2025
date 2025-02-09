import { sql } from "drizzle-orm";
import { closeConnection, getConnection } from "./drizzle";
import {
  users,
  applications,
  participantDetails,
  mentorDetails,
  judgeDetails,
} from "./schema";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";

config({ path: ".env" });

const INITIAL_SCHEMA = `
-- Create teams table first (no dependencies)
CREATE TABLE IF NOT EXISTS "teams" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "size" integer NOT NULL DEFAULT 1,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create users table (depends on teams)
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "team_id" uuid REFERENCES "teams" ("id"),
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create applications table (depends on users)
CREATE TABLE IF NOT EXISTS "applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users" ("id"),
  "role" text NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'draft',
  "full_name" text,
  "pronouns" varchar(20),
  "pronouns_other" text,
  "linkedin_url" text,
  "github_url" text,
  "website_url" text,
  "dietary_restrictions" text[],
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create participant_details table (depends on applications)
CREATE TABLE IF NOT EXISTS "participant_details" (
  "application_id" uuid PRIMARY KEY REFERENCES "applications" ("id"),
  "university" text,
  "major" text,
  "education_level" varchar(20),
  "is_first_datathon" boolean,
  "comfort_level" integer,
  "has_team" boolean,
  "development_goals" text
);

-- Create judge_details table (depends on applications)
CREATE TABLE IF NOT EXISTS "judge_details" (
  "application_id" uuid PRIMARY KEY REFERENCES "applications" ("id"),
  "affiliation" text,
  "experience" text,
  "motivation" text,
  "feedback_comfort" integer,
  "availability" boolean
);

-- Create mentor_details table (depends on applications)
CREATE TABLE IF NOT EXISTS "mentor_details" (
  "application_id" uuid PRIMARY KEY REFERENCES "applications" ("id"),
  "affiliation" text,
  "programming_languages" text[],
  "comfort_level" integer,
  "has_hackathon_experience" boolean,
  "motivation" text,
  "mentor_role_description" text,
  "availability" text
);

-- Create ratings table (depends on applications)
CREATE TABLE IF NOT EXISTS "ratings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "application_id" uuid NOT NULL REFERENCES "applications" ("id"),
  "score" integer NOT NULL,
  "feedback" text,
  "rated_by" uuid NOT NULL REFERENCES "users" ("id"),
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);
`;

const sampleData = [
  {
    user: {
      userId: uuidv4(),
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
    },
    application: {
      role: "participant",
      status: "submitted",
      fullName: "John Doe",
      pronouns: "he/him",
      pronounsOther: null,
      linkedinUrl: "https://linkedin.com/in/johndoe",
      githubUrl: "https://github.com/johndoe",
      dietaryRestrictions: ["vegetarian"],
    },
    details: {
      university: "MIT",
      major: "Computer Science",
      educationLevel: "undergraduate",
      isFirstDatathon: true,
      comfortLevel: 4,
      hasTeam: false,
      developmentGoals: "Learn more about data science",
    },
  },
  {
    user: {
      userId: uuidv4(),
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
    },
    application: {
      role: "judge",
      status: "submitted",
      fullName: "Jane Smith",
      pronouns: "she/her",
      pronounsOther: null,
      linkedinUrl: "https://linkedin.com/in/janesmith",
      githubUrl: "https://github.com/janesmith",
      websiteUrl: "https://janesmith.dev",
      dietaryRestrictions: [],
    },
    details: {
      affiliation: "Stanford University",
      experience: "5 years of experience in data science and machine learning",
      motivation: "Want to help guide the next generation of data scientists",
      feedbackComfort: 5,
      availability: true,
    },
  },
];

async function main() {
  console.log("Starting seed process...");
  const db = await getConnection();

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await db.execute(sql`
      DROP TABLE IF EXISTS "participant_details" CASCADE;
      DROP TABLE IF EXISTS "judge_details" CASCADE;
      DROP TABLE IF EXISTS "mentor_details" CASCADE;
      DROP TABLE IF EXISTS "ratings" CASCADE;
      DROP TABLE IF EXISTS "applications" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
      DROP TABLE IF EXISTS "teams" CASCADE;
    `);

    // Create tables
    console.log("Creating tables...");
    await db.execute(sql.raw(INITIAL_SCHEMA));

    console.log("Seeding fresh data...");
    for (const data of sampleData) {
      // First create the user
      const [user] = await db.insert(users).values(data.user).returning();

      // Then create the application
      const [application] = await db
        .insert(applications)
        .values({
          ...data.application,
          userId: user.id,
        })
        .returning();

      // Finally create the role-specific details
      if (data.application.role === "participant") {
        await db.insert(participantDetails).values({
          ...data.details,
          applicationId: application.id,
        });
      } else if (data.application.role === "judge") {
        await db.insert(judgeDetails).values({
          ...data.details,
          applicationId: application.id,
        });
      } else if (data.application.role === "mentor") {
        await db.insert(mentorDetails).values({
          ...data.details,
          applicationId: application.id,
        });
      }
    }

    console.log("Verifying seeded data...");
    const seededUsers = await db.select().from(users);
    const seededApplications = await db.select().from(applications);
    const seededParticipantDetails = await db.select().from(participantDetails);
    const seededJudgeDetails = await db.select().from(judgeDetails);
    const seededMentorDetails = await db.select().from(mentorDetails);

    console.log("Seeded users:", seededUsers);
    console.log("Seeded applications:", seededApplications);
    console.log("Seeded participant details:", seededParticipantDetails);
    console.log("Seeded judge details:", seededJudgeDetails);
    console.log("Seeded mentor details:", seededMentorDetails);
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
