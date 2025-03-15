export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          team_id: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          team_id?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          team_id?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          size?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          size?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      participant_applications: {
        Row: {
          id: string;
          student_id: string;
          status: string;
          full_name: string | null;
          gender: string | null;
          pronouns: string | null;
          pronouns_other: string | null;
          university: string | null;
          major: string | null;
          education_level: string | null;
          is_first_datathon: boolean;
          comfort_level: number | null;
          has_team: boolean;
          teammates: string | null;
          dietary_restrictions: string | null;
          development_goals: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          attendance_confirmed: boolean;
          feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          status?: string;
          full_name?: string | null;
          gender?: string | null;
          pronouns?: string | null;
          pronouns_other?: string | null;
          university?: string | null;
          major?: string | null;
          education_level?: string | null;
          is_first_datathon?: boolean;
          comfort_level?: number | null;
          has_team?: boolean;
          teammates?: string | null;
          dietary_restrictions?: string | null;
          development_goals?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          attendance_confirmed?: boolean;
          feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          status?: string;
          full_name?: string | null;
          gender?: string | null;
          pronouns?: string | null;
          pronouns_other?: string | null;
          university?: string | null;
          major?: string | null;
          education_level?: string | null;
          is_first_datathon?: boolean;
          comfort_level?: number | null;
          has_team?: boolean;
          teammates?: string | null;
          dietary_restrictions?: string | null;
          development_goals?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          attendance_confirmed?: boolean;
          feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mentor_applications: {
        Row: {
          id: string;
          student_id: string;
          status: string;
          full_name: string | null;
          pronouns: string | null;
          pronouns_other: string | null;
          affiliation: string | null;
          programming_languages: string[] | null;
          comfort_level: number | null;
          has_hackathon_experience: boolean;
          motivation: string | null;
          mentor_role_description: string | null;
          availability: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          website_url: string | null;
          dietary_restrictions: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          status?: string;
          full_name?: string | null;
          pronouns?: string | null;
          pronouns_other?: string | null;
          affiliation?: string | null;
          programming_languages?: string[] | null;
          comfort_level?: number | null;
          has_hackathon_experience?: boolean;
          motivation?: string | null;
          mentor_role_description?: string | null;
          availability?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          website_url?: string | null;
          dietary_restrictions?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          status?: string;
          full_name?: string | null;
          pronouns?: string | null;
          pronouns_other?: string | null;
          affiliation?: string | null;
          programming_languages?: string[] | null;
          comfort_level?: number | null;
          has_hackathon_experience?: boolean;
          motivation?: string | null;
          mentor_role_description?: string | null;
          availability?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          website_url?: string | null;
          dietary_restrictions?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      judge_applications: {
        Row: {
          id: string;
          student_id: string;
          status: string;
          full_name: string | null;
          pronouns: string | null;
          pronouns_other: string | null;
          affiliation: string | null;
          experience: string | null;
          motivation: string | null;
          feedback_comfort: number | null;
          availability: boolean;
          linkedin_url: string | null;
          github_url: string | null;
          website_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          status?: string;
          full_name?: string | null;
          pronouns?: string | null;
          pronouns_other?: string | null;
          affiliation?: string | null;
          experience?: string | null;
          motivation?: string | null;
          feedback_comfort?: number | null;
          availability?: boolean;
          linkedin_url?: string | null;
          github_url?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          status?: string;
          full_name?: string | null;
          pronouns?: string | null;
          pronouns_other?: string | null;
          affiliation?: string | null;
          experience?: string | null;
          motivation?: string | null;
          feedback_comfort?: number | null;
          availability?: boolean;
          linkedin_url?: string | null;
          github_url?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          application_id: string;
          score: number;
          feedback: string | null;
          rated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          score: number;
          feedback?: string | null;
          rated_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          score?: number;
          feedback?: string | null;
          rated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
