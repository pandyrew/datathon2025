import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load Supabase environment variables
dotenv.config({ path: ".env" });

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// IDs of extra records to remove
const extraStudentIds = [
  "b64548e0-06ec-4fed-afbc-8c1474aab264", // Andy Hwang
  "f7aeb9a4-046d-4a16-904e-3e01ad4e3d29", // John Doe
];

const extraApplicationIds = [
  "c07ad572-73ba-4125-8bf1-79f119dd795c", // Andy Hwang's application
];

async function removeExtraRecords() {
  console.log("Removing extra records from Supabase...");

  // First remove the participant application (due to foreign key constraints)
  console.log("\nRemoving extra participant applications...");
  for (const id of extraApplicationIds) {
    const { error } = await supabase
      .from("participant_applications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting participant application ${id}:`, error);
    } else {
      console.log(`Successfully deleted participant application: ${id}`);
    }
  }

  // Then remove the students
  console.log("\nRemoving extra students...");
  for (const id of extraStudentIds) {
    const { error } = await supabase.from("students").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting student ${id}:`, error);
    } else {
      console.log(`Successfully deleted student: ${id}`);
    }
  }
}

async function main() {
  try {
    await removeExtraRecords();
    console.log("\nRemoval of extra records completed!");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
