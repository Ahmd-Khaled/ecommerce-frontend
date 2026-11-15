import { api } from "@/lib/api/axios";
import type {
  AddressEnvelope,
  AddressPayload,
  CustomerAddress,
} from "@/features/addresses/types/address.types";

export const addressApi = {
  async list() {
    const { data } = await api.get<AddressEnvelope<CustomerAddress[]>>("/addresses");
    return data.data;
  },

  async create(payload: AddressPayload) {
    const { data } = await api.post<AddressEnvelope<CustomerAddress>>(
      "/addresses",
      payload,
    );
    return data.data;
  },

  async update(addressId: string, payload: Partial<AddressPayload>) {
    const { data } = await api.patch<AddressEnvelope<CustomerAddress>>(
      `/addresses/${encodeURIComponent(addressId)}`,
      payload,
    );
    return data.data;
  },

  async setDefault(addressId: string) {
    const { data } = await api.patch<AddressEnvelope<CustomerAddress>>(
      `/addresses/${encodeURIComponent(addressId)}/default`,
      {},
    );
    return data.data;
  },

  async remove(addressId: string) {
    const { data } = await api.delete<AddressEnvelope<CustomerAddress[]>>(
      `/addresses/${encodeURIComponent(addressId)}`,
    );
    return data.data;
  },
};
