"use server";

import { supabaseAdmin } from "./db/supabase";

type ParticipantStepData = {
  personal: {
    full_name: string;
    gender: string;
    pronouns: string;
    university: string;
    major: string;
    education_level: string;
  };
  experience: {
    is_first_datathon: boolean;
    comfort_level: number;
    has_team: boolean;
    teammates: string;
    dietary_restrictions: string;
  };
  final: {
    development_goals: string;
    github_url: string;
    linkedin_url: string;
    attendance_confirmed: boolean;
    feedback?: string;
  };
};

type JudgeStepData = {
  basic: {
    full_name: string;
    pronouns: string;
    affiliation: string;
  };
  experience: {
    experience: string;
    motivation: string;
    feedback_comfort: number;
    availability: boolean;
  };
  links: {
    linkedin_url: string;
    github_url: string;
    website_url?: string;
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
    // First determine the role by checking which application exists
    const { data: participantApp } = await supabaseAdmin
      .from("participant_applications")
      .select("*")
      .eq("id", applicationId)
      .limit(1)
      .single();

    const { data: mentorApp } = await supabaseAdmin
      .from("mentor_applications")
      .select("*")
      .eq("id", applicationId)
      .limit(1);

    const { data: judgeApp } = await supabaseAdmin
      .from("judge_applications")
      .select("*")
      .eq("id", applicationId)
      .limit(1);

    const isParticipant = !!participantApp;
    const isMentor = mentorApp && mentorApp.length > 0;
    const isJudge = judgeApp && judgeApp.length > 0;

    let updateData: Record<string, string | number | boolean | string[]> = {};

    if (isParticipant) {
      const stepNumber = parseInt(step);
      const stepKey = getParticipantStepKey(stepNumber);

      switch (stepKey) {
        case "personal":
          updateData = {
            full_name: data.get("full_name") as string,
            gender: data.get("gender") as string,
            pronouns: data.get("pronouns") as string,
            pronouns_other: data.get("pronouns_other") as string,
            university: data.get("university") as string,
            major: data.get("major") as string,
            education_level: data.get("education_level") as string,
          };
          break;

        case "experience":
          updateData = {
            is_first_datathon: data.get("is_first_datathon") === "yes",
            comfort_level: Number(data.get("comfort_level")),
            has_team: data.get("has_team") === "yes",
            teammates: data.get("teammates") as string,
            dietary_restrictions: Array.from(
              data.getAll("dietary_restrictions")
            ).join(", "),
          };
          break;

        case "final":
          updateData = {
            development_goals: data.get("development_goals") as string,
            github_url: data.get("github_url") as string,
            linkedin_url: data.get("linkedin_url") as string,
            attendance_confirmed: data.get("attendance_confirmed") === "on",
            feedback: data.get("feedback") as string,
          };
          break;
      }

      const { data: updated, error } = await supabaseAdmin
        .from("participant_applications")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: updated };
    } else if (isMentor) {
      const stepNumber = parseInt(step);
      const stepKey = stepNumber.toString();

      switch (stepKey) {
        case "1":
          updateData = {
            full_name: data.get("full_name") as string,
            pronouns: data.get("pronouns") as string,
            pronouns_other: data.get("pronouns_other") as string,
            affiliation: data.get("affiliation") as string,
          };
          break;

        case "2":
          updateData = {
            programming_languages: data.getAll(
              "programming_languages"
            ) as string[],
            comfort_level: Number(data.get("comfort_level")),
            has_hackathon_experience:
              data.get("has_hackathon_experience") === "true",
            motivation: data.get("motivation") as string,
            mentor_role_description: data.get(
              "mentor_role_description"
            ) as string,
            availability: data.get("availability") as string,
          };
          break;

        case "3":
          updateData = {
            linkedin_url: data.get("linkedin_url") as string,
            github_url: data.get("github_url") as string,
            website_url: data.get("website_url") as string,
            dietary_restrictions: data.getAll(
              "dietary_restrictions"
            ) as string[],
          };
          break;
      }

      const { data: updated, error } = await supabaseAdmin
        .from("mentor_applications")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: updated };
    } else if (isJudge) {
      // Judge application
      const stepNumber = parseInt(step);
      const stepKey = getJudgeStepKey(stepNumber);

      switch (stepKey) {
        case "basic":
          updateData = {
            full_name: data.get("full_name") as string,
            pronouns: data.get("pronouns") as string,
            pronouns_other: data.get("pronouns_other") as string,
            affiliation: data.get("affiliation") as string,
          };
          break;

        case "experience":
          updateData = {
            experience: data.get("experience") as string,
            motivation: data.get("motivation") as string,
            feedback_comfort: Number(data.get("feedback_comfort")),
            availability: data.get("availability") === "on",
          };
          break;

        case "links":
          updateData = {
            linkedin_url: data.get("linkedin_url") as string,
            github_url: data.get("github_url") as string,
            website_url: data.get("website_url") as string,
            feedback: data.get("feedback") as string,
          };
          break;
      }

      const { data: updated, error } = await supabaseAdmin
        .from("judge_applications")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: updated };
    }

    return {
      success: false,
      error: "Application not found",
    };
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
    // First get the student to determine role
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("id", studentId)
      .limit(1)
      .single();

    if (studentError || !student) {
      return {
        success: false,
        error: "Student not found",
      };
    }

    // Update the appropriate application based on role
    if (student.role === "participant") {
      const { data: updated, error } = await supabaseAdmin
        .from("participant_applications")
        .update({
          status: "submitted",
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", studentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: updated };
    } else if (student.role === "judge") {
      const { data: updated, error } = await supabaseAdmin
        .from("judge_applications")
        .update({
          status: "submitted",
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", studentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: updated };
    } else if (student.role === "mentor") {
      const { data: updated, error } = await supabaseAdmin
        .from("mentor_applications")
        .update({
          status: "submitted",
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", studentId)
        .select()
        .single();

      if (error) throw error;
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
