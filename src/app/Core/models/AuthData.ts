export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate?: string | Date; 
  university: string;
  faculty: string;
  department: string;
  graduationYear: number;
  role: string; // 'Manager' | 'Candidate'
  isVerified: boolean;
  token?: string; 
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  requiresOtp?: boolean;
  errors?: Record<string, string[]>;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse extends RegisterResponse {
  requiresOtp?: boolean;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
  type?: 'register' | 'login' | 'reset';
}

export interface OtpResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface RefreshResponse {
  success: boolean;
  token: string;      
  refreshToken?: string; 
  user?: User;
  expiresIn?: number;  
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresOtp: boolean;
  otpEmail?: string;
}
