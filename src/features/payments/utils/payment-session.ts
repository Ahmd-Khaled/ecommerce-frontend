import type { PaymentSession } from "@/features/payments/types/payment.types";

const PAYMENT_SESSION_STORAGE_KEY = "storefront:payment-session";

export function createPaymentIdempotencyKey() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function savePaymentSession(session: PaymentSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PAYMENT_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function readPaymentSession(): PaymentSession | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.sessionStorage.getItem(PAYMENT_SESSION_STORAGE_KEY);
    if (!value) return null;

    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("orderId" in parsed) ||
      !("idempotencyKey" in parsed) ||
      typeof parsed.orderId !== "string" ||
      typeof parsed.idempotencyKey !== "string"
    ) {
      return null;
    }

    return {
      orderId: parsed.orderId,
      idempotencyKey: parsed.idempotencyKey,
    };
  } catch {
    return null;
  }
}

export function clearPaymentSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PAYMENT_SESSION_STORAGE_KEY);
}
