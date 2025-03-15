import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin, getStudentByUserId } from "@/app/lib/db/supabase";

export async function GET() {
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
      return NextResponse.json({
        hasApplication: false,
        applicationStatus: null,
      });
    }

    const studentId = student.id;

    // Check participant application
    const { data: participantApp, error: participantError } =
      await supabaseAdmin
        .from("participant_applications")
        .select("id, status")
        .eq("student_id", studentId)
        .limit(1)
        .single();

    if (participantError && participantError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error(
        "Error checking participant application:",
        participantError.message
      );
    }

    // Check judge application
    const { data: judgeApp, error: judgeError } = await supabaseAdmin
      .from("judge_applications")
      .select("id, status")
      .eq("student_id", studentId)
      .limit(1)
      .single();

    if (judgeError && judgeError.code !== "PGRST116") {
      console.error("Error checking judge application:", judgeError.message);
    }

    // Check mentor application
    const { data: mentorApp, error: mentorError } = await supabaseAdmin
      .from("mentor_applications")
      .select("id, status")
      .eq("student_id", studentId)
      .limit(1)
      .single();

    if (mentorError && mentorError.code !== "PGRST116") {
      console.error("Error checking mentor application:", mentorError.message);
    }

    // Find the first application that exists
    const application = participantApp || judgeApp || mentorApp;
    const hasApplication = !!application;

    return NextResponse.json({
      hasApplication,
      applicationStatus: application ? application.status : null,
    });
  } catch (error) {
    console.error("Error checking application:", error);
    return NextResponse.json(
      { error: "Failed to check application" },
      { status: 500 }
    );
  }
}
