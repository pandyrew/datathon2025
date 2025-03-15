import { createClient } from "@supabase/supabase-js";
import { Database } from "./supabase-types";
import { v4 as uuidv4 } from "uuid";
import { ApplicationType } from "@/app/types/application";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

// Client for public operations (with anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Admin client for privileged operations (with service role key)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey
);

// Helper functions for common operations

// Students
export async function getStudents() {
  return supabaseAdmin.from("students").select("*");
}

export async function getStudentById(id: string) {
  return supabaseAdmin.from("students").select("*").eq("id", id).single();
}

export async function getStudentByUserId(userId: string) {
  return supabaseAdmin
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .single();
}

export async function createStudent(data: {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  team_id?: string;
}) {
  return supabaseAdmin
    .from("students")
    .insert({
      id: uuidv4(),
      user_id: data.user_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role || null,
      team_id: data.team_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
}

// Teams
export async function getTeams() {
  return supabaseAdmin.from("teams").select("*");
}

export async function getTeamById(id: string) {
  return supabaseAdmin.from("teams").select("*").eq("id", id).single();
}

export async function createTeam(data: { name: string; size?: number }) {
  return supabaseAdmin
    .from("teams")
    .insert({
      id: uuidv4(),
      name: data.name,
      size: data.size || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
}

// Participant Applications
export async function getParticipantApplications() {
  return supabaseAdmin.from("participant_applications").select("*");
}

export async function getParticipantApplicationById(id: string) {
  return supabaseAdmin
    .from("participant_applications")
    .select("*")
    .eq("id", id)
    .single();
}

export async function getParticipantApplicationByStudentId(studentId: string) {
  return supabaseAdmin
    .from("participant_applications")
    .select("*")
    .eq("student_id", studentId)
    .single();
}

// Mentor Applications
export async function getMentorApplications() {
  return supabaseAdmin.from("mentor_applications").select("*");
}

export async function getMentorApplicationById(id: string) {
  return supabaseAdmin
    .from("mentor_applications")
    .select("*")
    .eq("id", id)
    .single();
}

export async function getMentorApplicationByStudentId(studentId: string) {
  return supabaseAdmin
    .from("mentor_applications")
    .select("*")
    .eq("student_id", studentId)
    .single();
}

// Judge Applications
export async function getJudgeApplications() {
  return supabaseAdmin.from("judge_applications").select("*");
}

export async function getJudgeApplicationById(id: string) {
  return supabaseAdmin
    .from("judge_applications")
    .select("*")
    .eq("id", id)
    .single();
}

export async function getJudgeApplicationByStudentId(studentId: string) {
  return supabaseAdmin
    .from("judge_applications")
    .select("*")
    .eq("student_id", studentId)
    .single();
}

// Ratings
export async function getRatings() {
  return supabaseAdmin.from("ratings").select("*");
}

export async function getRatingById(id: string) {
  return supabaseAdmin.from("ratings").select("*").eq("id", id).single();
}

export async function getRatingsByApplicationId(applicationId: string) {
  return supabaseAdmin
    .from("ratings")
    .select("*")
    .eq("application_id", applicationId);
}

// Combined queries
export async function getStudentWithApplications(studentId: string) {
  const { data: student } = await getStudentById(studentId);

  if (!student) return { student: null, applications: {} };

  const [{ data: participantApp }, { data: mentorApp }, { data: judgeApp }] =
    await Promise.all([
      getParticipantApplicationByStudentId(studentId),
      getMentorApplicationByStudentId(studentId),
      getJudgeApplicationByStudentId(studentId),
    ]);

  return {
    student,
    applications: {
      participant: participantApp,
      mentor: mentorApp,
      judge: judgeApp,
    },
  };
}

// Combined application query for admin page
export async function getApplicationByStudentId(
  applicationId: string,
  role: ApplicationType
) {
  if (role === "participant") {
    return supabaseAdmin
      .from("participant_applications")
      .select("*")
      .eq("id", applicationId)
      .single();
  } else if (role === "mentor") {
    return supabaseAdmin
      .from("mentor_applications")
      .select("*")
      .eq("id", applicationId)
      .single();
  } else if (role === "judge") {
    return supabaseAdmin
      .from("judge_applications")
      .select("*")
      .eq("id", applicationId)
      .single();
  }

  return { data: null, error: new Error("Invalid application type") };
}

// Application Stats
export async function getApplicationStats() {
  const [
    { data: participantApps, error: participantError },
    { data: mentorApps, error: mentorError },
    { data: judgeApps, error: judgeError },
  ] = await Promise.all([
    supabaseAdmin.from("participant_applications").select("status"),
    supabaseAdmin.from("mentor_applications").select("status"),
    supabaseAdmin.from("judge_applications").select("status"),
  ]);

  if (participantError || mentorError || judgeError) {
    console.error(
      "Error fetching application stats:",
      participantError || mentorError || judgeError
    );
    return {
      participant: { total: 0, submitted: 0, accepted: 0, rejected: 0 },
      mentor: { total: 0, submitted: 0, accepted: 0, rejected: 0 },
      judge: { total: 0, submitted: 0, accepted: 0, rejected: 0 },
    };
  }

  type AppWithStatus = { status: string };

  const countByStatus = (apps: AppWithStatus[] | null) => {
    if (!apps) return { total: 0, submitted: 0, accepted: 0, rejected: 0 };

    // Only count applications with valid statuses
    const validApps = apps.filter((app) =>
      ["pending", "submitted", "accepted", "rejected", "draft"].includes(
        app.status
      )
    );

    const total = validApps.length;
    // Count both "pending" and "submitted" as submitted applications
    const submitted = validApps.filter(
      (app) => app.status === "pending" || app.status === "submitted"
    ).length;
    const accepted = validApps.filter(
      (app) => app.status === "accepted"
    ).length;
    const rejected = validApps.filter(
      (app) => app.status === "rejected"
    ).length;

    return { total, submitted, accepted, rejected };
  };

  return {
    participant: countByStatus(participantApps),
    mentor: countByStatus(mentorApps),
    judge: countByStatus(judgeApps),
  };
}

// Get applications by type and status for admin dashboard
export async function getApplicationsByTypeAndStatus(type: ApplicationType) {
  let tableName = "";

  if (type === "participant") {
    tableName = "participant_applications";
  } else if (type === "mentor") {
    tableName = "mentor_applications";
  } else if (type === "judge") {
    tableName = "judge_applications";
  } else {
    return { data: null, error: new Error("Invalid application type") };
  }

  // First get all applications with their student IDs
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .select(
      `
      id,
      student_id,
      status,
      full_name,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching ${type} applications:`, error);
    return { data: null, error };
  }

  // Get all student emails in a separate query
  const studentIds = data.map((app) => app.student_id).filter(Boolean);

  const studentEmails: Record<string, string> = {};
  const studentNames: Record<string, string> = {};

  if (studentIds.length > 0) {
    const { data: students, error: studentsError } = await supabaseAdmin
      .from("students")
      .select("id, email, first_name, last_name")
      .in("id", studentIds);

    if (studentsError) {
      console.error("Error fetching student emails:", studentsError);
    } else if (students) {
      // Create maps of student ID to email and name
      students.forEach((student) => {
        studentEmails[student.id] = student.email;
        if (student.first_name && student.last_name) {
          studentNames[
            student.id
          ] = `${student.first_name} ${student.last_name}`;
        }
      });
    }
  }

  // Transform the data to match the expected format
  const transformedData = data.map((app) => ({
    id: app.id,
    fullName: studentNames[app.student_id] || app.full_name || "Unknown",
    email: studentEmails[app.student_id] || "Unknown Email",
    status: app.status,
    submittedAt: new Date(app.created_at),
  }));

  // Group by status, treating "submitted" as "pending" for display purposes
  const grouped = {
    pending: transformedData.filter(
      (app) => app.status === "pending" || app.status === "submitted"
    ),
    accepted: transformedData.filter((app) => app.status === "accepted"),
    rejected: transformedData.filter((app) => app.status === "rejected"),
    draft: transformedData.filter((app) => app.status === "draft"),
  };

  return { data: grouped, error: null };
}

// Get student with details for admin check
export async function getStudentWithDetails(userId: string) {
  const { data: student, error } = await getStudentByUserId(userId);

  if (error || !student) {
    console.error("Error fetching student:", error?.message);
    return null;
  }

  return { student };
}
