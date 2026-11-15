import { api } from "@/lib/api/axios";
import type {
  AddCartItemPayload,
  CartEnvelope,
  CartResponse,
  UpdateCartItemPayload,
} from "@/features/cart/types/cart.types";

function readCart(data: CartEnvelope): CartResponse {
  if (!data?.success || !data.data) {
    throw new Error(data?.message || "The cart response is invalid.");
  }

  return data.data;
}

export const cartApi = {
  async getCart() {
    const response = await api.get<CartEnvelope>("/cart");
    return readCart(response.data);
  },

  async addItem(payload: AddCartItemPayload) {
    const response = await api.post<CartEnvelope>("/cart/items", payload);
    return readCart(response.data);
  },

  async updateItem({ productId, quantity }: UpdateCartItemPayload) {
    const response = await api.patch<CartEnvelope>(
      `/cart/items/${encodeURIComponent(productId)}`,
      { quantity },
    );
    return readCart(response.data);
  },

  async removeItem(productId: string) {
    const response = await api.delete<CartEnvelope>(
      `/cart/items/${encodeURIComponent(productId)}`,
    );
    return readCart(response.data);
  },

  async clearCart() {
    const response = await api.delete<CartEnvelope>("/cart/clear");
    return readCart(response.data);
  },
};
