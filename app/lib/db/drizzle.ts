import { createConnection } from "./config";
import * as schema from "./schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import { Pool } from "pg";

config();

type DB = NodePgDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;
let db: DB | null = null;
let pool: Pool | null = null;

export async function getConnection(): Promise<DB> {
  if (!db) {
    const connection = await createConnection();
    if (process.env.NODE_ENV === "development") {
      // In development, connection will be NodePgDatabase
      const nodePgDb = connection as NodePgDatabase<typeof schema>;
      pool = (nodePgDb as unknown as { client: Pool }).client;
    }
    db = connection;
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
