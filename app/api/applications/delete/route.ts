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

export async function DELETE() {
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
      return NextResponse.json({ success: false, error: "Student not found" });
    }

    const studentId = student[0].id;

    // Delete from all application types
    await db
      .delete(participantApplications)
      .where(eq(participantApplications.studentId, studentId));

    await db
      .delete(judgeApplications)
      .where(eq(judgeApplications.studentId, studentId));

    await db
      .delete(mentorApplications)
      .where(eq(mentorApplications.studentId, studentId));

    // Reset the student's role to null
    await db
      .update(students)
      .set({ role: null })
      .where(eq(students.userId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
