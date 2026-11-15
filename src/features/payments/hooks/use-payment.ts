"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/auth-context";
import { paymentsApi } from "@/features/payments/api/payments.api";

export const paymentQueryKey = (customerId?: string, orderId?: string) =>
  ["order-payment", customerId, orderId] as const;

export function useOrderPayment(orderId: string) {
  const { user, status } = useAuth();

  return useQuery({
    queryKey: paymentQueryKey(user?.id, orderId),
    queryFn: () => paymentsApi.getOrderPayment(orderId),
    enabled: status === "authenticated" && Boolean(user?.id && orderId),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 30_000 : false,
  });
}

export function useCreatePaymentCheckout() {
  return useMutation({
    mutationFn: ({
      orderId,
      idempotencyKey,
    }: {
      orderId: string;
      idempotencyKey: string;
    }) => paymentsApi.createCheckout(orderId, idempotencyKey),
  });
}
