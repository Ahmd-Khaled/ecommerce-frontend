"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/auth-context";
import { reviewsApi } from "@/features/reviews/api/reviews.api";
import type { ReviewPayload } from "@/features/reviews/types/review.types";

const PAGE_SIZE = 10;
export const productReviewsKey = (productId: string) => ["product-reviews", productId] as const;
export const customerReviewsKey = (customerId?: string) => ["customer-reviews", customerId] as const;

export function useProductReviews(productId: string) {
  return useInfiniteQuery({
    queryKey: productReviewsKey(productId),
    queryFn: ({ pageParam }) => reviewsApi.listProduct(productId, { limit: PAGE_SIZE, after: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(productId),
    staleTime: 30_000,
  });
}

export function useMyReviews(pageSize = PAGE_SIZE) {
  const { user, status } = useAuth();
  return useInfiniteQuery({
    queryKey: [...customerReviewsKey(user?.id), pageSize],
    queryFn: ({ pageParam }) => reviewsApi.mine({ limit: pageSize, after: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: status === "authenticated" && Boolean(user?.id),
    staleTime: 30_000,
  });
}

export function useReviewMutations(productId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = async () => {
    if (productId) await queryClient.invalidateQueries({ queryKey: productReviewsKey(productId) });
    await queryClient.invalidateQueries({ queryKey: customerReviewsKey(user?.id) });
  };
  const create = useMutation({
    mutationFn: (payload: ReviewPayload) => {
      if (!productId) throw new Error("A product is required to create a review.");
      return reviewsApi.create(productId, payload);
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: ReviewPayload }) => reviewsApi.update(reviewId, payload),
    onSuccess: invalidate,
  });
  const withdraw = useMutation({ mutationFn: (reviewId: string) => reviewsApi.withdraw(reviewId), onSuccess: invalidate });
  return { create, update, withdraw };
}
