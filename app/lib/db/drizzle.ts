import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { config } from "dotenv";

config();

let pool: Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;

export async function getConnection(): Promise<NodePgDatabase<typeof schema>> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false // Disable SSL for local development
    });
    db = drizzle(pool, { schema });
  }
  
  if (!db) {
    throw new Error("Failed to establish database connection");
  }
  
  return db;
}

export async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
