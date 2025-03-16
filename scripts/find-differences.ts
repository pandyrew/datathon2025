import dotenv from "dotenv";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";

// Load Neon environment variables
dotenv.config({ path: ".env.neon" });

// Neon connection
const neonConnectionString = process.env.DATABASE_URL;
if (!neonConnectionString) {
  throw new Error(
    "DATABASE_URL (Neon) is not defined in environment variables in .env.neon"
  );
}

console.log(
  "Using Neon connection string:",
  neonConnectionString.replace(/:[^:]*@/, ":***@")
);

// Now load Supabase environment variables
dotenv.config({ path: ".env" });

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
  process.exit(1);
}

const neonPool = new Pool({
  connectionString: neonConnectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findDifferences() {
  console.log("Finding differences between Neon and Supabase...");

  // Tables with discrepancies
  const tablesToCheck = ["students", "participant_applications"];

  for (const table of tablesToCheck) {
    console.log(`\n=== Checking differences in ${table} ===`);

    // Get all records from Neon
    const { rows: neonRows } = await neonPool.query(`SELECT * FROM ${table}`);
    console.log(`Found ${neonRows.length} records in Neon for ${table}`);

    // Get all records from Supabase
    const { data: supabaseRows, error } = await supabase
      .from(table)
      .select("*");
    if (error) {
      console.error(`Error fetching from Supabase for ${table}:`, error);
      continue;
    }
    console.log(
      `Found ${supabaseRows?.length || 0} records in Supabase for ${table}`
    );

    // Create maps by ID for easy lookup
    const neonMap = new Map(neonRows.map((row) => [row.id, row]));
    const supabaseMap = new Map(
      supabaseRows?.map((row) => [row.id, row]) || []
    );

    // Find records in Supabase that are not in Neon
    console.log("\nRecords in Supabase that are not in Neon:");
    let extraInSupabase = 0;
    for (const [id, row] of supabaseMap.entries()) {
      if (!neonMap.has(id)) {
        extraInSupabase++;
        console.log(`ID: ${id}`);
        if (table === "students") {
          console.log(`  Email: ${row.email}`);
          console.log(`  Name: ${row.first_name} ${row.last_name}`);
        } else if (table === "participant_applications") {
          console.log(`  Student ID: ${row.student_id}`);
          console.log(`  Status: ${row.status}`);
        }
      }
    }
    if (extraInSupabase === 0) {
      console.log("None");
    } else {
      console.log(`Total: ${extraInSupabase} extra records in Supabase`);
    }

    // Find records in Neon that are not in Supabase
    console.log("\nRecords in Neon that are not in Supabase:");
    let extraInNeon = 0;
    for (const [id, row] of neonMap.entries()) {
      if (!supabaseMap.has(id)) {
        extraInNeon++;
        console.log(`ID: ${id}`);
        if (table === "students") {
          console.log(`  Email: ${row.email}`);
          console.log(`  Name: ${row.first_name} ${row.last_name}`);
        } else if (table === "participant_applications") {
          console.log(`  Student ID: ${row.student_id}`);
          console.log(`  Status: ${row.status}`);
        }
      }
    }
    if (extraInNeon === 0) {
      console.log("None");
    } else {
      console.log(`Total: ${extraInNeon} extra records in Neon`);
    }
  }
}

async function main() {
  try {
    await findDifferences();
    console.log("\nDifference analysis completed!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await neonPool.end();
  }
}

main();
