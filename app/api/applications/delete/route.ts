import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin, getStudentByUserId } from "@/app/lib/db/supabase";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // First get the student record
    const { data: student, error: studentError } = await getStudentByUserId(
      userId
    );

    if (studentError || !student) {
      console.error("Error fetching student:", studentError?.message);
      return NextResponse.json({ success: false, error: "Student not found" });
    }

    const studentId = student.id;

    // Delete from participant applications
    const { error: participantError } = await supabaseAdmin
      .from("participant_applications")
      .delete()
      .eq("student_id", studentId);

    if (participantError) {
      console.error(
        "Error deleting participant application:",
        participantError.message
      );
    }

    // Delete from judge applications
    const { error: judgeError } = await supabaseAdmin
      .from("judge_applications")
      .delete()
      .eq("student_id", studentId);

    if (judgeError) {
      console.error("Error deleting judge application:", judgeError.message);
    }

    // Delete from mentor applications
    const { error: mentorError } = await supabaseAdmin
      .from("mentor_applications")
      .delete()
      .eq("student_id", studentId);

    if (mentorError) {
      console.error("Error deleting mentor application:", mentorError.message);
    }

    // Reset the student's role to null
    const { error: updateError } = await supabaseAdmin
      .from("students")
      .update({ role: null, updated_at: new Date().toISOString() })
      .eq("id", studentId);

    if (updateError) {
      console.error("Error updating student role:", updateError.message);
      return NextResponse.json({
        success: false,
        error: "Failed to update student role",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
