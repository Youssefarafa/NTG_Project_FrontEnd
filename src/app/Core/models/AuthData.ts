export interface User {
  id?: number;
  fullName: string;
  email: string;
  role?: 'Manager' | 'Candidate';
  isVerified?: boolean;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
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
  token?: string;
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