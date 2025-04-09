import * as fs from "fs";
import * as path from "path";
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
const outputDir = path.join(process.cwd(), "emails");

interface ParticipantApplication {
  student_id: string;
  status: string;
}

interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

async function extractPendingApplicationEmails() {
  try {
    console.log("Extracting emails of students with pending applications...");

    const { data: participantApps, error: participantError } = await supabase
      .from("participant_applications")
      .select("student_id, status")
      .eq("status", "draft");

    if (participantError) {
      throw participantError;
    }

    console.log(
      `Found ${participantApps.length} draft participant applications`
    );

    if (participantApps.length === 0) {
      console.log("No draft applications found");
      return;
    }

    const studentIds = participantApps.map(
      (app: ParticipantApplication) => app.student_id
    );
    console.log(`Fetching email information for ${studentIds.length} students`);

    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("id, email, first_name, last_name")
      .in("id", studentIds);

    if (studentError) {
      throw studentError;
    }

    const studentsWithDraftApplications = students.map((student: Student) => ({
      id: student.id,
      email: student.email,
      name: `${student.first_name} ${student.last_name}`.trim(),
    }));

    console.log(
      `Retrieved ${studentsWithDraftApplications.length} student emails`
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvContent = [
      "Email,Name,ID",
      ...studentsWithDraftApplications.map(
        (s) => `${s.email},${s.name},${s.id}`
      ),
    ].join("\n");

    const filePath = path.join(outputDir, "draft-applications.csv");
    fs.writeFileSync(filePath, csvContent);

    console.log(
      `Successfully exported ${studentsWithDraftApplications.length} student emails to ${filePath}`
    );

    const plainTextEmails = studentsWithDraftApplications
      .map((s) => s.email)
      .join(",\n");
    const emailListPath = path.join(outputDir, "draft-applications-emails.txt");
    fs.writeFileSync(emailListPath, plainTextEmails);

    console.log(`Also exported plain text email list to ${emailListPath}`);
  } catch (error) {
    console.error("Error extracting emails:", error);
  }
}

async function main() {
  console.log("Starting extraction process...");
  await extractPendingApplicationEmails();
  console.log("Extraction process completed!");
}

main().catch((error) => {
  console.error("Extraction failed:", error);
  process.exit(1);
});
