// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async health(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Candidate endpoints
  async getCandidates(params?: {
    search?: string;
    skills?: string;
    sortBy?: string;
    order?: string;
  }): Promise<Candidate[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    return this.request(`/api/candidates?${queryParams}`);
  }

  async getCandidate(id: string): Promise<Candidate> {
    return this.request(`/api/candidates/${id}`);
  }

  async createCandidate(data: CreateCandidateData): Promise<Candidate> {
    return this.request('/api/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadCV(file: File): Promise<Candidate> {
    const formData = new FormData();
    formData.append('cv', file);

    return this.request('/api/candidates', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async updateCandidate(id: string, data: Partial<CreateCandidateData>): Promise<Candidate> {
    return this.request(`/api/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCandidate(id: string): Promise<{ message: string }> {
    return this.request(`/api/candidates/${id}`, {
      method: 'DELETE',
    });
  }

  // Job endpoints
  async getJobs(params?: {
    search?: string;
    sortBy?: string;
    order?: string;
  }): Promise<Job[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    return this.request(`/api/jobs?${queryParams}`);
  }

  async getJob(id: string): Promise<Job> {
    return this.request(`/api/jobs/${id}`);
  }

  async createJob(data: CreateJobData): Promise<Job> {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: string, data: Partial<CreateJobData>): Promise<Job> {
    return this.request(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: string): Promise<{ message: string }> {
    return this.request(`/api/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Analysis endpoints
  async analyzeCandidate(candidateId: string, jobId: string): Promise<AnalysisResult> {
    return this.request(`/api/analyze/${candidateId}/${jobId}`, {
      method: 'POST',
    });
  }

  async getJobScores(jobId: string): Promise<JobScoreResult[]> {
    return this.request(`/api/analyze/scores/${jobId}`);
  }

  async getCandidateScores(candidateId: string): Promise<CandidateScoreResult[]> {
    return this.request(`/api/analyze/candidate/${candidateId}`);
  }

  async analyzeBulk(jobId: string): Promise<BulkAnalysisResult> {
    return this.request(`/api/analyze/bulk/${jobId}`, {
      method: 'POST',
    });
  }

  // Analytics endpoint
  async getAnalytics(): Promise<Analytics> {
    return this.request('/api/analytics');
  }
}

// Types
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

export interface JobScoreResult {
  score: CandidateScore;
  candidate: Pick<Candidate, 'id' | 'name' | 'email' | 'phone' | 'skills' | 'experience'>;
}

export interface CandidateScoreResult {
  score: CandidateScore;
  job: Pick<Job, 'id' | 'title' | 'description' | 'required_skills'>;
}

export interface BulkAnalysisResult {
  job: Job;
  total_candidates: number;
  results: AnalysisResult[];
}

export interface Analytics {
  totalCandidates: number;
  totalJobs: number;
  averageScore: number;
  topSkills: string[];
}

export interface CreateCandidateData {
  name: string;
  email: string;
  phone?: string;
  experience?: string;
  skills?: string[];
}

export interface CreateJobData {
  title: string;
  description: string;
  requirements: string;
  required_skills: string[];
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;