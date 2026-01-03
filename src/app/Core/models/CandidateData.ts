export interface Candidate {
  id: string;
  name: string;         
  email: string;          
  phoneNumber?: string;    
  birthDate?: string | Date; 
  university?: string;      
  faculty?: string;         
  department?: string;      
  graduationYear?: number;  
}

export interface CandidateResponse {
  success: boolean;
  message: string;
  data?: Candidate[]; 
}