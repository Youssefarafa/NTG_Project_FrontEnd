
export interface WorkExperience {
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate: string;
  achievements: string;
}

export interface InternalReferee {
  name: string;
  email: string;
}

export interface JobApplication {
  jobId: string;
  applicantName: string;
  phone: string;
  age: number;
  university: string;
  faculty: string;
  department: string;
  graduationYear: number;
  workExperience: WorkExperience[];
  hasInternalReference: boolean;
  internalReferees: InternalReferee[];
  cvFile?: string;
}
