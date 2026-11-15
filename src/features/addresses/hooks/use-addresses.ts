"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressApi } from "@/features/addresses/api/address.api";
import type { AddressPayload } from "@/features/addresses/types/address.types";

export const addressesQueryKey = (customerId?: string) =>
  ["customer-addresses", customerId] as const;

export function useAddresses(customerId?: string) {
  const queryClient = useQueryClient();
  const queryKey = addressesQueryKey(customerId);

  const query = useQuery({
    queryKey,
    queryFn: addressApi.list,
    enabled: Boolean(customerId),
    staleTime: 30_000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const create = useMutation({
    mutationFn: (payload: AddressPayload) => addressApi.create(payload),
    onSuccess: refresh,
  });

  const update = useMutation({
    mutationFn: ({
      addressId,
      payload,
    }: {
      addressId: string;
      payload: Partial<AddressPayload>;
    }) => addressApi.update(addressId, payload),
    onSuccess: refresh,
  });

  const setDefault = useMutation({
    mutationFn: (addressId: string) => addressApi.setDefault(addressId),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (addressId: string) => addressApi.remove(addressId),
    onSuccess: refresh,
  });

  return {
    addresses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create,
    update,
    setDefault,
    remove,
    isMutating:
      create.isPending ||
      update.isPending ||
      setDefault.isPending ||
      remove.isPending,
  };
}
