import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/db/supabase";
import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@/app/lib/auth/adminCheck";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(userId);

    // Get application IDs from request body
    const { applicationIds } = await request.json();

    if (
      !applicationIds ||
      !Array.isArray(applicationIds) ||
      applicationIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid application IDs" },
        { status: 400 }
      );
    }

    // Get the most recent rating for each application
    const { data: allRatings, error } = await supabaseAdmin
      .from("ratings")
      .select("*")
      .in("application_id", applicationIds);

    if (error) {
      console.error("Error fetching ratings:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch ratings" },
        { status: 500 }
      );
    }

    // Process ratings to get the most recent one for each application
    const latestRatings: Record<string, {
      id: string;
      application_id: string;
      score: number;
      feedback: string;
      created_at: string;
      user_id: string;
      application_role: string;
    }> = {};

    allRatings.forEach((rating) => {
      const appId = rating.application_id;

      if (
        !latestRatings[appId] ||
        new Date(rating.created_at) > new Date(latestRatings[appId].created_at)
      ) {
        latestRatings[appId] = rating;
      }
    });

    return NextResponse.json({ ratings: latestRatings });
  } catch (error) {
    console.error("Error getting ratings:", error);
    return NextResponse.json(
      { error: "Failed to get ratings" },
      { status: 500 }
    );
  }
}
