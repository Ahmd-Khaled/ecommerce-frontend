import "server-only";

import type { HomepageResponse } from "../types/home.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getHomepageData(
  locale: string,
  view: "desktop" | "mobile" = "desktop",
): Promise<HomepageResponse | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    console.error("NEXT_PUBLIC_API_URL is not configured.");
    return null;
  }

  const endpoint = `${apiBaseUrl.replace(/\/+$/, "")}/home?view=${view}&limit=8`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Homepage API request failed: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const result = (await response.json()) as ApiResponse<HomepageResponse>;

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Unable to retrieve homepage data:", error);
    return null;
  }
}
