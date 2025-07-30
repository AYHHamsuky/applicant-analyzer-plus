// Frontend TypeScript interfaces - matches backend types

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

export interface AnalysisResult {
  candidate: Candidate;
  score: CandidateScore;
  matching_skills: string[];
  missing_skills: string[];
}

// Legacy types for backward compatibility with existing components
export interface ProcessedCV {
  id: string;
  fileName: string;
  candidateName: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  score: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
}

export interface JobRequirement {
  title: string;
  department: string;
  experience: string;
  skills: string[];
  description: string;
}

// Helper function to convert backend Candidate to legacy ProcessedCV
export function candidateToProcessedCV(
  candidate: Candidate,
  score?: CandidateScore,
  matchingSkills: string[] = [],
  missingSkills: string[] = []
): ProcessedCV {
  return {
    id: candidate.id,
    fileName: candidate.cv_file_path.split('/').pop() || 'CV',
    candidateName: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    skills: candidate.skills,
    experience: candidate.experience,
    education: '', // Not tracked separately in new system
    score: score ? score.overall_score : 0,
    summary: candidate.experience.substring(0, 200) + '...',
    matchingSkills,
    missingSkills
  };
}

// Helper function to convert JobRequirement to Job
export function jobRequirementToJob(jobReq: JobRequirement): Partial<Job> {
  return {
    title: jobReq.title,
    description: jobReq.description,
    requirements: `Experience: ${jobReq.experience}\nDepartment: ${jobReq.department}`,
    required_skills: jobReq.skills
  };
}