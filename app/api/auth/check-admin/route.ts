import { getStudentByUserId } from "@/app/lib/db/supabase";

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  try {
    const { data: student, error } = await getStudentByUserId(userId);

    if (error) {
      console.error("Error fetching student:", error.message);
      return new Response("Internal Server Error", { status: 500 });
    }

    const isAdmin = ADMIN_EMAILS.includes(student?.email || "");

    return new Response(JSON.stringify({ isAdmin }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
