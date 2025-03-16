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
  mastersProgram?: string;
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

// Type guard to check if an application is a ParticipantApplication
export function isParticipantApplication(
  application: Application
): application is ParticipantApplication {
  return "isFirstDatathon" in application;
}

// Helper function to safely access mastersProgram
export function getMastersProgram(
  application: Application
): string | undefined {
  if (isParticipantApplication(application)) {
    return application.mastersProgram;
  }
  return undefined;
}
