import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const csvDir = path.join(process.cwd(), "csvs");

function cleanRecord(record: any, table: string) {
  const cleanedRecord: any = {};

  for (const [key, value] of Object.entries(record)) {
    // Handle empty strings for UUID fields
    if (
      value === "" &&
      (key === "id" ||
        key === "team_id" ||
        key === "student_id" ||
        key === "application_id" ||
        key === "rated_by")
    ) {
      cleanedRecord[key] = null;
    }
    // Handle empty strings for boolean fields
    else if (
      value === "" &&
      (key.startsWith("is_") ||
        key.startsWith("has_") ||
        key === "availability" ||
        key === "attendance_confirmed")
    ) {
      cleanedRecord[key] = null;
    }
    // Handle empty strings for integer fields
    else if (
      value === "" &&
      (key.includes("level") || key.includes("comfort"))
    ) {
      cleanedRecord[key] = null;
    }
    // Handle array fields that are stored as strings
    else if (
      value &&
      typeof value === "string" &&
      value.startsWith("{") &&
      value.endsWith("}")
    ) {
      try {
        // Convert PostgreSQL array format to JavaScript array
        const arrayString = value.substring(1, value.length - 1);
        if (arrayString.trim() === "") {
          cleanedRecord[key] = [];
        } else {
          const items = arrayString.split(",").map((item) => {
            const trimmed = item.trim();
            // Remove quotes if present
            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
              return trimmed.substring(1, trimmed.length - 1);
            }
            return trimmed;
          });
          cleanedRecord[key] = items;
        }
      } catch (error) {
        console.error(`Error parsing array field ${key}:`, error);
        cleanedRecord[key] = null;
      }
    }
    // Special handling for empty array strings
    else if (value === "[]") {
      cleanedRecord[key] = [];
    }
    // Handle timestamps
    else if (
      value &&
      typeof value === "string" &&
      (key.endsWith("_at") || key === "created_at" || key === "updated_at")
    ) {
      try {
        const date = new Date(value);
        cleanedRecord[key] = date.toISOString();
      } catch (error) {
        console.error(`Error parsing date field ${key}:`, error);
        cleanedRecord[key] = value;
      }
    } else {
      cleanedRecord[key] = value;
    }
  }

  return cleanedRecord;
}

async function main() {
  console.log("Starting CSV to Supabase import...");

  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials. Please check your .env file.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // First, clear all tables in the correct order to handle foreign key constraints
    const deleteOrder = [
      "ratings",
      "participant_applications",
      "mentor_applications",
      "judge_applications",
      "students",
      "teams",
    ];

    console.log("Clearing existing data in Supabase tables...");
    for (const table of deleteOrder) {
      console.log(`Clearing data in table: ${table}`);
      // Use a WHERE clause that matches all records
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .gte("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        console.error(
          `Error clearing data in Supabase for table ${table}:`,
          deleteError
        );
      }
    }

    // Import data in the correct order to satisfy foreign key constraints
    const importOrder = [
      "students",
      "teams",
      "participant_applications",
      "mentor_applications",
      "judge_applications",
      "ratings",
    ];

    for (const table of importOrder) {
      const csvFilePath = path.join(csvDir, `${table}.csv`);

      if (!fs.existsSync(csvFilePath)) {
        console.log(`CSV file not found for table: ${table}`);
        continue;
      }

      const fileContent = fs.readFileSync(csvFilePath, "utf8");

      if (!fileContent || fileContent.trim() === "") {
        console.log(`CSV file is empty for table: ${table}`);
        continue;
      }

      console.log(`Processing CSV file for table: ${table}`);

      try {
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
        });

        if (records.length === 0) {
          console.log(`No records found in CSV for table: ${table}`);
          continue;
        }

        console.log(
          `Found ${records.length} records in CSV for table: ${table}`
        );
        console.log(
          `Inserting ${records.length} records into Supabase for table: ${table}`
        );

        // Clean and transform the records
        const cleanedRecords = records.map((record) =>
          cleanRecord(record, table)
        );

        // For students table, we need to ensure all records have valid IDs
        if (table === "students") {
          // Create a map of student IDs for reference
          const studentIds = new Set();
          for (const record of cleanedRecords) {
            if (record.id) {
              studentIds.add(record.id);
            }
          }

          console.log(`Found ${studentIds.size} valid student IDs`);

          // Insert students one by one to ensure all IDs are properly inserted
          for (const record of cleanedRecords) {
            const { error: insertError } = await supabase
              .from(table)
              .upsert(record, { onConflict: "id" });

            if (insertError) {
              console.error(`Error inserting student record:`, insertError);
              console.error("Problematic record:", record);
            }
          }

          console.log(`Finished inserting students`);
          continue;
        }

        // For other tables, insert in batches
        const batchSize = 10; // Smaller batch size for better error handling
        for (let i = 0; i < cleanedRecords.length; i += batchSize) {
          const batch = cleanedRecords.slice(i, i + batchSize);

          try {
            const { error: insertError } = await supabase
              .from(table)
              .upsert(batch, { onConflict: "id" });

            if (insertError) {
              console.error(
                `Error inserting batch ${
                  i / batchSize + 1
                } into Supabase for table ${table}:`,
                insertError
              );
              console.error("First record in batch:", batch[0]);

              // Try inserting records one by one to identify problematic records
              for (const record of batch) {
                const { error: singleInsertError } = await supabase
                  .from(table)
                  .upsert(record, { onConflict: "id" });
                if (singleInsertError) {
                  console.error(
                    `Error inserting record into ${table}:`,
                    singleInsertError
                  );
                  console.error("Problematic record:", record);
                }
              }
            } else {
              console.log(
                `Inserted batch ${i / batchSize + 1} of ${Math.ceil(
                  cleanedRecords.length / batchSize
                )} for table: ${table}`
              );
            }
          } catch (error) {
            console.error(`Error processing batch for table ${table}:`, error);
          }
        }

        console.log(`Successfully imported table: ${table}`);
      } catch (error) {
        console.error(`Error processing CSV for table ${table}:`, error);
      }
    }

    console.log("Import completed!");
  } catch (error) {
    console.error("Import failed:", error);
  }
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
