import fs from "fs";
import path from "path";
import { parse } from "json2csv";
import dotenv from "dotenv";
import { Pool } from "pg";

// Load Neon environment variables
dotenv.config({ path: ".env.neon" });

const tables = [
  "students",
  "teams",
  "participant_applications",
  "mentor_applications",
  "judge_applications",
  "ratings",
];

const outputDir = path.join(process.cwd(), "csvs");

async function exportTableToCsv(pool: Pool, tableName: string) {
  try {
    console.log(`Exporting ${tableName} from Neon...`);

    const result = await pool.query(`SELECT * FROM ${tableName}`);
    const rows = result.rows;

    if (!rows || rows.length === 0) {
      console.log(`No data found in ${tableName}`);
      return;
    }

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const csv = parse(rows);
    const outputPath = path.join(outputDir, `${tableName}.csv`);
    fs.writeFileSync(outputPath, csv);

    console.log(
      `Exported ${rows.length} rows from ${tableName} to ${outputPath}`
    );
  } catch (error) {
    console.error(`Error exporting ${tableName}:`, error);
  }
}

async function main() {
  console.log("Starting Neon export process...");

  // Create a direct connection to Neon
  const neonConnectionString = process.env.DATABASE_URL;

  if (!neonConnectionString) {
    console.error("Missing Neon database URL. Please check your .env file.");
    process.exit(1);
  }

  let pool: Pool | null = null;

  try {
    // Try different SSL configurations
    const sslConfigs = [
      { ssl: { rejectUnauthorized: false } },
      { ssl: true },
      {},
    ];

    for (const sslConfig of sslConfigs) {
      try {
        pool = new Pool({
          connectionString: neonConnectionString,
          ...sslConfig,
        });

        // Test the connection
        await pool.query("SELECT 1");
        console.log("Connected to Neon database");
        break;
      } catch (err) {
        console.log(
          `Connection failed with SSL config: ${JSON.stringify(sslConfig)}`,
          err
        );
        if (pool) {
          await pool.end();
          pool = null;
        }
      }
    }

    if (!pool) {
      throw new Error(
        "Could not establish connection to Neon with any SSL configuration"
      );
    }

    // Export each table
    for (const table of tables) {
      await exportTableToCsv(pool, table);
    }

    console.log("Export process completed successfully");
  } catch (error) {
    console.error("Error during export process:", error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

main().catch(console.error);
