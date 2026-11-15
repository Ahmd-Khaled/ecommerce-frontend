import { api } from "@/lib/api/axios";
import type {
  CheckoutEnvelope,
  CheckoutPayload,
} from "@/features/checkout/types/checkout.types";

export const checkoutApi = {
  async placeOrder(payload: CheckoutPayload, idempotencyKey: string) {
    const { data } = await api.post<CheckoutEnvelope>(
      "/orders/checkout",
      payload,
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      },
    );

    if (!data?.success || !data.data?._id) {
      throw new Error(data?.message || "The checkout response is invalid.");
    }

    return data;
  },
};
