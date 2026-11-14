import "server-only";

import type { Product } from "@/features/products/types/product.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ProductDetailsResponse = {
  product: Product;
};

type HomepageCurrency = {
  currency: string;
  currencyExponent: number;
};

export type ProductDetailsPageData = {
  product: Product;
  currency: string;
  currencyExponent: number;
};

async function request<T>(path: string, locale: string): Promise<T | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    console.error("NEXT_PUBLIC_API_URL is not configured.");
    return null;
  }

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/+$/, "")}${path}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Accept-Language": locale,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status !== 404) {
        console.error(
          `Product API request failed: ${response.status} ${response.statusText} (${path})`,
        );
      }
      return null;
    }

    const result = (await response.json()) as ApiResponse<T>;
    return result.success && result.data ? result.data : null;
  } catch (error) {
    console.error(`Unable to retrieve product data from ${path}:`, error);
    return null;
  }
}

export async function getProductBySlug(
  slug: string,
  locale: string,
): Promise<Product | null> {
  const data = await request<ProductDetailsResponse>(
    `/products/slug/${encodeURIComponent(slug)}`,
    locale,
  );

  return data?.product ?? null;
}

export async function getProductDetailsPageData(
  slug: string,
  locale: string,
): Promise<ProductDetailsPageData | null> {
  const [product, currencyData] = await Promise.all([
    getProductBySlug(slug, locale),
    request<HomepageCurrency>("/home?view=desktop&limit=1", locale),
  ]);

  if (!product) return null;

  return {
    product,
    currency: currencyData?.currency ?? "EGP",
    currencyExponent: currencyData?.currencyExponent ?? 2,
  };
}
