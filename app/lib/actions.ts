"use server";

import { getConnection } from "./db/drizzle";
import { eq } from "drizzle-orm";
import {
  participantApplications,
  judgeApplications,
  students,
} from "./db/schema";

type ParticipantStepData = {
  personal: {
    fullName: string;
    gender: string;
    pronouns: string;
    university: string;
    major: string;
    educationLevel: string;
  };
  experience: {
    isFirstDatathon: boolean;
    comfortLevel: number;
    hasTeam: boolean;
    teammates: string;
    dietaryRestrictions: string;
  };
  final: {
    developmentGoals: string;
    githubUrl: string;
    linkedinUrl: string;
    attendanceConfirmed: boolean;
    feedback?: string;
  };
};

type JudgeStepData = {
  basic: {
    fullName: string;
    pronouns: string;
    affiliation: string;
  };
  experience: {
    experience: string;
    motivation: string;
    feedbackComfort: number;
    availability: boolean;
  };
  links: {
    linkedinUrl: string;
    githubUrl: string;
    websiteUrl?: string;
    feedback?: string;
  };
};

function getParticipantStepKey(step: number): keyof ParticipantStepData {
  switch (step) {
    case 1:
      return "personal";
    case 2:
      return "experience";
    case 3:
      return "final";
    default:
      throw new Error(`Invalid step number: ${step}`);
  }
}

function getJudgeStepKey(step: number): keyof JudgeStepData {
  switch (step) {
    case 1:
      return "basic";
    case 2:
      return "experience";
    case 3:
      return "links";
    default:
      throw new Error(`Invalid step number: ${step}`);
  }
}

export async function updateApplicationData(
  applicationId: string,
  step: string,
  data: FormData
) {
  try {
    const db = await getConnection();

    // First determine the role by checking which application exists
    const participantApp = await db
      .select()
      .from(participantApplications)
      .where(eq(participantApplications.id, applicationId))
      .limit(1);

    const isParticipant = participantApp.length > 0;
    let updateData: Record<string, string | number | boolean> = {};

    if (isParticipant) {
      const stepNumber = parseInt(step);
      const stepKey = getParticipantStepKey(stepNumber);

      switch (stepKey) {
        case "personal":
          updateData = {
            fullName: data.get("fullName") as string,
            gender: data.get("gender") as string,
            pronouns: data.get("pronouns") as string,
            pronounsOther: data.get("pronounsOther") as string,
            university: data.get("university") as string,
            major: data.get("major") as string,
            educationLevel: data.get("year") as string,
          };
          break;

        case "experience":
          updateData = {
            isFirstDatathon: data.get("firstTime") === "yes",
            comfortLevel: Number(data.get("comfort")),
            hasTeam: data.get("team") === "yes",
            teammates: data.get("teammates") as string,
            dietaryRestrictions: Array.from(data.getAll("dietary")).join(", "),
          };
          break;

        case "final":
          updateData = {
            developmentGoals: data.get("development") as string,
            githubUrl: data.get("github") as string,
            linkedinUrl: data.get("linkedin") as string,
            attendanceConfirmed: data.get("confirmation") === "on",
            feedback: data.get("feedback") as string,
          };
          break;
      }

      const [updated] = await db
        .update(participantApplications)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(participantApplications.id, applicationId))
        .returning();

      return { success: true, data: updated };
    } else {
      // Judge application
      const stepNumber = parseInt(step);
      const stepKey = getJudgeStepKey(stepNumber);

      switch (stepKey) {
        case "basic":
          updateData = {
            fullName: data.get("fullName") as string,
            pronouns: data.get("pronouns") as string,
            pronounsOther: data.get("pronounsOther") as string,
            affiliation: data.get("affiliation") as string,
          };
          break;

        case "experience":
          updateData = {
            experience: data.get("experience") as string,
            motivation: data.get("motivation") as string,
            feedbackComfort: Number(data.get("feedbackComfort")),
            availability: data.get("availability") === "on",
          };
          break;

        case "links":
          updateData = {
            linkedinUrl: data.get("linkedin") as string,
            githubUrl: data.get("github") as string,
            websiteUrl: data.get("website") as string,
            feedback: data.get("feedback") as string,
          };
          break;
      }

      const [updated] = await db
        .update(judgeApplications)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(judgeApplications.id, applicationId))
        .returning();

      return { success: true, data: updated };
    }
  } catch (error) {
    console.error("Error updating application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function submitApplication(studentId: string) {
  console.log("Submitting application for student:", studentId);

  try {
    const db = await getConnection();

    // First get the student to determine role
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      return {
        success: false,
        error: "Student not found",
      };
    }

    // Update the appropriate application based on role
    if (student.role === "participant") {
      const [updated] = await db
        .update(participantApplications)
        .set({
          status: "submitted",
          updatedAt: new Date(),
        })
        .where(eq(participantApplications.studentId, studentId))
        .returning();

      return { success: true, data: updated };
    } else if (student.role === "judge") {
      const [updated] = await db
        .update(judgeApplications)
        .set({
          status: "submitted",
          updatedAt: new Date(),
        })
        .where(eq(judgeApplications.studentId, studentId))
        .returning();

      return { success: true, data: updated };
    }

    return {
      success: false,
      error: "Invalid role",
    };
  } catch (error) {
    console.error("Error submitting application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
