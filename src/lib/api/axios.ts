import axios, {
  type InternalAxiosRequestConfig,
} from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;

  if (token) {
    api.defaults.headers.common.Authorization = `user ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

const AUTH_PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/confirm-email",
  "/auth/resend-confirm-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-token",
];

function isPublicAuthEndpoint(url?: string) {
  return AUTH_PUBLIC_ENDPOINTS.some((endpoint) => url?.includes(endpoint));
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh-token")
      .then((response) => {
        const token = response.data?.tokens?.accessToken;

        if (typeof token !== "string" || !token) {
          throw new Error("The refresh response did not include an access token.");
        }

        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storefront:session-expired"));
        }

        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `user ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._authRetry) {
      setAccessToken(null);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storefront:session-expired"));
      }

      return Promise.reject(error);
    }

    if (isPublicAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._authRetry = true;

    const token = await refreshAccessToken();

    if (!token) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `user ${token}`;
    return api(originalRequest);
  },
);

export const apiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (typeof responseMessage === "string") {
      return responseMessage;
    }

    return error.message || "An unexpected API error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};
