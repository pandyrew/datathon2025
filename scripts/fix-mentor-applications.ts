import dotenv from "dotenv";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load Neon environment variables
dotenv.config({ path: ".env.neon" });

// Neon connection
const neonConnectionString = process.env.DATABASE_URL;
if (!neonConnectionString) {
  throw new Error(
    "DATABASE_URL (Neon) is not defined in environment variables in .env.neon"
  );
}

console.log(
  "Using Neon connection string:",
  neonConnectionString.replace(/:[^:]*@/, ":***@")
);

// Now load Supabase environment variables
dotenv.config({ path: ".env" });

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
  process.exit(1);
}

const neonPool = new Pool({
  connectionString: neonConnectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to properly parse array fields
function parseArrayField(value: string | null | undefined): any[] {
  if (!value) return [];

  try {
    // Handle PostgreSQL array format {item1,item2}
    if (
      typeof value === "string" &&
      value.startsWith("{") &&
      value.endsWith("}")
    ) {
      const arrayString = value.substring(1, value.length - 1);
      if (arrayString.trim() === "") {
        return [];
      }
      return arrayString.split(",").map((item) => {
        const trimmed = item.trim();
        // Remove quotes if present
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return trimmed.substring(1, trimmed.length - 1);
        }
        return trimmed;
      });
    }

    // If it's already a JSON string, parse it
    if (
      typeof value === "string" &&
      value.startsWith("[") &&
      value.endsWith("]")
    ) {
      return JSON.parse(value);
    }

    // If it's a comma-separated string, split it
    if (typeof value === "string" && value.includes(",")) {
      return value.split(",").map((item) => item.trim());
    }

    // If it's a single value, return as array with one item
    return [value];
  } catch (error) {
    console.error(`Error parsing array field: ${value}`, error);
    return [];
  }
}

async function fixMentorApplications() {
  console.log("Checking mentor applications in Neon...");

  try {
    // Get all mentor applications from Neon
    const { rows: neonApps } = await neonPool.query(
      "SELECT * FROM mentor_applications"
    );

    console.log(`Found ${neonApps.length} mentor applications in Neon`);

    // Get all mentor applications from Supabase
    const { data: supabaseApps, error: supabaseError } = await supabase
      .from("mentor_applications")
      .select("*");

    if (supabaseError) {
      console.error("Error fetching Supabase applications:", supabaseError);
      return;
    }

    console.log(
      `Found ${supabaseApps?.length || 0} mentor applications in Supabase`
    );

    // Create a map of existing applications in Supabase by ID
    const supabaseAppMap = new Map();
    supabaseApps?.forEach((app) => {
      supabaseAppMap.set(app.id, app);
    });

    // Process each Neon application
    for (const neonApp of neonApps) {
      console.log(`Processing application for ID: ${neonApp.id}`);

      // Fix array fields
      const fixedApp = {
        ...neonApp,
        programming_languages: parseArrayField(neonApp.programming_languages),
        dietary_restrictions: parseArrayField(neonApp.dietary_restrictions),
        // Convert boolean strings to actual booleans
        has_hackathon_experience:
          neonApp.has_hackathon_experience === true ||
          neonApp.has_hackathon_experience === "true" ||
          neonApp.has_hackathon_experience === "t",
        // Ensure numeric fields are numbers
        comfort_level:
          typeof neonApp.comfort_level === "string"
            ? parseInt(neonApp.comfort_level)
            : neonApp.comfort_level,
      };

      // Check if this application exists in Supabase
      if (supabaseAppMap.has(neonApp.id)) {
        console.log(
          `Application ${neonApp.id} exists in Supabase, updating...`
        );
        const { error: updateError } = await supabase
          .from("mentor_applications")
          .update(fixedApp)
          .eq("id", neonApp.id);

        if (updateError) {
          console.error(
            `Error updating application ${neonApp.id}:`,
            updateError
          );
        } else {
          console.log(`Successfully updated application ${neonApp.id}`);
        }
      } else {
        console.log(
          `Application ${neonApp.id} doesn't exist in Supabase, inserting...`
        );
        const { error: insertError } = await supabase
          .from("mentor_applications")
          .insert(fixedApp);

        if (insertError) {
          console.error(
            `Error inserting application ${neonApp.id}:`,
            insertError
          );
          console.error("Problematic record:", fixedApp);
        } else {
          console.log(`Successfully inserted application ${neonApp.id}`);
        }
      }
    }

    console.log("Mentor applications migration completed!");
  } catch (error) {
    console.error("Error during mentor applications migration:", error);
  }
}

async function main() {
  try {
    await fixMentorApplications();
    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await neonPool.end();
  }
}

main();
