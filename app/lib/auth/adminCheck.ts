import { getStudentWithDetails } from "@/app/lib/db/queries";

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",");

export async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  
  const studentData = await getStudentWithDetails(userId);
  if (!studentData?.student.email) return false;
  
  return ADMIN_EMAILS.includes(studentData.student.email);
}

export async function requireAdmin(userId: string | null): Promise<void> {
  if (!await isAdmin(userId)) {
    throw new Error("Unauthorized: Admin access required");
  }
}
