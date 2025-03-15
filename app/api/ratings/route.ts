import { NextResponse } from "next/server";
import { supabaseAdmin, getStudentByUserId } from "@/app/lib/db/supabase";
import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@/app/lib/auth/adminCheck";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(userId);

    // Get the student's UUID from their Clerk user ID
    const { data: student, error: studentError } = await getStudentByUserId(
      userId
    );
    if (studentError || !student) {
      console.error("Error fetching student:", studentError?.message);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const data = await request.json();

    // Check for existing rating and delete it
    const { data: existingRatings, error: getRatingError } = await supabaseAdmin
      .from("ratings")
      .select("*")
      .eq("application_id", data.applicationId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (getRatingError) {
      console.error("Error checking existing rating:", getRatingError.message);
      return NextResponse.json(
        { error: "Failed to check existing rating" },
        { status: 500 }
      );
    }

    const existingRating =
      existingRatings && existingRatings.length > 0 ? existingRatings[0] : null;

    // Delete existing rating if found
    if (existingRating) {
      const { error: deleteError } = await supabaseAdmin
        .from("ratings")
        .delete()
        .eq("id", existingRating.id);

      if (deleteError) {
        console.error("Error deleting existing rating:", deleteError.message);
        return NextResponse.json(
          { error: "Failed to delete existing rating" },
          { status: 500 }
        );
      }
    }

    // Add new rating
    const { data: rating, error: addError } = await supabaseAdmin
      .from("ratings")
      .insert({
        id: uuidv4(),
        application_id: data.applicationId,
        score: data.score,
        feedback: data.feedback || null,
        rated_by: student.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (addError) {
      console.error("Error adding rating:", addError.message);
      return NextResponse.json(
        { error: "Failed to add rating" },
        { status: 500 }
      );
    }

    return NextResponse.json({ rating });
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
