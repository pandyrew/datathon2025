-- Create tables for the datathon application

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participant applications table
CREATE TABLE IF NOT EXISTS participant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  team_id UUID REFERENCES teams(id),
  status TEXT NOT NULL DEFAULT 'pending',
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor applications table
CREATE TABLE IF NOT EXISTS mentor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  status TEXT NOT NULL DEFAULT 'pending',
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Judge applications table
CREATE TABLE IF NOT EXISTS judge_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  status TEXT NOT NULL DEFAULT 'pending',
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  judge_id UUID NOT NULL REFERENCES students(id),
  score INTEGER NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_participant_applications_student_id ON participant_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_participant_applications_team_id ON participant_applications(team_id);
CREATE INDEX IF NOT EXISTS idx_mentor_applications_student_id ON mentor_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_judge_applications_student_id ON judge_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_ratings_application_id ON ratings(application_id);
CREATE INDEX IF NOT EXISTS idx_ratings_judge_id ON ratings(judge_id);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('students', 'teams', 'participant_applications', 'mentor_applications', 'judge_applications', 'ratings')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_updated_at_trigger ON %I;
      CREATE TRIGGER update_updated_at_trigger
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
    ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a function to execute arbitrary SQL
-- This is used by the import script to create tables
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC functions for table creation
-- These functions are called by the import script

CREATE OR REPLACE FUNCTION create_teams_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    size INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_students_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_participant_applications_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_mentor_applications_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_judge_applications_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_ratings_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL,
    score INTEGER NOT NULL,
    feedback TEXT,
    rated_by UUID NOT NULL REFERENCES students(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql; 