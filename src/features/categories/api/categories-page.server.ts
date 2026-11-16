import "server-only";

import type { Category } from "@/features/categories/types/category.types";
import type { Product, ProductFilters, ProductListResponse, ProductSortBy, SortOrder } from "@/features/products/types/product.types";
import type { CatalogSearchParams } from "@/features/products/api/catalog.server";

type ApiResponse<T> = { success: boolean; message: string; data: T };
type CurrencyData = { currency: string; currencyExponent: number };

export type CategoriesPageData = { categories: Category[] };
export type CategoryDetailPageData = {
  category: Category;
  products: Product[];
  pagination: ProductListResponse["pagination"];
  currency: string;
  currencyExponent: number;
};

const PAGE_SIZE = 12;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildFilters(params: CatalogSearchParams): ProductFilters {
  const rawSortBy = firstValue(params.sortBy);
  const rawSortOrder = firstValue(params.sortOrder);
  const sortBy: ProductSortBy =
    rawSortBy === "price" || rawSortBy === "name" || rawSortBy === "createdAt"
      ? rawSortBy : "createdAt";
  const sortOrder: SortOrder = rawSortOrder === "asc" ? "asc" : "desc";
  const pageValue = Number(firstValue(params.page));
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const search = firstValue(params.search)?.trim().slice(0, 150);
  const minValue = firstValue(params.minPrice);
  const maxValue = firstValue(params.maxPrice);
  const minPrice = minValue?.trim() ? Number(minValue) : undefined;
  const maxPrice = maxValue?.trim() ? Number(maxValue) : undefined;
  const validMin = minPrice !== undefined && Number.isFinite(minPrice) && minPrice >= 0;
  const validMax = maxPrice !== undefined && Number.isFinite(maxPrice) && maxPrice >= 0;
  const validRange = !validMin || !validMax || minPrice! <= maxPrice!;

  return {
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(validRange && validMin ? { minPrice } : {}),
    ...(validRange && validMax ? { maxPrice } : {}),
    sortBy,
    sortOrder,
  };
}

async function request<T>(path: string, locale: string): Promise<T | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    console.error("NEXT_PUBLIC_API_URL is not configured.");
    return null;
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
      headers: { Accept: "application/json", "Accept-Language": locale },
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`Categories API request failed: ${response.status} (${path})`);
      return null;
    }
    const result = (await response.json()) as ApiResponse<T>;
    return result.success && result.data ? result.data : null;
  } catch (error) {
    console.error(`Unable to retrieve category data from ${path}:`, error);
    return null;
  }
}

export async function getCategoryBySlugData(slug: string, locale: string): Promise<Category | null> {
  const data = await request<{ category: Category }>(`/categories/slug/${encodeURIComponent(slug)}`, locale);
  return data?.category ?? null;
}

export async function getCategoriesPageData(locale: string): Promise<CategoriesPageData | null> {
  const data = await request<{ categories: Category[] }>("/categories/tree", locale);
  return data ? { categories: data.categories ?? [] } : null;
}

export async function getCategoryDetailPageData(
  slug: string,
  locale: string,
  searchParams: CatalogSearchParams,
): Promise<CategoryDetailPageData | null> {
  const filters = buildFilters(searchParams);
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => query.set(key, String(value)));

  const [category, currencyData] = await Promise.all([
    getCategoryBySlugData(slug, locale),
    request<CurrencyData>("/home?view=desktop&limit=1", locale),
  ]);
  if (!category) return null;

  const categoryProducts = await request<ProductListResponse>(
    `/products/category/${encodeURIComponent(category._id)}?${query.toString()}`,
    locale,
  );
  if (!categoryProducts) return null;

  return {
    category,
    products: categoryProducts.products ?? [],
    pagination: categoryProducts.pagination,
    currency: currencyData?.currency ?? "EGP",
    currencyExponent: currencyData?.currencyExponent ?? 2,
  };
}
