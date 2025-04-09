import * as fs from "fs";
import * as path from "path";
import { parse } from "json2csv";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const outputDir = path.join(process.cwd(), "csvs");

interface Student {
  id: string;
  [key: string]: any;
}

interface ParticipantApplication {
  students: Student;
  [key: string]: any;
}

async function exportSubmittedStudents() {
  try {
    console.log("Exporting submitted students...");

    const { data, error } = await supabase
      .from("participant_applications")
      .select(
        `
        *,
        students (*)
      `
      )
      .eq("status", "submitted");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No submitted students found");
      return;
    }

    const students = data
      .map((record: ParticipantApplication) => record.students)
      .filter(Boolean);
    const csv = parse(students);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, "submitted_students.csv");
    fs.writeFileSync(filePath, csv);

    console.log(
      `Successfully exported ${students.length} submitted students to ${filePath}`
    );
  } catch (error) {
    console.error("Error exporting submitted students:", error);
  }
}

async function exportSubmittedApplications() {
  try {
    console.log("Exporting submitted applications...");

    const { data, error } = await supabase
      .from("participant_applications")
      .select("*")
      .eq("status", "submitted");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No submitted applications found");
      return;
    }

    const csv = parse(data);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, "submitted_applications.csv");
    fs.writeFileSync(filePath, csv);

    console.log(
      `Successfully exported ${data.length} submitted applications to ${filePath}`
    );
  } catch (error) {
    console.error("Error exporting submitted applications:", error);
  }
}

async function exportSubmittedMentors() {
  try {
    console.log("Exporting submitted mentors...");

    const { data, error } = await supabase
      .from("mentor_applications")
      .select("*")
      .eq("status", "submitted");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No submitted mentors found");
      return;
    }

    const csv = parse(data);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, "submitted_mentors.csv");
    fs.writeFileSync(filePath, csv);

    console.log(
      `Successfully exported ${data.length} submitted mentors to ${filePath}`
    );
  } catch (error) {
    console.error("Error exporting submitted mentors:", error);
  }
}

async function exportSubmittedJudges() {
  try {
    console.log("Exporting submitted judges...");

    const { data, error } = await supabase
      .from("judge_applications")
      .select("*")
      .eq("status", "submitted");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No submitted judges found");
      return;
    }

    const csv = parse(data);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, "submitted_judges.csv");
    fs.writeFileSync(filePath, csv);

    console.log(
      `Successfully exported ${data.length} submitted judges to ${filePath}`
    );
  } catch (error) {
    console.error("Error exporting submitted judges:", error);
  }
}

async function main() {
  console.log("Starting export process...");
  await exportSubmittedStudents();
  await exportSubmittedApplications();
  await exportSubmittedMentors();
  await exportSubmittedJudges();
  console.log("Export process completed!");
}

main().catch((error) => {
  console.error("Export failed:", error);
  process.exit(1);
});
