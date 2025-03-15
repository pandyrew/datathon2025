import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  getStudentWithApplications,
} from "@/app/lib/db/supabase";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get("studentId");
    const type = url.searchParams.get("type");

    if (studentId) {
      // Get all applications for a specific student
      const result = await getStudentWithApplications(studentId);

      if (!result.student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(result);
    } else if (type) {
      // Get all applications of a specific type
      let table;
      switch (type) {
        case "participant":
          table = "participant_applications";
          break;
        case "mentor":
          table = "mentor_applications";
          break;
        case "judge":
          table = "judge_applications";
          break;
        default:
          return NextResponse.json(
            { error: "Invalid application type" },
            { status: 400 }
          );
      }

      const { data, error } = await supabaseAdmin
        .from(table)
        .select("*, students(*)");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    } else {
      // Get counts of all application types
      const [
        { data: participantData, error: participantError },
        { data: mentorData, error: mentorError },
        { data: judgeData, error: judgeError },
      ] = await Promise.all([
        supabaseAdmin
          .from("participant_applications")
          .select("count", { count: "exact" }),
        supabaseAdmin
          .from("mentor_applications")
          .select("count", { count: "exact" }),
        supabaseAdmin
          .from("judge_applications")
          .select("count", { count: "exact" }),
      ]);

      if (participantError || mentorError || judgeError) {
        return NextResponse.json(
          {
            error: "Error fetching application counts",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        counts: {
          participant: participantData[0].count,
          mentor: mentorData[0].count,
          judge: judgeData[0].count,
        },
      });
    }
  } catch (error) {
    console.error("Error in applications API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json(
        {
          error: "Application ID and type are required",
        },
        { status: 400 }
      );
    }

    let table;
    switch (type) {
      case "participant":
        table = "participant_applications";
        break;
      case "mentor":
        table = "mentor_applications";
        break;
      case "judge":
        table = "judge_applications";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid application type" },
          { status: 400 }
        );
    }

    const body = await request.json();

    // Update application status
    const { data, error } = await supabaseAdmin
      .from(table)
      .update({ status: body.status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in applications API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
