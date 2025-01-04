import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db/drizzle";
import {
  students,
  participantApplications,
  judgeApplications,
  mentorApplications,
} from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { role } = await request.json();
    const db = await getConnection();

    // First get the student record
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update the role
    const [updated] = await db
      .update(students)
      .set({ role })
      .where(eq(students.userId, userId))
      .returning();

    // Create the appropriate application
    if (role === "participant") {
      await db.insert(participantApplications).values({
        studentId: student.id,
        status: "draft",
        fullName: `${student.firstName} ${student.lastName}`.trim(),
      });
    } else if (role === "judge") {
      await db.insert(judgeApplications).values({
        studentId: student.id,
        status: "draft",
        fullName: `${student.firstName} ${student.lastName}`.trim(),
      });
    } else if (role === "mentor") {
      await db.insert(mentorApplications).values({
        studentId: student.id,
        status: "draft",
        fullName: `${student.firstName} ${student.lastName}`.trim(),
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
