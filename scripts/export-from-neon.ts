import fs from "fs";
import path from "path";
import { parse } from "json2csv";
import dotenv from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../app/lib/db/schema";

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

    console.log(`Found ${rows.length} records in ${tableName}`);

    const csv = parse(rows);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `${tableName}.csv`);
    fs.writeFileSync(filePath, csv);

    console.log(
      `Successfully exported ${rows.length} records from ${tableName} to ${filePath}`
    );
  } catch (error) {
    console.error(`Error exporting ${tableName}:`, error);
  }
}

async function main() {
  console.log("Starting Neon export process...");

  // Try to use the same connection method as in the app
  try {
    // First try using the existing connection method from the app
    const {
      createConnection,
      closeConnection,
    } = require("../app/lib/db/drizzle");
    console.log("Using app connection method...");

    const db = await createConnection();

    for (const table of tables) {
      try {
        console.log(`Exporting ${table} from Neon using app connection...`);

        // Use drizzle to query the table
        const result = await db.query[table].findMany();

        if (!result || result.length === 0) {
          console.log(`No data found in ${table}`);
          continue;
        }

        const csv = parse(result);

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const filePath = path.join(outputDir, `${table}.csv`);
        fs.writeFileSync(filePath, csv);

        console.log(
          `Successfully exported ${result.length} records from ${table} to ${filePath}`
        );
      } catch (error) {
        console.error(`Error exporting ${table} using app connection:`, error);
      }
    }

    await closeConnection();
    console.log("Export process completed!");
    return;
  } catch (error) {
    console.error("Error using app connection method:", error);
    console.log("Falling back to direct connection...");
  }

  // Fallback to direct connection
  const neonConnectionString = process.env.DATABASE_URL;

  if (!neonConnectionString) {
    console.error("Missing Neon database URL. Please check your .env file.");
    process.exit(1);
  }

  try {
    // Try different SSL configurations
    const sslConfigs = [
      { rejectUnauthorized: false },
      { rejectUnauthorized: true },
      undefined,
    ];

    let pool = null;
    let connected = false;

    for (const sslConfig of sslConfigs) {
      try {
        console.log(`Trying connection with SSL config:`, sslConfig);
        pool = new Pool({
          connectionString: neonConnectionString,
          ssl: sslConfig,
        });

        // Test the connection
        await pool.query("SELECT 1");
        connected = true;
        console.log("Connection successful!");
        break;
      } catch (error) {
        console.error(`Connection failed with SSL config:`, sslConfig, error);
        if (pool) {
          await pool.end();
          pool = null;
        }
      }
    }

    if (!connected || !pool) {
      throw new Error(
        "Could not establish connection to Neon with any SSL configuration"
      );
    }

    for (const table of tables) {
      await exportTableToCsv(pool, table);
    }

    await pool.end();
    console.log("Export process completed!");
  } catch (error) {
    console.error("Export failed:", error);
  }
}

main().catch((error) => {
  console.error("Export failed:", error);
  process.exit(1);
});
