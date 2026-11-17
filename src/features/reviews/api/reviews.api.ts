import { api } from "@/lib/api/axios";
import type { CustomerReview, PublicReviewsPage, ReviewPage, ReviewPayload } from "@/features/reviews/types/review.types";

type Envelope<T> = { success: boolean; data: T };

export const reviewsApi = {
  async listProduct(productId: string, params: { limit: number; after?: string }): Promise<PublicReviewsPage> {
    const { data } = await api.get<Envelope<PublicReviewsPage>>(`/products/${encodeURIComponent(productId)}/reviews`, { params });
    if (!data?.success || !Array.isArray(data.data?.reviews) || !data.data.rating) throw new Error("The product reviews response is invalid.");
    return data.data;
  },
  async mine(params: { limit: number; after?: string }): Promise<ReviewPage<CustomerReview>> {
    const { data } = await api.get<Envelope<ReviewPage<CustomerReview>>>("/products/reviews/me", { params });
    if (!data?.success || !Array.isArray(data.data?.reviews)) throw new Error("The customer reviews response is invalid.");
    return data.data;
  },
  async create(productId: string, payload: ReviewPayload) {
    const { data } = await api.post<Envelope<{ id: string; state: CustomerReview["state"] }>>(`/products/${encodeURIComponent(productId)}/reviews`, payload);
    if (!data?.success || !data.data?.id) throw new Error("The created review response is invalid.");
    return data.data;
  },
  async update(reviewId: string, payload: ReviewPayload) {
    const { data } = await api.patch<Envelope<{ id: string; state: CustomerReview["state"] }>>(`/products/reviews/me/${encodeURIComponent(reviewId)}`, payload);
    if (!data?.success || !data.data?.id) throw new Error("The updated review response is invalid.");
    return data.data;
  },
  async withdraw(reviewId: string) {
    const { data } = await api.delete<Envelope<{ id: string; state: "removed" }>>(`/products/reviews/me/${encodeURIComponent(reviewId)}`);
    if (!data?.success || !data.data?.id) throw new Error("The withdrawn review response is invalid.");
    return data.data;
  },
};
