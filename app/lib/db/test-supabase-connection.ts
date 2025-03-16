import { config } from "dotenv";
import { checkDatabaseConnection } from "./drizzle";
import { supabase } from "./supabase";

// Load environment variables
config();

async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");

  // Check basic connection
  const isConnected = await checkDatabaseConnection();

  if (!isConnected) {
    console.error("Failed to connect to Supabase database");
    process.exit(1);
  }

  // Test table access
  try {
    console.log("Testing table access...");

    const tables = [
      "students",
      "teams",
      "participant_applications",
      "mentor_applications",
      "judge_applications",
      "ratings",
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("count(*)", { count: "exact" });

      if (error) {
        console.error(`Error accessing ${table} table:`, error.message);
      } else {
        console.log(`✓ ${table} table accessible, count: ${data.length}`);
      }
    }

    console.log("Supabase connection test completed successfully");
  } catch (err) {
    console.error("Error during Supabase connection test:", err);
    process.exit(1);
  }
}

// Run the test
testSupabaseConnection().catch((err) => {
  console.error("Unhandled error during test:", err);
  process.exit(1);
});
