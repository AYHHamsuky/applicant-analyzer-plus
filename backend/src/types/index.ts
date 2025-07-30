// Backend TypeScript interfaces and types

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  skills: string[];
  cv_file_path: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  required_skills: string[];
  created_at: string;
  updated_at: string;
}

export interface CandidateScore {
  id: string;
  candidate_id: string;
  job_id: string;
  overall_score: number;
  skill_match_score: number;
  experience_score: number;
  created_at: string;
}

export interface CandidateSkill {
  id: string;
  candidate_id: string;
  skill_name: string;
  proficiency_level: number;
}

export interface ParsedCV {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
}

export interface AnalysisResult {
  candidate: Candidate;
  score: CandidateScore;
  matching_skills: string[];
  missing_skills: string[];
}