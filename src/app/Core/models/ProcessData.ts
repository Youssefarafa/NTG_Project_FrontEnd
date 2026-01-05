export interface JobBasicInfo {
  id: string;
  title: string;
}

export interface InternalReferee {
  name: string;
  email: string;
}

export interface WorkExperience {
  jobTitle: string;
  companyName: string;
  startDate: string; 
  endDate: string; 
  achievements: string;
}

export interface ApplicantJoinData {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  birthDate?: string | Date; 
  university?: string;
  faculty?: string;
  department?: string;
  graduationYear?: number;
  cvFile: string;
  hasInternalReference: boolean;
  internalReferees: InternalReferee[];
  workExperience: WorkExperience[];
}

export interface ApplicantsResponse {
  success: boolean;
  data?: ApplicantJoinData[]; 
  message?: string;
}

export interface CreateProcessPayload {
  jobId: string;
  candidateIds: string[];
  testLink: string;
}

export interface ProcessResponse {
  success: boolean;
  message: string;
  data?: any; 
}

export type CandidateStatus = 
  | 'New (ShortListed)'
  | 'Called for Exam'
  | 'Finished Exam'
  | 'Called for Interview'
  | 'Interviewed'
  | 'Technically Approved'
  | 'Technically Rejected'
  | 'Technically Waiting List';

export interface ProcessCandidateDetails extends ApplicantJoinData {
  status: CandidateStatus;
  grade?: string;
  feedback?: string;
}

export interface FullProcessResponse {
  success: boolean;
  data: {
    id: string;
    jobTitle: string;
    status: 'Active' | 'Completed';
    candidates: ProcessCandidateDetails[]; 
  };
  message?: string;
}