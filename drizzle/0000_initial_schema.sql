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