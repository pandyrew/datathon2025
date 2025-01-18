import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db/drizzle";
import {
  participantApplications,
  judgeApplications,
  students,
  mentorApplications,
} from "@/app/lib/db/schema";
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
      return NextResponse.json({ hasApplication: false, applicationStatus: null });
    }

    const studentId = student[0].id;

    // Check applications and their status
    const participantApp = await db
      .select({ id: participantApplications.id, status: participantApplications.status })
      .from(participantApplications)
      .where(eq(participantApplications.studentId, studentId))
      .limit(1);

    const judgeApp = await db
      .select({ id: judgeApplications.id, status: judgeApplications.status })
      .from(judgeApplications)
      .where(eq(judgeApplications.studentId, studentId))
      .limit(1);

    const mentorApp = await db
      .select({ id: mentorApplications.id, status: mentorApplications.status })
      .from(mentorApplications)
      .where(eq(mentorApplications.studentId, studentId))
      .limit(1);

    const application = participantApp[0] || judgeApp[0] || mentorApp[0];
    const hasApplication = !!application;

    return NextResponse.json({ 
      hasApplication,
      applicationStatus: application ? application.status : null 
    });
  } catch (error) {
    console.error("Error checking application:", error);
    return NextResponse.json(
      { error: "Failed to check application" },
      { status: 500 }
    );
  }
}
