import { supabase, supabaseAdmin } from "./supabase";

// Export Supabase clients for direct access when needed
export { supabase, supabaseAdmin };

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("students")
      .select("id")
      .limit(1);
    if (error) {
      console.error("Database connection error:", error.message);
      return false;
    }
    console.log("Database connection successful");
    return true;
  } catch (err) {
    console.error("Database connection error:", err);
    return false;
  }
}
