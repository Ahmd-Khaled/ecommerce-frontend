import { api } from "@/lib/api/axios";
import type { Category, CategoryApiResponse } from "../types/category.types";

interface CategoryListData {
  categories: Category[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const categoriesApi = {
  async getCategories(locale: string = "en"): Promise<Category[]> {
    const { data } = await api.get<
      CategoryApiResponse<CategoryListData>
    >("/categories/list", {
      headers: { "Accept-Language": locale },
    });

    return data.data.categories;
  },

  async getCategoryBySlug(
    slug: string,
    locale: string = "en",
  ): Promise<Category> {
    const { data } = await api.get<
      CategoryApiResponse<{ category: Category }>
    >(`/categories/slug/${encodeURIComponent(slug)}`, {
      headers: { "Accept-Language": locale },
    });

    return data.data.category;
  },

  async getCategoryTree(locale: string = "en"): Promise<Category[]> {
    const { data } = await api.get<
      CategoryApiResponse<{ categories: Category[] }>
    >("/categories/tree", {
      headers: { "Accept-Language": locale },
    });

    return data.data.categories;
  },
};
