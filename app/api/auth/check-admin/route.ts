import { getStudentWithDetails } from "@/app/lib/db/queries";

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  try {
    const studentData = await getStudentWithDetails(userId);
    const isAdmin = ADMIN_EMAILS.includes(studentData?.student.email || "");
    
    return new Response(JSON.stringify({ isAdmin }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 