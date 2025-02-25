import { drizzle } from "drizzle-orm/node-postgres";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { Pool } from "pg";
import dotenv from "dotenv";
import { dbConnectionString } from "../../../drizzle.config";
import { NeonQueryFunction } from "@neondatabase/serverless";

// Load environment variables
dotenv.config({ path: ".env" });

const isDevelopment = process.env.NODE_ENV === "development";

export async function createConnection() {
  if (isDevelopment) {
    console.log("Creating development database connection");
    // Use local PostgreSQL in development
    const connectionString = dbConnectionString;
    const pool = new Pool({ connectionString });
    return drizzle(pool, { schema });
  } else {
    console.log("Creating production database connection");
    // Use Neon in production
    neonConfig.fetchConnectionCache = true;
    const sql = neon(process.env.DATABASE_URL!);
    // Use type assertion with a more specific type
    return drizzleNeon(sql as NeonQueryFunction<boolean, boolean>, { schema });
  }
}
