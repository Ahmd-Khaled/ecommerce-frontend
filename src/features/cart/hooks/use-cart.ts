"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/auth-context";
import { cartApi } from "@/features/cart/api/cart.api";
import type {
  AddCartItemPayload,
  CartResponse,
  UpdateCartItemPayload,
} from "@/features/cart/types/cart.types";

export const cartQueryKey = (customerId?: string) => ["cart", customerId] as const;

export function useCart() {
  const { user, status, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = cartQueryKey(user?.id);

  const cartQuery = useQuery({
    queryKey,
    queryFn: cartApi.getCart,
    enabled: status === "authenticated" && isAuthenticated,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  function updateCache(cart: CartResponse) {
    queryClient.setQueryData<CartResponse>(queryKey, (current) =>
      !current || cart.version >= current.version ? cart : current,
    );
  }

  const cancelCartQuery = () => queryClient.cancelQueries({ queryKey });
  const reconcileCart = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  const addItem = useMutation({
    mutationFn: (payload: AddCartItemPayload) => cartApi.addItem(payload),
    onMutate: cancelCartQuery,
    onSuccess: updateCache,
    onError: reconcileCart,
  });

  const updateItem = useMutation({
    mutationFn: (payload: UpdateCartItemPayload) => cartApi.updateItem(payload),
    onMutate: cancelCartQuery,
    onSuccess: updateCache,
    onError: reconcileCart,
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => cartApi.removeItem(productId),
    onMutate: cancelCartQuery,
    onSuccess: updateCache,
    onError: reconcileCart,
  });

  const clearCart = useMutation({
    mutationFn: cartApi.clearCart,
    onMutate: cancelCartQuery,
    onSuccess: updateCache,
    onError: reconcileCart,
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isFetching: cartQuery.isFetching,
    error: cartQuery.error,
    refetch: cartQuery.refetch,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    isMutating:
      addItem.isPending ||
      updateItem.isPending ||
      removeItem.isPending ||
      clearCart.isPending,
  };
}
