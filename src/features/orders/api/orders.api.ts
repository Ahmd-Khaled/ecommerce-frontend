import { api } from "@/lib/api/axios";
import type {
  CancelOrderPayload,
  CustomerOrder,
  OrderEnvelope,
  OrdersListEnvelope,
} from "@/features/orders/types/order.types";

export const ordersApi = {
  async list(page = 1, limit = 10) {
    const { data } = await api.get<OrdersListEnvelope>("/orders", {
      params: { page, limit },
    });

    if (!data?.success || !Array.isArray(data.data?.orders)) {
      throw new Error("The orders list response is invalid.");
    }

    return data.data;
  },

  async getById(orderId: string) {
    const { data } = await api.get<OrderEnvelope>(
      `/orders/${encodeURIComponent(orderId)}`,
    );

    if (!data?.success || !data.data?._id) {
      throw new Error("The order details response is invalid.");
    }

    return data.data;
  },

  async cancel(orderId: string, payload: CancelOrderPayload = {}) {
    const { data } = await api.patch<OrderEnvelope>(
      `/orders/${encodeURIComponent(orderId)}/cancel`,
      payload,
    );

    if (!data?.success || !data.data?._id) {
      throw new Error("The order cancellation response is invalid.");
    }

    return data.data;
  },
};

export type { CustomerOrder };
