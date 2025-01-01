import { getStudentWithDetails } from "@/app/lib/db/queries";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<Response> {
  try {
    const { userId } = await params;
    console.log("Fetching student data for userId:", userId);

    const studentData = await getStudentWithDetails(userId);

    if (!studentData) {
      console.log("No student found for userId:", userId);
      return new Response("Student not found", { status: 404 });
    }

    console.log("Found student data:", studentData);
    return Response.json(studentData);
  } catch (error) {
    console.error("Failed to fetch student data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
