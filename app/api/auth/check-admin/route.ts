import { getUserWithDetails } from "@/app/lib/db/queries";

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  try {
    const userData = await getUserWithDetails(userId);
    const isAdmin = ADMIN_EMAILS.includes(userData?.email || "");
    
    return new Response(JSON.stringify({ isAdmin }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 