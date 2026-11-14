import { api } from "@/lib/api/axios";
import type {
  Product,
  ProductFilters,
  ProductListResponse,
} from "../types/product.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const productsApi = {
  async getProducts(
    filters: ProductFilters,
    locale: string = "en",
  ): Promise<ProductListResponse> {
    const { data } = await api.get<ApiResponse<ProductListResponse>>(
      "/products/list",
      {
        params: filters,
        headers: { "Accept-Language": locale },
      },
    );

    return data.data;
  },

  async getProductsByCategory(
    categoryId: string,
    filters: ProductFilters,
    locale: string = "en",
  ): Promise<ProductListResponse> {
    const { data } = await api.get<ApiResponse<ProductListResponse>>(
      `/products/category/${categoryId}`,
      {
        params: filters,
        headers: { "Accept-Language": locale },
      },
    );

    return data.data;
  },

  async getProduct(productId: string, locale: string = "en"): Promise<Product> {
    const { data } = await api.get<ApiResponse<{ product: Product }>>(
      `/products/${productId}`,
      {
        headers: { "Accept-Language": locale },
      },
    );

    return data.data.product;
  },

  async getProductBySlug(
    slug: string,
    locale: string = "en",
  ): Promise<Product> {
    const { data } = await api.get<ApiResponse<{ product: Product }>>(
      `/products/slug/${encodeURIComponent(slug)}`,
      {
        headers: { "Accept-Language": locale },
      },
    );

    return data.data.product;
  },
};
