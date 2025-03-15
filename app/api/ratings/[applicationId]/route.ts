import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/db/supabase";
import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@/app/lib/auth/adminCheck";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(userId);

    const { applicationId } = await params;

    // Get the most recent rating for this application
    const { data: ratings, error } = await supabaseAdmin
      .from("ratings")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching rating:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch rating" },
        { status: 500 }
      );
    }

    const rating = ratings && ratings.length > 0 ? ratings[0] : null;
    return NextResponse.json({ rating });
  } catch (error) {
    console.error("Error getting rating:", error);
    return NextResponse.json(
      { error: "Failed to get rating" },
      { status: 500 }
    );
  }
}
