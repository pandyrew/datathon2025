import {
  pgTable,
  uuid,
  timestamp,
  text,
  boolean,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

// For storing student information
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(), // Clerk user ID
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  teamId: uuid("team_id").references(() => teams.id),
  role: text("role").default("participant").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// For storing teams
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  size: integer("size").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Common application fields
const commonFields = {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

// For storing participant applications
export const participantApplications = pgTable("participant_applications", {
  ...commonFields,
  gender: varchar("gender", { length: 20 }),
  pronouns: varchar("pronouns", { length: 20 }),
  pronounsOther: text("pronouns_other"),
  university: text("university"),
  major: text("major"),
  educationLevel: varchar("education_level", { length: 20 }),
  isFirstDatathon: boolean("is_first_datathon"),
  comfortLevel: integer("comfort_level"),
  hasTeam: boolean("has_team"),
  teammates: text("teammates"),
  dietaryRestrictions: text("dietary_restrictions"),
  developmentGoals: text("development_goals"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  attendanceConfirmed: boolean("attendance_confirmed"),
  feedback: text("feedback"),
});

// For storing judge applications
export const judgeApplications = pgTable("judge_applications", {
  ...commonFields,
  pronouns: varchar("pronouns", { length: 20 }),
  pronounsOther: text("pronouns_other"),
  affiliation: text("affiliation"),
  experience: text("experience"),
  motivation: text("motivation"),
  feedbackComfort: integer("feedback_comfort"),
  availability: boolean("availability"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  websiteUrl: text("website_url"),
});

// You can keep these if needed for other functionality
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});
