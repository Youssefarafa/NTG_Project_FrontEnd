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
  linkedInProfile?: string;
  hasInternalReference: boolean;
  internalReferees: InternalReferee[];
  workExperience: WorkExperience[];
}

export interface AppliedJob {
  id: string;
  jobTitle: string;
  appliedDate: string;
  status:
    | 'New (ShortListed)'
    | 'Called for Exam'
    | 'Finished Exam'
    | 'Called for Interview'
    | 'Interviewed'
    | 'Technically Approved'
    | 'Technically Rejected'
    | 'Technically Waiting List';
  jobDetails: {
    reportsTo: string;
    experience: number;
    responsibilities: string[];
    requiredSkills: string[];
  };
  applicationData: {
    cvFile: string;
    hasInternalReference: boolean;
    internalReferees: InternalReferee[];
    workExperience: WorkExperience[];
  };
}

export interface AppliedJobsResponse {
  success: boolean;
  message?: string;
  data: AppliedJob[];
}
