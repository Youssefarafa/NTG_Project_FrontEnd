export interface Job {
  id: string;
  title: string;
  reportsTo: string;
  experience: number;
  responsibilities: string[];
  requiredSkills: string[];
  isApplied: boolean;
  expiresAt?: string | Date;
}
