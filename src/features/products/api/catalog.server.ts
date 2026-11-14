import "server-only";

import type {
  Product,
  ProductFilters,
  ProductListResponse,
  ProductSortBy,
  SortOrder,
} from "@/features/products/types/product.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type HomepageCurrency = {
  currency: string;
  currencyExponent: number;
};

export type ProductCatalogPageData = {
  products: Product[];
  pagination: ProductListResponse["pagination"];
  currency: string;
  currencyExponent: number;
};

export type CatalogSearchParams = Record<
  string,
  string | string[] | undefined
>;

const DEFAULT_PAGE_SIZE = 12;
const MAX_PRICE_FILTER = 250_000;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseNonNegativeNumber(value: string | undefined) {
  if (value === undefined || value.trim() === "") return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0
    ? Math.min(parsed, MAX_PRICE_FILTER)
    : undefined;
}

function buildFilters(params: CatalogSearchParams): ProductFilters {
  const rawSortBy = firstValue(params.sortBy);
  const rawSortOrder = firstValue(params.sortOrder);

  const sortBy: ProductSortBy =
    rawSortBy === "price" || rawSortBy === "name" || rawSortBy === "createdAt"
      ? rawSortBy
      : "createdAt";

  const sortOrder: SortOrder =
    rawSortOrder === "asc" || rawSortOrder === "desc"
      ? rawSortOrder
      : "desc";

  const search = firstValue(params.search)?.trim().slice(0, 150);
  const minPrice = parseNonNegativeNumber(firstValue(params.minPrice));
  const maxPrice = parseNonNegativeNumber(firstValue(params.maxPrice));
  const validPriceRange =
    minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice;

  return {
    page: parsePositiveInteger(firstValue(params.page), 1),
    limit: DEFAULT_PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(validPriceRange && minPrice !== undefined ? { minPrice } : {}),
    ...(validPriceRange && maxPrice !== undefined ? { maxPrice } : {}),
    sortBy,
    sortOrder,
  };
}

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
      console.error(
        `Catalog API request failed: ${response.status} ${response.statusText} (${path})`,
      );
      return null;
    }

    const result = (await response.json()) as ApiResponse<T>;

    return result.success && result.data ? result.data : null;
  } catch (error) {
    console.error(`Unable to retrieve catalog data from ${path}:`, error);
    return null;
  }
}

export async function getProductCatalogPageData(
  locale: string,
  searchParams: CatalogSearchParams,
): Promise<ProductCatalogPageData | null> {
  const filters = buildFilters(searchParams);
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });

  const [productData, currencyData] = await Promise.all([
    request<ProductListResponse>(`/products/list?${query.toString()}`, locale),
    request<HomepageCurrency>("/home?view=desktop&limit=1", locale),
  ]);

  if (!productData) return null;

  return {
    products: productData.products ?? [],
    pagination: productData.pagination,
    currency: currencyData?.currency ?? "EGP",
    currencyExponent: currencyData?.currencyExponent ?? 2,
  };
}
