export type ApplicationStatus = "pending" | "accepted" | "rejected" | "draft";

export type ApplicationType = "participant" | "mentor" | "judge" | "coordinator";

export interface Application {
  id: string;
  fullName: string;
  email: string;
  status: ApplicationStatus;
  submittedAt: string;
} 