export interface ProcessCandidate {
  id: string;
  name: string;
  email: string;
}

export interface HiringProcessRequest {
  jobId: string;
  candidateIds: string[];
  testLink: string;
}

export interface HiringProcess {
  id: string;
  jobTitle: string;
  candidates: ProcessCandidate[];
  status: 'active' | 'completed';
  completedAt?: Date;
}

export interface ApplicationDetail {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicationDate: Date;
  age: number;
  graduationYear: number;
  university: string;
  faculty: string;
  department: string;
  workExperience: Array<{
    jobTitle: string;
    companyName: string;
    startDate: Date;
    endDate: Date;
    achievements: string;
  }>;
  hasInternalReference: boolean;
  internalReferees: Array<{ name: string; email: string }>;
}
