import { getUserWithDetails } from "@/app/lib/db/queries";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<Response> {
  try {
    const { userId } = await params;
    console.log("Fetching user data for userId:", userId);

    const userData = await getUserWithDetails(userId);

    if (!userData) {
      console.log("No user found for userId:", userId);
      return new Response("User not found", { status: 404 });
    }

    console.log("Found user data:", userData);
    return Response.json(userData);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
