export enum ApplicationStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export type ApplicationRole = "participant" | "mentor" | "judge";

export type EducationLevel = "undergraduate" | "graduate" | "phd" | "other";

// Base application type that matches our applications table
export interface BaseApplication {
  id: string;
  userId: string;
  role: ApplicationRole;
  status: ApplicationStatus;
  fullName: string;
  pronouns?: string;
  pronounsOther?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  dietaryRestrictions?: string[];
  createdAt: string;
  updatedAt: string;
}

// Participant details type
export interface ParticipantDetails {
  applicationId: string;
  university?: string;
  major?: string;
  educationLevel?: EducationLevel;
  isFirstDatathon?: boolean;
  comfortLevel?: number;
  hasTeam?: boolean;
  developmentGoals?: string;
}

// Mentor details type
export interface MentorDetails {
  applicationId: string;
  affiliation?: string;
  programmingLanguages?: string[];
  comfortLevel?: number;
  hasHackathonExperience?: boolean;
  motivation?: string;
  mentorRoleDescription?: string;
  availability?: string;
}

// Judge details type
export interface JudgeDetails {
  applicationId: string;
  affiliation?: string;
  experience?: string;
  motivation?: string;
  feedbackComfort?: number;
  availability?: boolean;
}

// Combined types for full application data
export interface ParticipantApplication extends BaseApplication {
  role: "participant";
  details: ParticipantDetails;
}

export interface MentorApplication extends BaseApplication {
  role: "mentor";
  details: MentorDetails;
}

export interface JudgeApplication extends BaseApplication {
  role: "judge";
  details: JudgeDetails;
}

export type Application = ParticipantApplication | MentorApplication | JudgeApplication;
