import { api } from "@/lib/api/axios";
import type { ProductFilters, ProductListResponse, Product } from "../types/product.types";

type ApiResponse<T> = { success: boolean; message: string; data: T };

export const productsApi = {
  async getProducts(
    filters: ProductFilters,
  ): Promise<ProductListResponse> {
    const { data } = await api.get<ApiResponse<ProductListResponse>>(
      "/products",
      { params: filters },
    );

    return data.data;
  },

  async getProduct(productId: string): Promise<Product> {
    const { data } = await api.get<ApiResponse<{ product: Product }>>(
      `/products/${productId}`,
    );

    return data.data.product;
  },

};
