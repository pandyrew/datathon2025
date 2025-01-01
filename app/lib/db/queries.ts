import { getConnection } from "./drizzle";
import {
  participantApplications,
  judgeApplications,
  students,
  teams,
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

export async function getApplicationByStudentId(
  studentId: string,
  role: string
): Promise<ParticipantApplication | JudgeApplication | null> {
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
  }

  return null;
}

export async function updateApplication(
  studentId: string,
  role: string,
  data: Partial<ParticipantApplication | JudgeApplication>
) {
  const db = await getConnection();

  if (role === "participant") {
    const result = await db
      .update(participantApplications)
      .set({
        ...data,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(participantApplications.studentId, studentId))
      .returning();
    return result[0];
  } else if (role === "judge") {
    const result = await db
      .update(judgeApplications)
      .set({
        ...data,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(judgeApplications.studentId, studentId))
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
  role?: string;
}) {
  const db = await getConnection();

  // Create student record
  const [student] = await db
    .insert(students)
    .values({
      ...data,
      role: data.role || "participant",
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

  return true;
}
