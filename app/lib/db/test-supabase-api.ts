import { config } from "dotenv";
import { checkDatabaseConnection } from "./drizzle";
import { supabaseAdmin } from "./supabase";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
config();

async function testSupabaseApi() {
  console.log("Testing Supabase API connection...");

  // Check basic connection
  const isConnected = await checkDatabaseConnection();

  if (!isConnected) {
    console.error("Failed to connect to Supabase database");
    process.exit(1);
  }

  // First, let's check the actual schema
  try {
    console.log("Checking students table schema...");

    // Alternative: just query a student and see what fields are returned
    const { data: sampleStudent, error: sampleError } = await supabaseAdmin
      .from("students")
      .select("*")
      .limit(1);

    if (sampleError) {
      console.error("Error getting sample student:", sampleError.message);
    } else {
      console.log(
        "Sample student schema:",
        sampleStudent.length > 0
          ? Object.keys(sampleStudent[0])
          : "No students found"
      );
    }

    // Test student creation with first_name and last_name instead of name
    const testEmail = `test-${Date.now()}@example.com`;
    const testFirstName = "Test";
    const testLastName = "User";
    const testUserId = `user_${Date.now()}`;
    const testId = uuidv4(); // Generate a UUID for the ID

    console.log(`Creating test student with email: ${testEmail}`);

    // Try with first_name and last_name and provide an ID
    const { data: createdStudent, error: createError } = await supabaseAdmin
      .from("students")
      .insert({
        id: testId,
        email: testEmail,
        first_name: testFirstName,
        last_name: testLastName,
        user_id: testUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating test student:", createError.message);
      process.exit(1);
    }

    console.log("✓ Successfully created test student:", createdStudent);

    // Test student retrieval
    const { data: retrievedStudent, error: retrieveError } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("id", createdStudent.id)
      .single();

    if (retrieveError) {
      console.error("Error retrieving test student:", retrieveError.message);
      process.exit(1);
    }

    console.log("✓ Successfully retrieved test student:", retrievedStudent);

    // Test student update
    const updatedLastName = "Updated";

    const { data: updatedStudent, error: updateError } = await supabaseAdmin
      .from("students")
      .update({ last_name: updatedLastName })
      .eq("id", createdStudent.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating test student:", updateError.message);
      process.exit(1);
    }

    console.log("✓ Successfully updated test student:", updatedStudent);

    // Test student deletion
    const { error: deleteError } = await supabaseAdmin
      .from("students")
      .delete()
      .eq("id", createdStudent.id);

    if (deleteError) {
      console.error("Error deleting test student:", deleteError.message);
      process.exit(1);
    }

    console.log("✓ Successfully deleted test student");

    console.log("Supabase API test completed successfully");
  } catch (err) {
    console.error("Error during Supabase API test:", err);
    process.exit(1);
  }
}

// Run the test
testSupabaseApi().catch((err) => {
  console.error("Unhandled error during test:", err);
  process.exit(1);
});
