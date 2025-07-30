import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { 
  Candidate, 
  Job, 
  CreateCandidateData, 
  CreateJobData, 
  AnalysisResult,
  BulkAnalysisResult 
} from '../services/api';

// Query keys
export const queryKeys = {
  candidates: ['candidates'] as const,
  candidate: (id: string) => ['candidates', id] as const,
  jobs: ['jobs'] as const,
  job: (id: string) => ['jobs', id] as const,
  analytics: ['analytics'] as const,
  jobScores: (jobId: string) => ['jobScores', jobId] as const,
  candidateScores: (candidateId: string) => ['candidateScores', candidateId] as const,
};

// Candidate hooks
export const useCandidates = (params?: {
  search?: string;
  skills?: string;
  sortBy?: string;
  order?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.candidates, params],
    queryFn: () => apiClient.getCandidates(params),
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: queryKeys.candidate(id),
    queryFn: () => apiClient.getCandidate(id),
    enabled: !!id,
  });
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCandidateData) => apiClient.createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates });
    },
  });
};

export const useUploadCV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => apiClient.uploadCV(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates });
    },
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCandidateData> }) =>
      apiClient.updateCandidate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidate(id) });
    },
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates });
    },
  });
};

// Job hooks
export const useJobs = (params?: {
  search?: string;
  sortBy?: string;
  order?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.jobs, params],
    queryFn: () => apiClient.getJobs(params),
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => apiClient.getJob(id),
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateJobData) => apiClient.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobData> }) =>
      apiClient.updateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      queryClient.invalidateQueries({ queryKey: queryKeys.job(id) });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
};

// Analysis hooks
export const useAnalyzeCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ candidateId, jobId }: { candidateId: string; jobId: string }) =>
      apiClient.analyzeCandidate(candidateId, jobId),
    onSuccess: (_, { jobId, candidateId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobScores(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidateScores(candidateId) });
    },
  });
};

export const useJobScores = (jobId: string) => {
  return useQuery({
    queryKey: queryKeys.jobScores(jobId),
    queryFn: () => apiClient.getJobScores(jobId),
    enabled: !!jobId,
  });
};

export const useCandidateScores = (candidateId: string) => {
  return useQuery({
    queryKey: queryKeys.candidateScores(candidateId),
    queryFn: () => apiClient.getCandidateScores(candidateId),
    enabled: !!candidateId,
  });
};

export const useAnalyzeBulk = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobId: string) => apiClient.analyzeBulk(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobScores(jobId) });
      // Also invalidate all candidate scores since they may have been updated
      queryClient.invalidateQueries({ queryKey: ['candidateScores'] });
    },
  });
};

// Analytics hooks
export const useAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => apiClient.getAnalytics(),
  });
};