import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { supabaseAdmin } from "./supabase";

dotenv.config();

// No need to create a new client, use the exported supabaseAdmin instead

async function createTables() {
  console.log("Checking if tables exist...");

  try {
    // Check if tables exist by querying them
    const { error: teamsError } = await supabaseAdmin
      .from("teams")
      .select("id")
      .limit(1);
    if (teamsError) {
      console.log("Creating teams table...");
      await supabaseAdmin
        .from("teams")
        .insert({
          id: uuidv4(),
          name: "Test Team",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      console.log("Teams table created successfully");
    } else {
      console.log("Teams table already exists");
    }

    const { error: studentsError } = await supabaseAdmin
      .from("students")
      .select("id")
      .limit(1);
    if (studentsError) {
      console.log("Creating students table...");
      await supabaseAdmin
        .from("students")
        .insert({
          id: uuidv4(),
          user_id: "test_user",
          email: "test@example.com",
          name: "Test User",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      console.log("Students table created successfully");
    } else {
      console.log("Students table already exists");
    }

    const { error: participantAppsError } = await supabaseAdmin
      .from("participant_applications")
      .select("id")
      .limit(1);
    if (participantAppsError) {
      console.log("Creating participant_applications table...");
      // Get a student ID for reference
      const { data: student } = await supabaseAdmin
        .from("students")
        .select("id")
        .limit(1);
      const studentId = student?.[0]?.id || uuidv4();

      await supabaseAdmin
        .from("participant_applications")
        .insert({
          id: uuidv4(),
          student_id: studentId,
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      console.log("Participant applications table created successfully");
    } else {
      console.log("Participant applications table already exists");
    }

    const { error: mentorAppsError } = await supabaseAdmin
      .from("mentor_applications")
      .select("id")
      .limit(1);
    if (mentorAppsError) {
      console.log("Creating mentor_applications table...");
      // Get a student ID for reference
      const { data: student } = await supabaseAdmin
        .from("students")
        .select("id")
        .limit(1);
      const studentId = student?.[0]?.id || uuidv4();

      await supabaseAdmin
        .from("mentor_applications")
        .insert({
          id: uuidv4(),
          student_id: studentId,
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      console.log("Mentor applications table created successfully");
    } else {
      console.log("Mentor applications table already exists");
    }

    const { error: judgeAppsError } = await supabaseAdmin
      .from("judge_applications")
      .select("id")
      .limit(1);
    if (judgeAppsError) {
      console.log("Creating judge_applications table...");
      // Get a student ID for reference
      const { data: student } = await supabaseAdmin
        .from("students")
        .select("id")
        .limit(1);
      const studentId = student?.[0]?.id || uuidv4();

      await supabaseAdmin
        .from("judge_applications")
        .insert({
          id: uuidv4(),
          student_id: studentId,
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      console.log("Judge applications table created successfully");
    } else {
      console.log("Judge applications table already exists");
    }

    const { error: ratingsError } = await supabaseAdmin
      .from("ratings")
      .select("id")
      .limit(1);
    if (ratingsError) {
      console.log("Creating ratings table...");
      // Get a student ID for reference
      const { data: student } = await supabaseAdmin
        .from("students")
        .select("id")
        .limit(1);
      const studentId = student?.[0]?.id || uuidv4();

      // Get an application ID for reference
      const { data: application } = await supabaseAdmin
        .from("participant_applications")
        .select("id")
        .limit(1);
      const applicationId = application?.[0]?.id || uuidv4();

      await supabaseAdmin
        .from("ratings")
        .insert({
          id: uuidv4(),
          application_id: applicationId,
          judge_id: studentId,
          score: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      console.log("Ratings table created successfully");
    } else {
      console.log("Ratings table already exists");
    }

    console.log("All tables verified or created");
  } catch (error) {
    console.error("Error checking/creating tables:", error);
    console.log(
      "Please run the SQL in app/lib/db/supabase-schema.sql in the Supabase SQL editor."
    );
  }
}

async function importTeams() {
  console.log("Importing teams...");
  const teamsPath = path.join(process.cwd(), "csvs", "teams.csv");

  if (!fs.existsSync(teamsPath) || fs.statSync(teamsPath).size === 0) {
    console.log("Teams CSV is empty or does not exist. Skipping...");
    return;
  }

  const teamsData = fs.readFileSync(teamsPath, "utf8");
  const teams = parse(teamsData, { columns: true, skip_empty_lines: true });

  for (const team of teams) {
    const { error } = await supabaseAdmin.from("teams").upsert({
      id: team.id || uuidv4(),
      name: team.name,
      size: team.size || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error importing team ${team.name}:`, error);
    } else {
      console.log(`Successfully imported team: ${team.name}`);
    }
  }
}

async function importStudents() {
  console.log("Importing students...");
  const studentsPath = path.join(process.cwd(), "csvs", "students.csv");

  if (!fs.existsSync(studentsPath) || fs.statSync(studentsPath).size === 0) {
    console.log("Students CSV is empty or does not exist. Skipping...");
    return;
  }

  const studentsData = fs.readFileSync(studentsPath, "utf8");
  const students = parse(studentsData, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const student of students) {
    const { error } = await supabaseAdmin.from("students").upsert({
      id: student.id || uuidv4(),
      user_id: student.clerk_user_id,
      email: student.email,
      first_name: student.first_name,
      last_name: student.last_name,
      team_id: student.team_id || null,
      role: student.role || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error importing student ${student.email}:`, error);
    } else {
      console.log(`Successfully imported student: ${student.email}`);
    }
  }
}

async function importParticipantApplications() {
  console.log("Importing participant applications...");
  const appsPath = path.join(
    process.cwd(),
    "csvs",
    "participant_applications.csv"
  );

  if (!fs.existsSync(appsPath) || fs.statSync(appsPath).size === 0) {
    console.log(
      "Participant applications CSV is empty or does not exist. Skipping..."
    );
    return;
  }

  const appsData = fs.readFileSync(appsPath, "utf8");
  const apps = parse(appsData, { columns: true, skip_empty_lines: true });

  for (const app of apps) {
    const { error } = await supabaseAdmin
      .from("participant_applications")
      .upsert({
        id: app.id || uuidv4(),
        student_id: app.student_id,
        status: app.status || "draft",
        full_name: app.full_name || null,
        gender: app.gender || null,
        pronouns: app.pronouns || null,
        pronouns_other: app.pronouns_other || null,
        university: app.university || null,
        major: app.major || null,
        education_level: app.education_level || null,
        is_first_datathon:
          app.is_first_datathon === "true" || app.is_first_datathon === true,
        comfort_level: app.comfort_level ? parseInt(app.comfort_level) : null,
        has_team: app.has_team === "true" || app.has_team === true,
        teammates: app.teammates || null,
        dietary_restrictions: app.dietary_restrictions || null,
        development_goals: app.development_goals || null,
        github_url: app.github_url || null,
        linkedin_url: app.linkedin_url || null,
        attendance_confirmed:
          app.attendance_confirmed === "true" ||
          app.attendance_confirmed === true,
        feedback: app.feedback || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(
        `Error importing participant application ${app.id}:`,
        error
      );
    } else {
      console.log(`Successfully imported participant application: ${app.id}`);
    }
  }
}

async function importMentorApplications() {
  console.log("Importing mentor applications...");
  const appsPath = path.join(process.cwd(), "csvs", "mentor_applications.csv");

  if (!fs.existsSync(appsPath) || fs.statSync(appsPath).size === 0) {
    console.log(
      "Mentor applications CSV is empty or does not exist. Skipping..."
    );
    return;
  }

  const appsData = fs.readFileSync(appsPath, "utf8");
  const apps = parse(appsData, { columns: true, skip_empty_lines: true });

  for (const app of apps) {
    const programmingLanguages = app.programming_languages
      ? app.programming_languages.split(",").map((lang: string) => lang.trim())
      : [];

    const dietaryRestrictions = app.dietary_restrictions
      ? app.dietary_restrictions.split(",").map((diet: string) => diet.trim())
      : [];

    const { error } = await supabaseAdmin.from("mentor_applications").upsert({
      id: app.id || uuidv4(),
      student_id: app.student_id,
      status: app.status || "draft",
      full_name: app.full_name || null,
      pronouns: app.pronouns || null,
      pronouns_other: app.pronouns_other || null,
      affiliation: app.affiliation || null,
      programming_languages: programmingLanguages,
      comfort_level: app.comfort_level ? parseInt(app.comfort_level) : null,
      has_hackathon_experience:
        app.has_hackathon_experience === "true" ||
        app.has_hackathon_experience === true,
      motivation: app.motivation || null,
      mentor_role_description: app.mentor_role_description || null,
      availability: app.availability || null,
      linkedin_url: app.linkedin_url || null,
      github_url: app.github_url || null,
      website_url: app.website_url || null,
      dietary_restrictions: dietaryRestrictions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error importing mentor application ${app.id}:`, error);
    } else {
      console.log(`Successfully imported mentor application: ${app.id}`);
    }
  }
}

async function importJudgeApplications() {
  console.log("Importing judge applications...");
  const appsPath = path.join(process.cwd(), "csvs", "judge_applications.csv");

  if (!fs.existsSync(appsPath) || fs.statSync(appsPath).size === 0) {
    console.log(
      "Judge applications CSV is empty or does not exist. Skipping..."
    );
    return;
  }

  const appsData = fs.readFileSync(appsPath, "utf8");
  const apps = parse(appsData, { columns: true, skip_empty_lines: true });

  for (const app of apps) {
    const { error } = await supabaseAdmin.from("judge_applications").upsert({
      id: app.id || uuidv4(),
      student_id: app.student_id,
      status: app.status || "draft",
      full_name: app.full_name || null,
      pronouns: app.pronouns || null,
      pronouns_other: app.pronouns_other || null,
      affiliation: app.affiliation || null,
      experience: app.experience || null,
      motivation: app.motivation || null,
      feedback_comfort: app.feedback_comfort
        ? parseInt(app.feedback_comfort)
        : null,
      availability: app.availability === "true" || app.availability === true,
      linkedin_url: app.linkedin_url || null,
      github_url: app.github_url || null,
      website_url: app.website_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error importing judge application ${app.id}:`, error);
    } else {
      console.log(`Successfully imported judge application: ${app.id}`);
    }
  }
}

async function importRatings() {
  console.log("Importing ratings...");
  const ratingsPath = path.join(process.cwd(), "csvs", "ratings.csv");

  if (!fs.existsSync(ratingsPath) || fs.statSync(ratingsPath).size === 0) {
    console.log("Ratings CSV is empty or does not exist. Skipping...");
    return;
  }

  const ratingsData = fs.readFileSync(ratingsPath, "utf8");
  const ratings = parse(ratingsData, { columns: true, skip_empty_lines: true });

  for (const rating of ratings) {
    const { error } = await supabaseAdmin.from("ratings").upsert({
      id: rating.id || uuidv4(),
      application_id: rating.application_id,
      score: parseInt(rating.score),
      feedback: rating.feedback || null,
      rated_by: rating.rated_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error importing rating ${rating.id}:`, error);
    } else {
      console.log(`Successfully imported rating: ${rating.id}`);
    }
  }
}

async function importCombinedUserApplications() {
  console.log("Importing combined user applications...");
  const combinedPath = path.join(
    process.cwd(),
    "csvs",
    "combined_user_applications.csv"
  );

  if (!fs.existsSync(combinedPath)) {
    console.log("Combined user applications CSV does not exist. Skipping...");
    return;
  }

  const combinedData = fs.readFileSync(combinedPath, "utf8");
  const combinedRecords = parse(combinedData, {
    columns: true,
    skip_empty_lines: true,
  });

  // First, create a map to track student IDs
  const studentIdMap = new Map();

  // Import students first
  console.log(
    `Processing ${combinedRecords.length} records from combined CSV...`
  );
  let studentsImported = 0;

  for (const record of combinedRecords) {
    if (!record.student_id || !record.clerk_user_id || !record.email) {
      console.log(
        `Skipping record with missing required fields: ${JSON.stringify(
          record
        )}`
      );
      continue;
    }

    try {
      const { error } = await supabaseAdmin.from("students").upsert({
        id: record.student_id,
        user_id: record.clerk_user_id,
        email: record.email,
        first_name: record.first_name || "",
        last_name: record.last_name || "",
        role: record.role || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`Error importing student ${record.email}:`, error);
      } else {
        console.log(`Successfully imported student: ${record.email}`);
        studentIdMap.set(record.clerk_user_id, record.student_id);
        studentsImported++;
      }
    } catch (error) {
      console.error(`Error importing student ${record.email}:`, error);
    }
  }

  console.log(`Imported ${studentsImported} students from combined CSV`);

  // Import teams
  let teamsImported = 0;

  for (const record of combinedRecords) {
    if (!record.team_name) {
      continue;
    }

    try {
      const teamId = uuidv4();
      const { error } = await supabaseAdmin.from("teams").upsert({
        id: teamId,
        name: record.team_name,
        size: record.team_size || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`Error importing team ${record.team_name}:`, error);
      } else {
        console.log(`Successfully imported team: ${record.team_name}`);
        teamsImported++;

        // Update student with team ID if applicable
        if (record.student_id) {
          const { error: updateError } = await supabaseAdmin
            .from("students")
            .update({ team_id: teamId })
            .eq("id", record.student_id);

          if (updateError) {
            console.error(
              `Error updating student ${record.student_id} with team ID:`,
              updateError
            );
          } else {
            console.log(
              `Updated student ${record.student_id} with team ID: ${teamId}`
            );
          }
        }
      }
    } catch (error) {
      console.error(`Error importing team ${record.team_name}:`, error);
    }
  }

  console.log(`Imported ${teamsImported} teams from combined CSV`);

  // Import participant applications
  let participantAppsImported = 0;

  for (const record of combinedRecords) {
    if (!record.participant_app_id || !record.student_id) {
      continue;
    }

    try {
      const { error } = await supabaseAdmin
        .from("participant_applications")
        .upsert({
          id: record.participant_app_id,
          student_id: record.student_id,
          status: record.participant_status || "draft",
          gender: record.gender || null,
          pronouns: record.participant_pronouns || null,
          pronouns_other: record.participant_pronouns_other || null,
          university: record.university || null,
          major: record.major || null,
          education_level: record.education_level || null,
          is_first_datathon: record.is_first_datathon === "true",
          comfort_level: record.participant_comfort_level
            ? parseInt(record.participant_comfort_level)
            : null,
          has_team: record.has_team === "true",
          teammates: record.teammates || null,
          dietary_restrictions: record.participant_dietary_restrictions || null,
          development_goals: record.development_goals || null,
          github_url: record.participant_github_url || null,
          linkedin_url: record.participant_linkedin_url || null,
          attendance_confirmed: record.attendance_confirmed === "true",
          feedback: record.participant_feedback || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error(
          `Error importing participant application ${record.participant_app_id}:`,
          error
        );
      } else {
        console.log(
          `Successfully imported participant application: ${record.participant_app_id}`
        );
        participantAppsImported++;
      }
    } catch (error) {
      console.error(
        `Error importing participant application ${record.participant_app_id}:`,
        error
      );
    }
  }

  console.log(
    `Imported ${participantAppsImported} participant applications from combined CSV`
  );

  // Import mentor applications
  let mentorAppsImported = 0;

  for (const record of combinedRecords) {
    if (!record.mentor_app_id || !record.student_id) {
      continue;
    }

    try {
      const programmingLanguages = record.programming_languages
        ? record.programming_languages
            .split(",")
            .map((lang: string) => lang.trim())
        : [];

      const dietaryRestrictions = record.mentor_dietary_restrictions
        ? record.mentor_dietary_restrictions
            .split(",")
            .map((diet: string) => diet.trim())
        : [];

      const { error } = await supabaseAdmin.from("mentor_applications").upsert({
        id: record.mentor_app_id,
        student_id: record.student_id,
        status: record.mentor_status || "draft",
        pronouns: record.mentor_pronouns || null,
        pronouns_other: record.mentor_pronouns_other || null,
        affiliation: record.mentor_affiliation || null,
        programming_languages: programmingLanguages,
        comfort_level: record.mentor_comfort_level
          ? parseInt(record.mentor_comfort_level)
          : null,
        has_hackathon_experience: record.has_hackathon_experience === "true",
        motivation: record.mentor_motivation || null,
        mentor_role_description: record.mentor_role_description || null,
        availability: record.mentor_availability || null,
        linkedin_url: record.mentor_linkedin_url || null,
        github_url: record.mentor_github_url || null,
        website_url: record.mentor_website_url || null,
        dietary_restrictions: dietaryRestrictions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(
          `Error importing mentor application ${record.mentor_app_id}:`,
          error
        );
      } else {
        console.log(
          `Successfully imported mentor application: ${record.mentor_app_id}`
        );
        mentorAppsImported++;
      }
    } catch (error) {
      console.error(
        `Error importing mentor application ${record.mentor_app_id}:`,
        error
      );
    }
  }

  console.log(
    `Imported ${mentorAppsImported} mentor applications from combined CSV`
  );

  // Import judge applications
  let judgeAppsImported = 0;

  for (const record of combinedRecords) {
    if (!record.judge_app_id || !record.student_id) {
      continue;
    }

    try {
      const { error } = await supabaseAdmin.from("judge_applications").upsert({
        id: record.judge_app_id,
        student_id: record.student_id,
        status: record.judge_status || "draft",
        pronouns: record.judge_pronouns || null,
        pronouns_other: record.judge_pronouns_other || null,
        affiliation: record.judge_affiliation || null,
        experience: record.experience || null,
        motivation: record.judge_motivation || null,
        feedback_comfort: record.feedback_comfort
          ? parseInt(record.feedback_comfort)
          : null,
        availability: record.judge_availability === "true",
        linkedin_url: record.judge_linkedin_url || null,
        github_url: record.judge_github_url || null,
        website_url: record.judge_website_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(
          `Error importing judge application ${record.judge_app_id}:`,
          error
        );
      } else {
        console.log(
          `Successfully imported judge application: ${record.judge_app_id}`
        );
        judgeAppsImported++;
      }
    } catch (error) {
      console.error(
        `Error importing judge application ${record.judge_app_id}:`,
        error
      );
    }
  }

  console.log(
    `Imported ${judgeAppsImported} judge applications from combined CSV`
  );
  console.log("Finished importing from combined CSV");
}

async function main() {
  try {
    console.log("Starting CSV import to Supabase...");

    // Create tables first
    await createTables();

    // Import data from individual CSVs
    await importTeams();
    await importStudents();
    await importParticipantApplications();
    await importMentorApplications();
    await importJudgeApplications();
    await importRatings();

    // Import from combined CSV
    await importCombinedUserApplications();

    console.log("CSV import completed successfully!");
  } catch (error) {
    console.error("Error during import:", error);
  }
}

main();
