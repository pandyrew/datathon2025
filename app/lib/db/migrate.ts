import dotenv from "dotenv";
import path from "path";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { getConnection, closeConnection } from "./drizzle";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Database URL:", process.env.DATABASE_URL);
  try {
    const db = await getConnection();
    await migrate(db, {
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
