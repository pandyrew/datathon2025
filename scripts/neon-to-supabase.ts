import dotenv from "dotenv";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { parse } from "json2csv";

// Load Neon environment variables
dotenv.config({ path: ".env.neon" });

// Neon connection
const neonConnectionString = process.env.DATABASE_URL;

// Now load Supabase environment variables
dotenv.config({ path: ".env" });

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

const tables = [
  "students",
  "teams",
  "participant_applications",
  "mentor_applications",
  "judge_applications",
  "ratings",
];

const outputDir = path.join(process.cwd(), "csvs");

async function main() {
  console.log("Starting Neon to Supabase migration via CSV...");

  if (!neonConnectionString) {
    console.error(
      "Missing Neon database URL. Please check your .env.neon file."
    );
    process.exit(1);
  }

  console.log(
    "Using Neon connection string:",
    neonConnectionString.replace(/:[^:]*@/, ":***@")
  );

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

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const table of tables) {
      console.log(`Processing table: ${table}`);

      try {
        console.log(`Fetching data from Neon for table: ${table}`);
        const { rows } = await neonPool.query(`SELECT * FROM ${table}`);

        if (rows.length === 0) {
          console.log(`No data found in Neon for table: ${table}`);
          continue;
        }

        console.log(`Found ${rows.length} records in Neon for table: ${table}`);

        // Save to CSV as an intermediate step
        const csv = parse(rows);
        const csvFilePath = path.join(outputDir, `${table}_temp.csv`);
        fs.writeFileSync(csvFilePath, csv);
        console.log(`Saved data to temporary CSV file: ${csvFilePath}`);

        console.log(`Clearing existing data in Supabase for table: ${table}`);
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");

        if (deleteError) {
          console.error(
            `Error clearing data in Supabase for table ${table}:`,
            deleteError
          );
          continue;
        }

        console.log(
          `Inserting ${rows.length} records into Supabase for table: ${table}`
        );

        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error: insertError } = await supabase
            .from(table)
            .insert(batch);

          if (insertError) {
            console.error(
              `Error inserting data into Supabase for table ${table}:`,
              insertError
            );
            break;
          }

          console.log(
            `Inserted batch ${i / batchSize + 1} of ${Math.ceil(
              rows.length / batchSize
            )} for table: ${table}`
          );
        }

        // Clean up temporary CSV file
        fs.unlinkSync(csvFilePath);
        console.log(`Removed temporary CSV file: ${csvFilePath}`);

        console.log(`Successfully migrated table: ${table}`);
      } catch (error) {
        console.error(`Error processing table ${table}:`, error);
      }
    }

    console.log("Migration completed!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await neonPool.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
