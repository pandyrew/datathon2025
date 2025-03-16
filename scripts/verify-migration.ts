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

const tables = [
  "students",
  "teams",
  "participant_applications",
  "mentor_applications",
  "judge_applications",
  "ratings",
];

async function verifyMigration() {
  console.log("Verifying migration from Neon to Supabase...");

  const results = {
    neon: {} as Record<string, number>,
    supabase: {} as Record<string, number>,
    differences: {} as Record<string, { neon: number; supabase: number }>,
  };

  try {
    // Check counts for each table
    for (const table of tables) {
      console.log(`\nVerifying table: ${table}`);

      // Get count from Neon
      const neonResult = await neonPool.query(`SELECT COUNT(*) FROM ${table}`);
      const neonCount = parseInt(neonResult.rows[0].count);
      results.neon[table] = neonCount;

      // Get count from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from(table)
        .select("id", { count: "exact" });

      if (supabaseError) {
        console.error(
          `Error fetching from Supabase for table ${table}:`,
          supabaseError
        );
        continue;
      }

      const supabaseCount = supabaseData?.length || 0;
      results.supabase[table] = supabaseCount;

      // Compare counts
      if (neonCount !== supabaseCount) {
        results.differences[table] = {
          neon: neonCount,
          supabase: supabaseCount,
        };
        console.log(
          `❌ Mismatch in ${table}: Neon has ${neonCount}, Supabase has ${supabaseCount}`
        );

        // If there's a mismatch, check which records are missing
        if (neonCount > supabaseCount) {
          console.log(
            `   Missing ${neonCount - supabaseCount} records in Supabase`
          );

          // Get all IDs from both databases
          const neonIds = await neonPool.query(`SELECT id FROM ${table}`);
          const { data: supabaseIds } = await supabase.from(table).select("id");

          const neonIdSet = new Set(neonIds.rows.map((row: any) => row.id));
          const supabaseIdSet = new Set(
            supabaseIds?.map((row) => row.id) || []
          );

          // Find missing IDs
          const missingIds = [...neonIdSet].filter(
            (id) => !supabaseIdSet.has(id)
          );

          if (missingIds.length > 0) {
            console.log(`   Missing IDs in Supabase: ${missingIds.join(", ")}`);
          }
        }
      } else {
        console.log(
          `✅ ${table}: Neon has ${neonCount}, Supabase has ${supabaseCount}`
        );
      }
    }

    // Summary
    console.log("\n=== Migration Verification Summary ===");
    let allGood = true;

    for (const table of tables) {
      const neonCount = results.neon[table] || 0;
      const supabaseCount = results.supabase[table] || 0;

      if (neonCount === supabaseCount) {
        console.log(`✅ ${table}: ${neonCount} records`);
      } else {
        console.log(
          `❌ ${table}: Neon has ${neonCount}, Supabase has ${supabaseCount}`
        );
        allGood = false;
      }
    }

    if (allGood) {
      console.log("\n🎉 All tables have been migrated successfully!");
    } else {
      console.log(
        "\n⚠️ Some tables have discrepancies. Please check the details above."
      );
    }
  } catch (error) {
    console.error("Error during verification:", error);
  }
}

async function main() {
  try {
    await verifyMigration();
    console.log("Verification completed!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await neonPool.end();
  }
}

main();
