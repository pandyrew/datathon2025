import fs from "fs";
import path from "path";
import { parse } from "json2csv";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const tables = [
  "students",
  "teams",
  "participant_applications",
  "mentor_applications",
  "judge_applications",
  "ratings",
];

const outputDir = path.join(process.cwd(), "csvs");

async function exportTableToCsv(tableName: string) {
  try {
    console.log(`Exporting ${tableName}...`);

    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No data found in ${tableName}`);
      return;
    }

    const csv = parse(data);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `${tableName}.csv`);
    fs.writeFileSync(filePath, csv);

    console.log(
      `Successfully exported ${data.length} records from ${tableName} to ${filePath}`
    );
  } catch (error) {
    console.error(`Error exporting ${tableName}:`, error);
  }
}

async function main() {
  console.log("Starting export process...");

  for (const table of tables) {
    await exportTableToCsv(table);
  }

  console.log("Export process completed!");
}

main().catch((error) => {
  console.error("Export failed:", error);
  process.exit(1);
});
