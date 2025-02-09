"use server";

import { getConnection } from "./db/drizzle";
import { eq } from "drizzle-orm";
import {
  applications,
  participantDetails,
  mentorDetails,
  judgeDetails,
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

function getParticipantStepKey(step: number) {
  switch (step) {
    case 1:
      return "personal";
    case 2:
      return "experience";
    case 3:
      return "final";
    default:
      return "unknown";
  }
}

function getJudgeStepKey(step: number) {
  switch (step) {
    case 1:
      return "basic";
    case 2:
      return "experience";
    case 3:
      return "links";
    default:
      return "unknown";
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
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }

    let baseUpdateData: Record<string, any> = {};
    let detailsUpdateData: Record<string, any> = {};

    if (application.role === "participant") {
      const stepNumber = parseInt(step);
      const stepKey = getParticipantStepKey(stepNumber);

      switch (stepKey) {
        case "personal":
          baseUpdateData = {
            fullName: data.get("fullName") as string,
            pronouns: data.get("pronouns") as string,
            pronounsOther: data.get("pronounsOther") as string,
          };
          detailsUpdateData = {
            university: data.get("university") as string,
            major: data.get("major") as string,
            educationLevel: data.get("year") as string,
          };
          break;

        case "experience":
          detailsUpdateData = {
            isFirstDatathon: data.get("firstTime") === "yes",
            comfortLevel: Number(data.get("comfort")),
            hasTeam: data.get("team") === "yes",
          };
          baseUpdateData = {
            dietaryRestrictions: Array.from(data.getAll("dietary")),
          };
          break;

        case "final":
          detailsUpdateData = {
            developmentGoals: data.get("development") as string,
          };
          baseUpdateData = {
            githubUrl: data.get("github") as string,
            linkedinUrl: data.get("linkedin") as string,
          };
          break;
      }

      await db
        .update(applications)
        .set({
          ...baseUpdateData,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId));

      await db
        .update(participantDetails)
        .set(detailsUpdateData)
        .where(eq(participantDetails.applicationId, applicationId));

    } else if (application.role === "mentor") {
      const stepNumber = parseInt(step);

      switch (stepNumber) {
        case 1:
          baseUpdateData = {
            fullName: data.get("fullName") as string,
            pronouns: data.get("pronouns") as string,
            pronounsOther: data.get("pronounsOther") as string,
          };
          detailsUpdateData = {
            affiliation: data.get("affiliation") as string,
          };
          break;

        case 2:
          detailsUpdateData = {
            programmingLanguages: data.getAll("programmingLanguages") as string[],
            comfortLevel: Number(data.get("comfortLevel")),
            hasHackathonExperience: data.get("hasHackathonExperience") === "true",
            motivation: data.get("motivation") as string,
            mentorRoleDescription: data.get("mentorRoleDescription") as string,
            availability: data.get("availability") as string,
          };
          break;

        case 3:
          baseUpdateData = {
            linkedinUrl: data.get("linkedin") as string,
            githubUrl: data.get("github") as string,
            websiteUrl: data.get("website") as string,
            dietaryRestrictions: data.getAll("dietaryRestrictions") as string[],
          };
          break;
      }

      await db
        .update(applications)
        .set({
          ...baseUpdateData,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId));

      await db
        .update(mentorDetails)
        .set(detailsUpdateData)
        .where(eq(mentorDetails.applicationId, applicationId));

    } else if (application.role === "judge") {
      const stepNumber = parseInt(step);
      const stepKey = getJudgeStepKey(stepNumber);

      switch (stepKey) {
        case "basic":
          baseUpdateData = {
            fullName: data.get("fullName") as string,
            pronouns: data.get("pronouns") as string,
            pronounsOther: data.get("pronounsOther") as string,
          };
          detailsUpdateData = {
            affiliation: data.get("affiliation") as string,
          };
          break;

        case "experience":
          detailsUpdateData = {
            experience: data.get("experience") as string,
            motivation: data.get("motivation") as string,
            feedbackComfort: Number(data.get("feedbackComfort")),
            availability: data.get("availability") === "on",
          };
          break;

        case "links":
          baseUpdateData = {
            linkedinUrl: data.get("linkedin") as string,
            githubUrl: data.get("github") as string,
            websiteUrl: data.get("website") as string,
          };
          break;
      }

      await db
        .update(applications)
        .set({
          ...baseUpdateData,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId));

      await db
        .update(judgeDetails)
        .set(detailsUpdateData)
        .where(eq(judgeDetails.applicationId, applicationId));
    }

    const [updated] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function submitApplication(applicationId: string) {
  console.log("Submitting application:", applicationId);

  try {
    const db = await getConnection();

    const [updated] = await db
      .update(applications)
      .set({
        status: "submitted",
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning();

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error submitting application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
