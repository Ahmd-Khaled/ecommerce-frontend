import { api } from "@/lib/api/axios";
import type {
  OrderPayment,
  PaymentEnvelope,
} from "@/features/payments/types/payment.types";

export const paymentsApi = {
  async createCheckout(orderId: string, idempotencyKey: string): Promise<OrderPayment> {
    const { data } = await api.post<PaymentEnvelope>(
      "/payments/checkout",
      { orderId },
      { headers: { "Idempotency-Key": idempotencyKey } },
    );

    if (!data?.success || !data.data?.orderId || !data.data.status) {
      throw new Error("The payment checkout response is invalid.");
    }

    return data.data;
  },

  async getOrderPayment(orderId: string): Promise<OrderPayment> {
    const { data } = await api.get<PaymentEnvelope>(
      `/payments/orders/${encodeURIComponent(orderId)}`,
    );

    if (!data?.success || !data.data?.orderId || !data.data.status) {
      throw new Error("The payment status response is invalid.");
    }

    return data.data;
  },
};
