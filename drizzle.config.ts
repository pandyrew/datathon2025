import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });

const isDevelopment = process.env.NODE_ENV === "development";

// Choose the appropriate connection string based on environment
let connectionString: string;

if (isDevelopment) {
  // Use local database for development
  connectionString =
    process.env.DEV_DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/postgres";
  console.log("Using development database configuration");
} else {
  // Use production database for production
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined for production environment");
  }
  connectionString = process.env.DATABASE_URL;
  console.log("Using production database configuration");
}

// Export the connection string for use in other files
export const dbConnectionString = connectionString;

// The config is now specified via command line arguments in package.json scripts
// but also included here for direct drizzle-kit commands
export default {
  schema: "./app/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
};
