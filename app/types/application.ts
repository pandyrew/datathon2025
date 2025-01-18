export enum ApplicationStatus {
  SUBMITTED = "submitted",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export type ApplicationType =
  | "participant"
  | "mentor"
  | "judge"
  | "coordinator";

export type EducationLevel = "undergraduate" | "graduate" | "phd" | "other";

interface BaseApplication {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  university: string;
  major: string;
  educationLevel: EducationLevel;
  githubUrl?: string;
  linkedinUrl?: string;
  dietaryRestrictions?: string;
  attendanceConfirmed?: boolean;
}

export interface ParticipantApplication extends BaseApplication {
  isFirstDatathon: boolean;
  comfortLevel: number;
  hasTeam: boolean;
  developmentGoals: string;
}

export interface MentorApplication extends BaseApplication {
  comfortLevel: number;
  developmentGoals: string;
  mentorshipExperience?: string;
  technicalSkills: string[];
}

export interface JudgeApplication extends BaseApplication {
  experienceLevel: number;
  previousExperience?: string;
  areasOfExpertise: string[];
}

export type Application =
  | ParticipantApplication
  | MentorApplication
  | JudgeApplication;
