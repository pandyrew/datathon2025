import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { Pool } from "pg";
import dotenv from "dotenv";
import { dbConnectionString } from "../../../drizzle.config";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config({ path: ".env" });

const isDevelopment = process.env.NODE_ENV === "development";

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

export async function createConnection() {
  console.log(
    `Creating ${
      isDevelopment ? "development" : "production"
    } database connection`
  );

  // Use PostgreSQL connection for both environments
  const connectionString = isDevelopment
    ? dbConnectionString
    : process.env.DATABASE_URL!;

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
