import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db/drizzle";
import { users, applications } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const db = await getConnection();

    // First get the user record
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ hasApplication: false, applicationStatus: null });
    }

    // Check for any applications
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, user.id))
      .limit(1);

    return NextResponse.json({ 
      hasApplication: !!application,
      applicationStatus: application?.status || null 
    });
  } catch (error) {
    console.error("Error checking application:", error);
    return NextResponse.json(
      { error: "Failed to check application" },
      { status: 500 }
    );
  }
}
