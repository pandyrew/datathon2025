import { NextResponse } from "next/server";
import {
  addRating,
  getStudentWithDetails,
  deleteRating,
  getRating,
} from "@/app/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@/app/lib/auth/adminCheck";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(userId);

    // Get the student's UUID from their Clerk user ID
    const studentDetails = await getStudentWithDetails(userId);
    if (!studentDetails?.student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const data = await request.json();

    // Check for existing rating and delete it
    const existingRating = await getRating(data.applicationId);
    if (existingRating) {
      await deleteRating(existingRating.id);
    }

    const rating = await addRating({
      ...data,
      ratedBy: studentDetails.student.id,
    });

    return NextResponse.json({ rating });
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
