import { createConnection } from "./config";
import * as schema from "./schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { config } from "dotenv";
import { Pool } from "pg";
import { supabase, supabaseAdmin } from "./supabase";

config();

type DB = NodePgDatabase<typeof schema>;
let db: DB | null = null;
let pool: Pool | null = null;

export async function getConnection(): Promise<DB> {
  if (!db) {
    const connection = await createConnection();
    db = connection;
    pool = (db as unknown as { client: Pool }).client;
  }
  return db!;
}

export async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
  }
  db = null;
}

// Export Supabase clients for direct access when needed
export { supabase, supabaseAdmin };

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("students")
      .select("id")
      .limit(1);
    if (error) {
      console.error("Database connection error:", error.message);
      return false;
    }
    console.log("Database connection successful");
    return true;
  } catch (err) {
    console.error("Database connection error:", err);
    return false;
  }
}
