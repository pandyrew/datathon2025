import dotenv from "dotenv";
import path from "path";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { migrate as migrateNodePg } from "drizzle-orm/node-postgres/migrator";
import { getConnection, closeConnection } from "./drizzle";
import * as schema from "./schema";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
dotenv.config({ path: ".env" });

const isDevelopment = process.env.NODE_ENV === "development";

async function main() {
  console.log("Database URL:", process.env.DATABASE_URL);
  try {
    const db = await getConnection();

    if (isDevelopment) {
      console.log("Running migrations in development mode");
      // Use node-postgres migrator for development
      await migrateNodePg(db as NodePgDatabase<typeof schema>, {
        migrationsFolder: path.join(process.cwd(), "drizzle"),
        migrationsTable: "drizzle_migrations",
      });
    } else {
      console.log("Running migrations in production mode");
      // Use neon-http migrator for production
      await migrate(db as NeonHttpDatabase<typeof schema>, {
        migrationsFolder: path.join(process.cwd(), "drizzle"),
        migrationsTable: "drizzle_migrations",
      });
    }

    console.log("Migrations complete");
    await closeConnection();
  } catch (error) {
    console.error("Connection error details:", error);
    throw error;
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
