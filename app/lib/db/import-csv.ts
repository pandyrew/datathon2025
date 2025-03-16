import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { Pool } from "pg";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

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
  connectionTimeoutMillis: 60000, // 60 seconds timeout
  statement_timeout: 120000, // 120 seconds statement timeout
  query_timeout: 120000, // 120 seconds query timeout
  ssl: { rejectUnauthorized: false }, // Add SSL option with rejectUnauthorized set to false
  max: 5, // Limit number of connections for stability
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

// Helper function to execute queries with proper error handling
async function executeQuery(queryText: string, params: string[] = []) {
  const client = await pool.connect();
  try {
    // Disable prepared statements for transaction pooler
    await client.query("SET SESSION statement_timeout = 120000");
    return await client.query(queryText, params);
  } finally {
    client.release();
  }
}

async function createTables() {
  console.log("Creating tables if they do not exist...");

  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        size INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        team_id UUID REFERENCES teams(id),
        role TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS participant_applications (
        id UUID PRIMARY KEY,
        student_id UUID NOT NULL REFERENCES students(id),
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        full_name TEXT,
        gender VARCHAR(20),
        pronouns VARCHAR(20),
        pronouns_other TEXT,
        university TEXT,
        major TEXT,
        education_level VARCHAR(20),
        is_first_datathon BOOLEAN,
        comfort_level INTEGER,
        has_team BOOLEAN,
        teammates TEXT,
        dietary_restrictions TEXT,
        development_goals TEXT,
        github_url TEXT,
        linkedin_url TEXT,
        attendance_confirmed BOOLEAN,
        feedback TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS mentor_applications (
        id UUID PRIMARY KEY,
        student_id UUID NOT NULL REFERENCES students(id),
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        full_name TEXT,
        pronouns VARCHAR(20),
        pronouns_other TEXT,
        affiliation TEXT,
        programming_languages TEXT[],
        comfort_level INTEGER,
        has_hackathon_experience BOOLEAN,
        motivation TEXT,
        mentor_role_description TEXT,
        availability TEXT,
        linkedin_url TEXT,
        github_url TEXT,
        website_url TEXT,
        dietary_restrictions TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS judge_applications (
        id UUID PRIMARY KEY,
        student_id UUID NOT NULL REFERENCES students(id),
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        full_name TEXT,
        pronouns VARCHAR(20),
        pronouns_other TEXT,
        affiliation TEXT,
        experience TEXT,
        motivation TEXT,
        feedback_comfort INTEGER,
        availability BOOLEAN,
        linkedin_url TEXT,
        github_url TEXT,
        website_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS ratings (
        id UUID PRIMARY KEY,
        application_id UUID NOT NULL,
        score INTEGER NOT NULL,
        feedback TEXT,
        rated_by UUID NOT NULL REFERENCES students(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
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
    await executeQuery(
      "INSERT INTO teams (id, name, size) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
      [team.id || uuidv4(), team.name, team.size || 1]
    );
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
    await executeQuery(
      "INSERT INTO students (id, user_id, email, first_name, last_name, team_id, role) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (user_id) DO NOTHING",
      [
        student.id || uuidv4(),
        student.clerk_user_id,
        student.email,
        student.first_name,
        student.last_name,
        student.team_id || null,
        student.role || null,
      ]
    );
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
    await executeQuery(
      `INSERT INTO participant_applications (
        id, student_id, status, full_name, gender, pronouns, pronouns_other, 
        university, major, education_level, is_first_datathon, comfort_level, 
        has_team, teammates, dietary_restrictions, development_goals, 
        github_url, linkedin_url, attendance_confirmed, feedback
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO NOTHING`,
      [
        app.id || uuidv4(),
        app.student_id,
        app.status || "draft",
        app.full_name || null,
        app.gender || null,
        app.pronouns || null,
        app.pronouns_other || null,
        app.university || null,
        app.major || null,
        app.education_level || null,
        app.is_first_datathon === "true" || app.is_first_datathon === true,
        app.comfort_level ? parseInt(app.comfort_level) : null,
        app.has_team === "true" || app.has_team === true,
        app.teammates || null,
        app.dietary_restrictions || null,
        app.development_goals || null,
        app.github_url || null,
        app.linkedin_url || null,
        app.attendance_confirmed === "true" ||
          app.attendance_confirmed === true,
        app.feedback || null,
      ]
    );
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

    await executeQuery(
      `INSERT INTO mentor_applications (
        id, student_id, status, full_name, pronouns, pronouns_other, 
        affiliation, programming_languages, comfort_level, has_hackathon_experience, 
        motivation, mentor_role_description, availability, linkedin_url, 
        github_url, website_url, dietary_restrictions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO NOTHING`,
      [
        app.id || uuidv4(),
        app.student_id,
        app.status || "draft",
        app.full_name || null,
        app.pronouns || null,
        app.pronouns_other || null,
        app.affiliation || null,
        programmingLanguages,
        app.comfort_level ? parseInt(app.comfort_level) : null,
        app.has_hackathon_experience === "true" ||
          app.has_hackathon_experience === true,
        app.motivation || null,
        app.mentor_role_description || null,
        app.availability || null,
        app.linkedin_url || null,
        app.github_url || null,
        app.website_url || null,
        dietaryRestrictions,
      ]
    );
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
    await executeQuery(
      `INSERT INTO judge_applications (
        id, student_id, status, full_name, pronouns, pronouns_other, 
        affiliation, experience, motivation, feedback_comfort, 
        availability, linkedin_url, github_url, website_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO NOTHING`,
      [
        app.id || uuidv4(),
        app.student_id,
        app.status || "draft",
        app.full_name || null,
        app.pronouns || null,
        app.pronouns_other || null,
        app.affiliation || null,
        app.experience || null,
        app.motivation || null,
        app.feedback_comfort ? parseInt(app.feedback_comfort) : null,
        app.availability === "true" || app.availability === true,
        app.linkedin_url || null,
        app.github_url || null,
        app.website_url || null,
      ]
    );
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
    await executeQuery(
      `INSERT INTO ratings (
        id, application_id, score, feedback, rated_by
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING`,
      [
        rating.id || uuidv4(),
        rating.application_id,
        parseInt(rating.score),
        rating.feedback || null,
        rating.rated_by,
      ]
    );
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
  for (const record of combinedRecords) {
    if (!record.student_id || !record.clerk_user_id || !record.email) {
      continue;
    }

    try {
      await executeQuery(
        "INSERT INTO students (id, user_id, email, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_id) DO NOTHING",
        [
          record.student_id,
          record.clerk_user_id,
          record.email,
          record.first_name || "",
          record.last_name || "",
          record.role || null,
        ]
      );

      studentIdMap.set(record.clerk_user_id, record.student_id);
    } catch (error) {
      console.error(`Error importing student: ${record.email}`, error);
    }
  }

  // Import teams
  for (const record of combinedRecords) {
    if (!record.team_name) {
      continue;
    }

    try {
      const teamId = uuidv4();
      await executeQuery(
        "INSERT INTO teams (id, name, size) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
        [teamId, record.team_name, record.team_size || 1]
      );

      // Update student with team ID if applicable
      if (record.student_id) {
        await executeQuery("UPDATE students SET team_id = $1 WHERE id = $2", [
          teamId,
          record.student_id,
        ]);
      }
    } catch (error) {
      console.error(`Error importing team: ${record.team_name}`, error);
    }
  }

  // Import participant applications
  for (const record of combinedRecords) {
    if (!record.participant_app_id || !record.student_id) {
      continue;
    }

    try {
      await executeQuery(
        `INSERT INTO participant_applications (
          id, student_id, status, gender, pronouns, pronouns_other, 
          university, major, education_level, is_first_datathon, comfort_level, 
          has_team, teammates, dietary_restrictions, development_goals, 
          github_url, linkedin_url, attendance_confirmed, feedback
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (id) DO NOTHING`,
        [
          record.participant_app_id,
          record.student_id,
          record.participant_status || "draft",
          record.gender || null,
          record.participant_pronouns || null,
          record.participant_pronouns_other || null,
          record.university || null,
          record.major || null,
          record.education_level || null,
          record.is_first_datathon === "true",
          record.participant_comfort_level
            ? parseInt(record.participant_comfort_level)
            : null,
          record.has_team === "true",
          record.teammates || null,
          record.participant_dietary_restrictions || null,
          record.development_goals || null,
          record.participant_github_url || null,
          record.participant_linkedin_url || null,
          record.attendance_confirmed === "true",
          record.participant_feedback || null,
        ]
      );
    } catch (error) {
      console.error(
        `Error importing participant application: ${record.participant_app_id}`,
        error
      );
    }
  }

  // Import mentor applications
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

      await executeQuery(
        `INSERT INTO mentor_applications (
          id, student_id, status, pronouns, pronouns_other, 
          affiliation, programming_languages, comfort_level, has_hackathon_experience, 
          motivation, mentor_role_description, availability, linkedin_url, 
          github_url, website_url, dietary_restrictions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING`,
        [
          record.mentor_app_id,
          record.student_id,
          record.mentor_status || "draft",
          record.mentor_pronouns || null,
          record.mentor_pronouns_other || null,
          record.mentor_affiliation || null,
          programmingLanguages,
          record.mentor_comfort_level
            ? parseInt(record.mentor_comfort_level)
            : null,
          record.has_hackathon_experience === "true",
          record.mentor_motivation || null,
          record.mentor_role_description || null,
          record.mentor_availability || null,
          record.mentor_linkedin_url || null,
          record.mentor_github_url || null,
          record.mentor_website_url || null,
          dietaryRestrictions,
        ]
      );
    } catch (error) {
      console.error(
        `Error importing mentor application: ${record.mentor_app_id}`,
        error
      );
    }
  }

  // Import judge applications
  for (const record of combinedRecords) {
    if (!record.judge_app_id || !record.student_id) {
      continue;
    }

    try {
      await executeQuery(
        `INSERT INTO judge_applications (
          id, student_id, status, pronouns, pronouns_other, 
          affiliation, experience, motivation, feedback_comfort, 
          availability, linkedin_url, github_url, website_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING`,
        [
          record.judge_app_id,
          record.student_id,
          record.judge_status || "draft",
          record.judge_pronouns || null,
          record.judge_pronouns_other || null,
          record.judge_affiliation || null,
          record.experience || null,
          record.judge_motivation || null,
          record.feedback_comfort ? parseInt(record.feedback_comfort) : null,
          record.judge_availability === "true",
          record.judge_linkedin_url || null,
          record.judge_github_url || null,
          record.judge_website_url || null,
        ]
      );
    } catch (error) {
      console.error(
        `Error importing judge application: ${record.judge_app_id}`,
        error
      );
    }
  }
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
  } finally {
    await pool.end();
  }
}

main();
