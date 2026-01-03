export interface Job {
  id: string;
  title: string;
  reportsTo: string;
  experience: number;
  responsibilities: string[];
  requiredSkills: string[];
  isApplied?: boolean;
  expiresAt?: string | Date;
}

export interface JobsResponse {
  success: boolean;
  data?: Partial<Job>[] | Partial<Job>;
  message?: string;
}