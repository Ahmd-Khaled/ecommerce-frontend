export type ReviewState = "pending" | "published" | "hidden" | "removed";

export interface PublicReview {
  id: string;
  rating: number;
  text?: string;
  createdAt: string;
  reviewer: { firstName: string; avatar?: string };
}

export interface CustomerReview {
  id: string;
  productId: string;
  rating: number;
  text?: string;
  state: ReviewState;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPage<T> {
  reviews: T[];
  nextCursor: string | null;
}

export interface PublicReviewsPage extends ReviewPage<PublicReview> {
  rating: { average: number; count: number };
}

export interface ReviewPayload {
  rating: number;
  text?: string | null;
}
