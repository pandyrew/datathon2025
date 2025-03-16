import { Pool } from "pg";
import dotenv from "dotenv";
import { supabaseAdmin } from "./supabase";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

console.log(
  "Using connection string:",
  connectionString.replace(/:[^:]*@/, ":***@")
); // Log connection string with password hidden

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 30000, // 30 seconds timeout
  ssl: { rejectUnauthorized: false }, // Add SSL option with rejectUnauthorized set to false
  // Disable prepared statements for transaction pooler mode
  statement_timeout: 60000, // 60 seconds statement timeout
  query_timeout: 60000, // 60 seconds query timeout
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

async function testConnection() {
  try {
    console.log("Testing database connection...");

    // Test Supabase connection
    console.log("Testing Supabase connection...");
    const { data: supabaseData, error: supabaseError } = await supabaseAdmin
      .from("students")
      .select("*")
      .limit(1);

    if (supabaseError) {
      console.error("Error connecting to Supabase:", supabaseError);
    } else {
      console.log("Successfully connected to Supabase!");
      console.log("Supabase data sample:", supabaseData);
    }

    // Test direct PostgreSQL connection
    const client = await pool.connect();
    console.log(
      "Successfully connected to the database via PostgreSQL client!"
    );

    try {
      // Disable prepared statements for this query
      await client.query("SET SESSION statement_timeout = 60000");

      const result = await client.query({
        text: "SELECT current_database() as db_name, current_user as user_name",
        rowMode: "array",
      });
      console.log("Database info:", result.rows[0]);

      // Test creating a simple table
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS connection_test (
            id SERIAL PRIMARY KEY,
            test_name TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        console.log("Successfully created test table!");

        // Insert a test row
        await client.query(
          `
          INSERT INTO connection_test (test_name) VALUES ($1)
        `,
          ["Connection test " + new Date().toISOString()]
        );
        console.log("Successfully inserted test data!");

        // Query the test data
        const testResult = await client.query(
          "SELECT * FROM connection_test ORDER BY id DESC LIMIT 1"
        );
        console.log("Test data:", testResult.rows[0]);
      } catch (error) {
        console.error("Error with test table operations:", error);
      }
    } finally {
      client.release();
    }

    await pool.end();
    console.log("Connection pool closed.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
}

testConnection();
