import dotenv from "dotenv";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { parse } from "json2csv";

// Load environment variables from .env.neon
dotenv.config({ path: ".env.neon" });

const outputDir = path.join(process.cwd(), "csvs");

async function main() {
  console.log("Exporting mentor applications from Neon...");

  const neonConnectionString = process.env.DATABASE_URL;

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

  const neonPool = new Pool({
    connectionString: neonConnectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log("Fetching mentor applications from Neon...");
    const { rows } = await neonPool.query("SELECT * FROM mentor_applications");

    console.log(`Found ${rows.length} mentor applications in Neon`);

    if (rows.length === 0) {
      console.log("No mentor applications found in Neon.");
      return;
    }

    // Save to CSV
    const csv = parse(rows);
    const csvFilePath = path.join(outputDir, "mentor_applications.csv");
    fs.writeFileSync(csvFilePath, csv);
    console.log(`Saved mentor applications to CSV file: ${csvFilePath}`);

    // Print the IDs of the applications for verification
    console.log("Mentor application IDs:");
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.id} - ${row.full_name || "Unknown"}`);
    });

    console.log("Export completed!");
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    await neonPool.end();
  }
}

main().catch((error) => {
  console.error("Export failed:", error);
  process.exit(1);
});
