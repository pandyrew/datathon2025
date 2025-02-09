import {
  pgTable,
  uuid,
  timestamp,
  text,
  boolean,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

// For storing teams
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  size: integer("size").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Base user table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(), // Clerk user ID
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  teamId: uuid("team_id").references(() => teams.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Single applications table for all roles
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  role: text("role").notNull(), // "participant", "mentor", "judge"
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  fullName: text("full_name"),
  pronouns: varchar("pronouns", { length: 20 }),
  pronounsOther: text("pronouns_other"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  websiteUrl: text("website_url"),
  dietaryRestrictions: text("dietary_restrictions").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Participant-specific data
export const participantDetails = pgTable("participant_details", {
  applicationId: uuid("application_id").references(() => applications.id).primaryKey(),
  university: text("university"),
  major: text("major"),
  educationLevel: varchar("education_level", { length: 20 }),
  isFirstDatathon: boolean("is_first_datathon"),
  comfortLevel: integer("comfort_level"),
  hasTeam: boolean("has_team"),
  developmentGoals: text("development_goals"),
});

// Mentor-specific data
export const mentorDetails = pgTable("mentor_details", {
  applicationId: uuid("application_id").references(() => applications.id).primaryKey(),
  affiliation: text("affiliation"),
  programmingLanguages: text("programming_languages").array(),
  comfortLevel: integer("comfort_level"),
  hasHackathonExperience: boolean("has_hackathon_experience"),
  motivation: text("motivation"),
  mentorRoleDescription: text("mentor_role_description"),
  availability: text("availability"),
});

// Judge-specific data
export const judgeDetails = pgTable("judge_details", {
  applicationId: uuid("application_id").references(() => applications.id).primaryKey(),
  affiliation: text("affiliation"),
  experience: text("experience"),
  motivation: text("motivation"),
  feedbackComfort: integer("feedback_comfort"),
  availability: boolean("availability"),
});

// For storing sessions if needed
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// For storing ratings
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  ratedBy: uuid("rated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
