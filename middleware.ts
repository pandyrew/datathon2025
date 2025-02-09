import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/_next/static/(.*)",
]);
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",");

export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();

  // Allow public routes and API routes
  if (isPublicRoute(req)) {
    return;
  }

  // If user is authenticated and trying to access root, check their application status
  if (authObject.userId && req.nextUrl.pathname === "/") {
    try {
      const response = await fetch(
        `${req.nextUrl.origin}/api/applications/check`,
        {
          headers: {
            Authorization: `Bearer ${await authObject.getToken()}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (!data.hasApplication) {
          return Response.redirect(new URL("/welcome", req.url));
        }
        return Response.redirect(new URL("/dashboard", req.url));
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  }

  // Handle admin routes
  if (isAdminRoute(req)) {
    if (!authObject.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const response = await fetch(
        `${req.nextUrl.origin}/api/students/${authObject.userId}`
      );
      const data = await response.json();
      if (!ADMIN_EMAILS.includes(data.student.email)) {
        return new Response("Unauthorized: Admin access required", {
          status: 403,
        });
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
