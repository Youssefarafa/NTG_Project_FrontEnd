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