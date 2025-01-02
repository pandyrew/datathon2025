import { getConnection } from "./drizzle";
import {
  participantApplications,
  judgeApplications,
  students,
  teams,
  mentorApplications,
} from "./schema";
import { eq, sql } from "drizzle-orm";

export interface BaseApplication {
  id: string;
  studentId: string;
  status: string;
  fullName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantApplication extends BaseApplication {
  gender: string | null;
  pronouns: string | null;
  pronounsOther: string | null;
  university: string | null;
  major: string | null;
  educationLevel: string | null;
  isFirstDatathon: boolean | null;
  comfortLevel: number | null;
  hasTeam: boolean | null;
  teammates: string | null;
  dietaryRestrictions: string | null;
  developmentGoals: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  attendanceConfirmed: boolean | null;
  feedback: string | null;
}

export interface JudgeApplication extends BaseApplication {
  pronouns: string | null;
  pronounsOther: string | null;
  affiliation: string | null;
  experience: string | null;
  motivation: string | null;
  feedbackComfort: number | null;
  availability: boolean | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
}

export interface MentorApplication extends BaseApplication {
  pronouns: string | null;
  pronounsOther: string | null;
  affiliation: string | null;
  programmingLanguages: string[] | null;
  comfortLevel: number | null;
  hasHackathonExperience: boolean | null;
  motivation: string | null;
  mentorRoleDescription: string | null;
  availability: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  dietaryRestrictions: string[] | null;
}

export async function getApplicationByStudentId(
  studentId: string,
  role: string
): Promise<
  ParticipantApplication | JudgeApplication | MentorApplication | null
> {
  const db = await getConnection();

  if (role === "participant") {
    const result = await db
      .select()
      .from(participantApplications)
      .where(eq(participantApplications.studentId, studentId))
      .limit(1);
    return result[0] || null;
  } else if (role === "judge") {
    const result = await db
      .select()
      .from(judgeApplications)
      .where(eq(judgeApplications.studentId, studentId))
      .limit(1);
    return result[0] || null;
  } else if (role === "mentor") {
    const result = await db
      .select()
      .from(mentorApplications)
      .where(eq(mentorApplications.studentId, studentId))
      .limit(1);
    return result[0] || null;
  }

  return null;
}

export async function updateApplication(
  studentId: string,
  role: string,
  data: Partial<ParticipantApplication | JudgeApplication | MentorApplication>
) {
  const db = await getConnection();

  if (role === "participant") {
    const participantData = data as Partial<ParticipantApplication>;
    const result = await db
      .update(participantApplications)
      .set({
        ...participantData,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(participantApplications.studentId, studentId))
      .returning();
    return result[0];
  } else if (role === "judge") {
    const judgeData = data as Partial<JudgeApplication>;
    const result = await db
      .update(judgeApplications)
      .set({
        ...judgeData,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(judgeApplications.studentId, studentId))
      .returning();
    return result[0];
  } else if (role === "mentor") {
    const mentorData = data as Partial<MentorApplication>;
    const result = await db
      .update(mentorApplications)
      .set({
        ...mentorData,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(mentorApplications.studentId, studentId))
      .returning();
    return result[0];
  }
}

export async function getAllApplications(role: string) {
  const db = await getConnection();
  if (role === "participant") {
    return db.select().from(participantApplications);
  } else if (role === "judge") {
    return db.select().from(judgeApplications);
  } else if (role === "mentor") {
    return db.select().from(mentorApplications);
  }
  return [];
}

export async function updateApplicationStatus(
  studentId: string,
  role: string,
  status: "draft" | "pending" | "accepted" | "rejected"
) {
  const db = await getConnection();

  if (role === "participant") {
    const result = await db
      .update(participantApplications)
      .set({
        status,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(participantApplications.studentId, studentId))
      .returning();
    return result[0];
  } else if (role === "judge") {
    const result = await db
      .update(judgeApplications)
      .set({
        status,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(judgeApplications.studentId, studentId))
      .returning();
    return result[0];
  } else if (role === "mentor") {
    const result = await db
      .update(mentorApplications)
      .set({
        status,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(mentorApplications.studentId, studentId))
      .returning();
    return result[0];
  }
}

export async function testConnection() {
  try {
    const db = await getConnection();
    const result = await db.select().from(students).limit(1);
    console.log("Database connection successful:", result);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

export async function createStudent(data: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}) {
  const db = await getConnection();

  // Create student record
  const [student] = await db
    .insert(students)
    .values({
      ...data,
    })
    .returning();

  return { student };
}

export async function getStudentWithDetails(userId: string) {
  try {
    const db = await getConnection();

    // First get the student
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .limit(1);

    if (!studentResult.length) return null;

    const student = studentResult[0];
    let application = null;

    // Get the appropriate application based on role
    if (student.role === "participant") {
      const [participantApp] = await db
        .select()
        .from(participantApplications)
        .where(eq(participantApplications.studentId, student.id))
        .limit(1);
      application = participantApp;
    } else if (student.role === "judge") {
      const [judgeApp] = await db
        .select()
        .from(judgeApplications)
        .where(eq(judgeApplications.studentId, student.id))
        .limit(1);
      application = judgeApp;
    } else if (student.role === "mentor") {
      const [mentorApp] = await db
        .select()
        .from(mentorApplications)
        .where(eq(mentorApplications.studentId, student.id))
        .limit(1);
      application = mentorApp;
    }

    // Get team if exists
    let team = null;
    if (student.teamId) {
      const [teamResult] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, student.teamId))
        .limit(1);
      team = teamResult;
    }

    return {
      student,
      application,
      team,
    };
  } catch (error) {
    console.error("Error getting student details:", error);
    throw new Error("Failed to get student details");
  }
}

export async function updateStudentRole(userId: string, role: string) {
  const db = await getConnection();

  return db
    .update(students)
    .set({ role })
    .where(eq(students.userId, userId))
    .returning();
}

export async function deleteApplications(studentId: string) {
  const db = await getConnection();

  // Delete from both application tables
  await db
    .delete(participantApplications)
    .where(eq(participantApplications.studentId, studentId));

  await db
    .delete(judgeApplications)
    .where(eq(judgeApplications.studentId, studentId));

  await db
    .delete(mentorApplications)
    .where(eq(mentorApplications.studentId, studentId));

  return true;
}

export async function getApplicationStats() {
  const db = await getConnection();

  try {
    // Get participant applications count with status breakdown
    const participantStats = await db
      .select({
        total: sql`count(*)::int`,
        pending: sql`count(case when status = 'pending' then 1 end)::int`,
        approved: sql`count(case when status = 'accepted' then 1 end)::int`,
        rejected: sql`count(case when status = 'rejected' then 1 end)::int`,
      })
      .from(participantApplications);

    // Get mentor applications count
    const mentorStats = await db
      .select({
        total: sql`count(*)::int`,
        pending: sql`count(case when status = 'pending' then 1 end)::int`,
        approved: sql`count(case when status = 'accepted' then 1 end)::int`,
        rejected: sql`count(case when status = 'rejected' then 1 end)::int`,
      })
      .from(mentorApplications);

    // Get judge applications count
    const judgeStats = await db
      .select({
        total: sql`count(*)::int`,
        pending: sql`count(case when status = 'pending' then 1 end)::int`,
        approved: sql`count(case when status = 'accepted' then 1 end)::int`,
        rejected: sql`count(case when status = 'rejected' then 1 end)::int`,
      })
      .from(judgeApplications);

    return {
      participant: participantStats[0],
      mentor: mentorStats[0],
      judge: judgeStats[0],
    };
  } catch (error) {
    console.error("Error getting application stats:", error);
    throw new Error("Failed to get application statistics");
  }
}
