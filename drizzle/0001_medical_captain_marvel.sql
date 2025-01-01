-- First create teams (no dependencies)
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"size" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Then create students (depends on teams)
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL UNIQUE,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"team_id" uuid REFERENCES "teams"("id"),
	"role" text DEFAULT 'participant' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Finally create application tables (depend on students)
CREATE TABLE "judge_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "participant_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
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
--> statement-breakpoint
-- Drop old applications table if it exists
DROP TABLE IF EXISTS "applications" CASCADE;
--> statement-breakpoint
-- Add foreign key constraints
ALTER TABLE "judge_applications" ADD CONSTRAINT "judge_applications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "participant_applications" ADD CONSTRAINT "participant_applications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE no action ON UPDATE no action;