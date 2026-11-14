import { api } from "@/lib/api/axios";
import type {
  AuthResponse,
  EmailPayload,
  LoginPayload,
  ProfileResponse,
  RegisterPayload,
  VerifyEmailPayload,
} from "@/features/auth/types/auth.types";

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  login: async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  verifyEmail: async (payload: VerifyEmailPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/confirm-email", payload);
    return data;
  },

  resendVerification: async (payload: EmailPayload) => {
    const { data } = await api.post<AuthResponse>(
      "/auth/resend-confirm-email",
      payload,
    );
    return data;
  },

  profile: async () => {
    const { data } = await api.get<ProfileResponse>("/auth/profile");
    return data;
  },

  logout: async () => {
    const { data } = await api.post<AuthResponse>("/auth/logout");
    return data;
  },

  logoutAll: async () => {
    const { data } = await api.post<AuthResponse>("/auth/logout-all");
    return data;
  },

  forgotPassword: async (payload: EmailPayload) => {
    const { data } = await api.patch<AuthResponse>(
      "/auth/forgot-password",
      payload,
    );
    return data;
  },

  resetPassword: async (payload: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const { data } = await api.patch<AuthResponse>(
      "/auth/reset-password",
      payload,
    );
    return data;
  },
};
