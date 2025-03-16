import dotenv from "dotenv";
import path from "path";
import { migrate as migrateNodePg } from "drizzle-orm/node-postgres/migrator";
import { getConnection, closeConnection } from "./drizzle";
import * as schema from "./schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
dotenv.config({ path: ".env" });

async function main() {
  console.log("Database URL:", process.env.DATABASE_URL);
  try {
    const db = await getConnection();

    console.log("Running migrations");
    // Use node-postgres migrator for all environments
    await migrateNodePg(db as NodePgDatabase<typeof schema>, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
      migrationsTable: "drizzle_migrations",
    });

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
