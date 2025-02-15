import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { config } from "dotenv";

config();

let db: NeonHttpDatabase<typeof schema> | null = null;

export async function getConnection(): Promise<
  NeonHttpDatabase<typeof schema>
> {
  if (!db) {
    const sql = neon(process.env.DATABASE_URL!);
    db = drizzle(sql, { schema });
  }

  return db;
}

export async function closeConnection() {
  // No need to explicitly close connection with neon-http
  db = null;
}
