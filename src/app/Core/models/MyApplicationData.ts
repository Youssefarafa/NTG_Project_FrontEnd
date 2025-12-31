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

export interface ApplyJobRequest {
  jobId: string;
  isApplied: boolean;
  cvFile: string;
  hasInternalReference: boolean;
  internalReferees: InternalReferee[];
  workExperience: WorkExperience[];
}