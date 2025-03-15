import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

async function main() {
  console.log("Setting up Supabase functions...");

  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials. Please check your .env file.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const sqlFilePath = path.join(
      process.cwd(),
      "scripts",
      "supabase-functions.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    console.log("Executing SQL functions...");
    const { error } = await supabase.rpc("exec_sql", { sql: sqlContent });

    if (error) {
      console.error("Error executing SQL functions:", error);

      // Try an alternative approach using raw SQL
      console.log("Trying alternative approach...");

      // Split the SQL into separate statements
      const statements = sqlContent
        .split(";")
        .filter((stmt) => stmt.trim() !== "");

      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc("exec_sql", {
          sql: statement + ";",
        });
        if (stmtError) {
          console.error("Error executing SQL statement:", stmtError);
          console.error("Statement:", statement);
        } else {
          console.log("SQL statement executed successfully");
        }
      }
    } else {
      console.log("SQL functions executed successfully");
    }

    console.log("Setup completed!");
  } catch (error) {
    console.error("Setup failed:", error);
  }
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
