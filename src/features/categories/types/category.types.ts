export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | { _id: string; name: string } | null;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  totalProductCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CategoryListData {
  categories: Category[];
  pagination: CategoryPagination;
}

export interface CategoryApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
