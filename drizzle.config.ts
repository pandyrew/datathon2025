import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Parse DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL!);

export default {
  schema: "./app/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1), // Remove leading slash
    ssl: false,
  },
} satisfies Config;
