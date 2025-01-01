CREATE TABLE "mentor_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
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
--> statement-breakpoint
ALTER TABLE "mentor_applications" ADD CONSTRAINT "mentor_applications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;