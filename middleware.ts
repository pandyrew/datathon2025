import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",");

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const authObject = await auth();
    if (!authObject.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const response = await fetch(
        `${req.nextUrl.origin}/api/students/${authObject.userId}`
      );
      const data = await response.json();
      if (!ADMIN_EMAILS.includes(data.student.email)) {
        return new Response(
          "Unauthorized: Admin access required",
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
