"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/auth-context";
import { ordersApi } from "@/features/orders/api/orders.api";
import type { CancelOrderPayload } from "@/features/orders/types/order.types";

export const ordersQueryKey = (customerId?: string) =>
  ["customer-orders", customerId] as const;

export const orderQueryKey = (customerId?: string, orderId?: string) =>
  ["customer-order", customerId, orderId] as const;

export function useOrders(page: number, limit = 10) {
  const { user, status } = useAuth();

  return useQuery({
    queryKey: [...ordersQueryKey(user?.id), page, limit],
    queryFn: () => ordersApi.list(page, limit),
    enabled: status === "authenticated" && Boolean(user?.id),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useOrder(orderId: string) {
  const { user, status } = useAuth();

  return useQuery({
    queryKey: orderQueryKey(user?.id, orderId),
    queryFn: () => ordersApi.getById(orderId),
    enabled: status === "authenticated" && Boolean(user?.id && orderId),
    staleTime: 30_000,
  });
}

export function useCancelOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: CancelOrderPayload;
    }) => ordersApi.cancel(orderId, payload),
    onSuccess: async (order) => {
      queryClient.setQueryData(orderQueryKey(user?.id, order._id), order);
      await queryClient.invalidateQueries({
        queryKey: ordersQueryKey(user?.id),
      });
    },
  });
}
