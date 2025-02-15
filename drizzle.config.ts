import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL && !process.env.DATABASE_URL_UNPOOLED) {
  throw new Error("DATABASE_URL or DATABASE_URL_UNPOOLED must be set");
}

export default {
  schema: "./app/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  driver: "pg",
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!,
  },
} satisfies Config;
