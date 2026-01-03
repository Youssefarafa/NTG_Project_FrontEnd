export interface CandidateSummary {
  id: string;
  name: string;
}

export interface ProcessSummary {
  id: string;
  jobTitle: string;
  candidates: CandidateSummary[];
  completedAt?: string | Date; 
}

export interface DashboardStats {
  totalJobs: number;
  totalCandidates: number;
  ongoingProcessesCount: number;
  activePipelines: ProcessSummary[];
  recentHistory: ProcessSummary[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}