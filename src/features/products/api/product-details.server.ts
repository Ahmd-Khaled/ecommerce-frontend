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

type ProductListResponse = {
  products: Product[];
};

type HomepageCurrency = {
  currency: string;
  currencyExponent: number;
};

export type ProductDetailsPageData = {
  product: Product;
  relatedProducts: Product[];
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
      `${apiBaseUrl.replace(/\\/+$/, "")}${path}`,
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

async function getRelatedProducts(
  product: Product,
  locale: string,
): Promise<Product[]> {
  const categoryId =
    typeof product.category === "string"
      ? product.category
      : product.category?._id;

  if (!categoryId) return [];

  const data = await request<ProductListResponse>(
    `/products/category/${encodeURIComponent(categoryId)}?page=1&limit=8&sortBy=createdAt&sortOrder=desc`,
    locale,
  );

  return (data?.products ?? [])
    .filter((relatedProduct) => relatedProduct._id !== product._id)
    .slice(0, 4);
}

export async function getProductDetailsPageData(
  slug: string,
  locale: string,
): Promise<ProductDetailsPageData | null> {
  const product = await getProductBySlug(slug, locale);

  if (!product) return null;

  const [currencyData, relatedProducts] = await Promise.all([
    request<HomepageCurrency>("/home?view=desktop&limit=1", locale),
    getRelatedProducts(product, locale),
  ]);

  return {
    product,
    relatedProducts,
    currency: currencyData?.currency ?? "EGP",
    currencyExponent: currencyData?.currencyExponent ?? 2,
  };
}
