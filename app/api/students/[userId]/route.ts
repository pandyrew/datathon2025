import { NextRequest } from "next/server";
import { supabaseAdmin, getStudentByUserId } from "@/app/lib/db/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<Response> {
  try {
    const { userId } = await params;
    console.log("Fetching student data for userId:", userId);

    // Get the student record
    const { data: student, error: studentError } = await getStudentByUserId(
      userId
    );

    if (studentError || !student) {
      console.log("No student found for userId:", userId);
      return new Response("Student not found", { status: 404 });
    }

    // Get the appropriate application based on role
    let application = null;
    let team = null;

    if (student.role === "participant") {
      const { data: participantApp } = await supabaseAdmin
        .from("participant_applications")
        .select("*")
        .eq("student_id", student.id)
        .limit(1)
        .single();

      application = participantApp;
    } else if (student.role === "judge") {
      const { data: judgeApp } = await supabaseAdmin
        .from("judge_applications")
        .select("*")
        .eq("student_id", student.id)
        .limit(1)
        .single();

      application = judgeApp;
    } else if (student.role === "mentor") {
      const { data: mentorApp } = await supabaseAdmin
        .from("mentor_applications")
        .select("*")
        .eq("student_id", student.id)
        .limit(1)
        .single();

      application = mentorApp;
    }

    // Get team if exists
    if (student.team_id) {
      const { data: teamData } = await supabaseAdmin
        .from("teams")
        .select("*")
        .eq("id", student.team_id)
        .limit(1)
        .single();

      team = teamData;
    }

    const studentData = {
      student,
      application,
      team,
    };

    console.log("Found student data:", studentData);
    return Response.json(studentData);
  } catch (error) {
    console.error("Failed to fetch student data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
