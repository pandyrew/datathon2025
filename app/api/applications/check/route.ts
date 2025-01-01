import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db/drizzle";
import { participantApplications, judgeApplications, students, mentorApplications } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const db = await getConnection();

    // First get the student record
    const student = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .limit(1);

    if (!student.length) {
      return NextResponse.json({ hasApplication: false });
    }

    const studentId = student[0].id;

    // Check both participant and judge applications
    const participantApp = await db
      .select({ id: participantApplications.id })
      .from(participantApplications)
      .where(eq(participantApplications.studentId, studentId))
      .limit(1);

    const judgeApp = await db
      .select({ id: judgeApplications.id })
      .from(judgeApplications)
      .where(eq(judgeApplications.studentId, studentId))
      .limit(1);

    const mentorApp = await db
      .select({ id: mentorApplications.id })
      .from(mentorApplications)
      .where(eq(mentorApplications.studentId, studentId))
      .limit(1);

    const coordinatorApp = await db
      .select({ id: coordinatorApplications.id })
      .from(coordinatorApplications)
      .where(eq(coordinatorApplications.studentId, studentId))
      .limit(1);

    const hasApplication =
      participantApp.length > 0 ||
      judgeApp.length > 0 ||
      mentorApp.length > 0 ||
      coordinatorApp.length > 0;

    return NextResponse.json({ hasApplication });
  } catch (error) {
    console.error("Error checking application:", error);
    return NextResponse.json(
      { error: "Failed to check application" },
      { status: 500 }
    );
  }
} 