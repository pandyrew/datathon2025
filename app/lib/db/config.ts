import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { Pool } from "pg";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config({ path: ".env" });

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
);

// Admin client for privileged operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

export async function createConnection() {
  console.log("Creating database connection to Supabase");

  // Use PostgreSQL connection with Supabase
  const connectionString = process.env.DATABASE_URL!;

  // Add SSL options for Supabase connection
  const poolConfig = {
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60000, // 60 seconds timeout
    statement_timeout: 120000, // 120 seconds statement timeout
    query_timeout: 120000, // 120 seconds query timeout
    max: 5, // Limit number of connections for stability
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  };

  const pool = new Pool(poolConfig);
  return drizzle(pool, { schema });
}
