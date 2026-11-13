import { api } from "@/lib/api/axios";
import type { Category, CategoryApiResponse } from "../types/category.types";

export const categoriesApi = {
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<
      CategoryApiResponse<{ categories: Category[] }>
    >("/categories");

    return data.data.categories;
  },

  async getCategory(id: string): Promise<Category> {
    const { data } = await api.get<
      CategoryApiResponse<{ category: Category }>
    >(`/categories/${id}`);

    return data.data.category;
  },

};
