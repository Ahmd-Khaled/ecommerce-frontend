export type CustomerRole = "user" | "guest";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: CustomerRole;
  confirmedAt?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: "user";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Customer;
  tokens?: AuthTokens;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  user: Customer;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface EmailPayload {
  email: string;
}
