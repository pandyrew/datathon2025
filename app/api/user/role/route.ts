import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin, getStudentByUserId } from "@/app/lib/db/supabase";
import { v4 as uuidv4 } from "uuid";

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { role } = await request.json();

    // First get the student record
    const { data: student, error: studentError } = await getStudentByUserId(
      userId
    );

    if (studentError || !student) {
      console.error("Error fetching student:", studentError?.message);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update the role
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("students")
      .update({
        role: role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", student.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating student role:", updateError.message);
      return NextResponse.json(
        { error: "Failed to update role" },
        { status: 500 }
      );
    }

    // Create the appropriate application
    if (role === "participant") {
      const { error: insertError } = await supabaseAdmin
        .from("participant_applications")
        .insert({
          id: uuidv4(),
          student_id: student.id,
          status: "draft",
          full_name: `${student.first_name} ${student.last_name}`.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(
          "Error creating participant application:",
          insertError.message
        );
        return NextResponse.json(
          { error: "Failed to create application" },
          { status: 500 }
        );
      }
    } else if (role === "judge") {
      const { error: insertError } = await supabaseAdmin
        .from("judge_applications")
        .insert({
          id: uuidv4(),
          student_id: student.id,
          status: "draft",
          full_name: `${student.first_name} ${student.last_name}`.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error creating judge application:", insertError.message);
        return NextResponse.json(
          { error: "Failed to create application" },
          { status: 500 }
        );
      }
    } else if (role === "mentor") {
      const { error: insertError } = await supabaseAdmin
        .from("mentor_applications")
        .insert({
          id: uuidv4(),
          student_id: student.id,
          status: "draft",
          full_name: `${student.first_name} ${student.last_name}`.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(
          "Error creating mentor application:",
          insertError.message
        );
        return NextResponse.json(
          { error: "Failed to create application" },
          { status: 500 }
        );
      }
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
