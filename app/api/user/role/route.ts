import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db/drizzle";
import {
  users,
  applications,
  participantDetails,
  judgeDetails,
  mentorDetails,
} from "@/app/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { role } = await request.json();

    // Validate role
    if (!["participant", "judge", "mentor"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    const db = await getConnection();

    // First get the user record
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an application with this role
    const [existingApplication] = await db
      .select()
      .from(applications)
      .where(
        and(eq(applications.userId, user.id), eq(applications.role, role))
      );

    if (existingApplication) {
      return NextResponse.json(
        { error: "Application for this role already exists" },
        { status: 400 }
      );
    }

    // Create the application with the appropriate role
    const [application] = await db
      .insert(applications)
      .values({
        userId: user.id,
        role,
        status: "draft",
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        dietaryRestrictions: [],
      })
      .returning();

    // Create role-specific details
    try {
      if (role === "participant") {
        await db.insert(participantDetails).values({
          applicationId: application.id,
          isFirstDatathon: false,
          hasTeam: false,
          comfortLevel: 1,
        });
      } else if (role === "judge") {
        await db.insert(judgeDetails).values({
          applicationId: application.id,
          feedbackComfort: 1,
          availability: false,
        });
      } else if (role === "mentor") {
        await db.insert(mentorDetails).values({
          applicationId: application.id,
          programmingLanguages: [],
          comfortLevel: 1,
          hasHackathonExperience: false,
          availability: "",
        });
      }
    } catch (error) {
      // If creating details fails, clean up the application
      await db.delete(applications).where(eq(applications.id, application.id));
      throw error;
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error("Failed to create application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
