CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"role" text NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"full_name" text,
	"pronouns" varchar(20),
	"pronouns_other" text,
	"linkedin_url" text,
	"github_url" text,
	"website_url" text,
	"dietary_restrictions" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "judge_details" (
	"application_id" uuid PRIMARY KEY NOT NULL,
	"affiliation" text,
	"experience" text,
	"motivation" text,
	"feedback_comfort" integer,
	"availability" boolean
);
--> statement-breakpoint
CREATE TABLE "mentor_details" (
	"application_id" uuid PRIMARY KEY NOT NULL,
	"affiliation" text,
	"programming_languages" text[],
	"comfort_level" integer,
	"has_hackathon_experience" boolean,
	"motivation" text,
	"mentor_role_description" text,
	"availability" text
);
--> statement-breakpoint
CREATE TABLE "participant_details" (
	"application_id" uuid PRIMARY KEY NOT NULL,
	"university" text,
	"major" text,
	"education_level" varchar(20),
	"is_first_datathon" boolean,
	"comfort_level" integer,
	"has_team" boolean,
	"development_goals" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"team_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint

-- Migrate data from students to users
INSERT INTO users (id, user_id, email, first_name, last_name, team_id, created_at, updated_at)
SELECT id, user_id, email, first_name, last_name, team_id, created_at, updated_at
FROM students;

-- Migrate participant applications
INSERT INTO applications (id, user_id, role, status, full_name, pronouns, pronouns_other, linkedin_url, github_url, dietary_restrictions, created_at, updated_at)
SELECT 
    id, 
    student_id, 
    'participant', 
    status, 
    full_name, 
    pronouns, 
    pronouns_other, 
    linkedin_url, 
    github_url, 
    ARRAY[dietary_restrictions], 
    created_at, 
    updated_at
FROM participant_applications;

INSERT INTO participant_details (application_id, university, major, education_level, is_first_datathon, comfort_level, has_team, development_goals)
SELECT 
    id,
    university,
    major,
    education_level,
    is_first_datathon,
    comfort_level,
    has_team,
    development_goals
FROM participant_applications;

-- Migrate mentor applications
INSERT INTO applications (id, user_id, role, status, full_name, pronouns, pronouns_other, linkedin_url, github_url, website_url, dietary_restrictions, created_at, updated_at)
SELECT 
    id, 
    student_id, 
    'mentor', 
    status, 
    full_name, 
    pronouns, 
    pronouns_other, 
    linkedin_url, 
    github_url, 
    website_url,
    dietary_restrictions,
    created_at, 
    updated_at
FROM mentor_applications;

INSERT INTO mentor_details (application_id, affiliation, programming_languages, comfort_level, has_hackathon_experience, motivation, mentor_role_description, availability)
SELECT 
    id,
    affiliation,
    programming_languages,
    comfort_level,
    has_hackathon_experience,
    motivation,
    mentor_role_description,
    availability
FROM mentor_applications;

-- Migrate judge applications
INSERT INTO applications (id, user_id, role, status, full_name, pronouns, pronouns_other, linkedin_url, github_url, website_url, created_at, updated_at)
SELECT 
    id, 
    student_id, 
    'judge', 
    status, 
    full_name, 
    pronouns, 
    pronouns_other, 
    linkedin_url, 
    github_url, 
    website_url,
    created_at, 
    updated_at
FROM judge_applications;

INSERT INTO judge_details (application_id, affiliation, experience, motivation, feedback_comfort, availability)
SELECT 
    id,
    affiliation,
    experience,
    motivation,
    feedback_comfort,
    availability
FROM judge_applications;

--> statement-breakpoint
ALTER TABLE "judge_applications" DISABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "mentor_applications" DISABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "participant_applications" DISABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "students" DISABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP TABLE "judge_applications" CASCADE;
--> statement-breakpoint
DROP TABLE "mentor_applications" CASCADE;
--> statement-breakpoint
DROP TABLE "participant_applications" CASCADE;
--> statement-breakpoint
DROP TABLE "students" CASCADE;
--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "application_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "rated_by" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "judge_details" ADD CONSTRAINT "judge_details_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "mentor_details" ADD CONSTRAINT "mentor_details_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "participant_details" ADD CONSTRAINT "participant_details_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rated_by_users_id_fk" FOREIGN KEY ("rated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ratings" DROP COLUMN "application_role";