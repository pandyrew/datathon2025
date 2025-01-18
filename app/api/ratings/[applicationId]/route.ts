import { NextResponse } from "next/server";
import { getRating } from "@/app/lib/db/queries";
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
    const rating = await getRating(applicationId);
    return NextResponse.json({ rating });
  } catch (error) {
    console.error("Error getting rating:", error);
    return NextResponse.json(
      { error: "Failed to get rating" },
      { status: 500 }
    );
  }
}
