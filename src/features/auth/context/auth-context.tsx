"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";

import { api, refreshAccessToken, setAccessToken } from "@/lib/api/axios";
import { authApi } from "@/features/auth/api/auth.api";
import type {
  Customer,
  LoginPayload,
  RegisterPayload,
} from "@/features/auth/types/auth.types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: Customer | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [user, setUser] = useState<Customer | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    api.defaults.headers.common["Accept-Language"] = locale;
  }, [locale]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setStatus("unauthenticated");
    };

    window.addEventListener("storefront:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("storefront:session-expired", handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const accessToken = await refreshAccessToken();

        if (!accessToken) {
          throw new Error("No active customer session was found.");
        }

        if (!active) return;

        const profileResponse = await authApi.profile();

        if (active) {
          setUser(profileResponse.user);
          setStatus("authenticated");
        }
      } catch {
        setAccessToken(null);

        if (active) {
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    const accessToken = response.tokens?.accessToken;
    const customer = response.user;

    if (!accessToken || !customer) {
      throw new Error("The login response is missing customer credentials.");
    }

    setAccessToken(accessToken);
    setUser(customer);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authApi.register(payload);
  }, []);

  const refreshProfile = useCallback(async () => {
    const response = await authApi.profile();
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      login,
      register,
      logout,
      logoutAll,
      refreshProfile,
    }),
    [user, status, login, register, logout, logoutAll, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
