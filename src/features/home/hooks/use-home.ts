"use client";

import { useQuery } from "@tanstack/react-query";
import { homeApi } from "../api/home.api";

export function useHome(view: "desktop" | "mobile", locale: string) {
  return useQuery({
    queryKey: ["home", locale, view],
    queryFn: () => homeApi.get(view, locale),
  });
}
