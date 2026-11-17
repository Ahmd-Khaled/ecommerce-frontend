export type PaymentStatus = "unpaid" | "pending" | "paid" | "expired" | (string & {});

export interface OrderPayment {
  orderId: string;
  status: PaymentStatus;
  amountMinor: number;
  currency: string;
  checkoutUrl: string | null;
  paidAt: string | null;
}

export interface PaymentEnvelope {
  success: boolean;
  data: OrderPayment;
}

export interface PaymentSession {
  orderId: string;
  idempotencyKey: string;
}
