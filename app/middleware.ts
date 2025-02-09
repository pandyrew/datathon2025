import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { config as appConfig } from "./config";

export default authMiddleware({
  beforeAuth: (req: NextRequest) => {
    // Check if trying to access application routes
    if (req.nextUrl.pathname.startsWith("/dashboard/application")) {
      if (!appConfig.isApplicationOpen) {
        // Redirect to home page if applications aren't open yet
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    return NextResponse.next();
  },
  publicRoutes: ["/", "/about", "/contact", "/sponsors", "/faq"],
});

// Clerk middleware matcher configuration
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
