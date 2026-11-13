
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | { _id: string; name: string };
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  totalProductCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
