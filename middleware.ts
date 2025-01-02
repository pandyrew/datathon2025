import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);

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
      if (data.student.email !== "dataclub@uci.edu") {
        return new Response(
          "Dude you cant be here!!!!! If you are supposed to be here and you are part of data at uci, then TEXT ME. you know who to text....",
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
