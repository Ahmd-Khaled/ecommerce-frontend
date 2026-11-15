"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, CircleAlert, Clock3, LoaderCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { useOrderPayment, useCreatePaymentCheckout } from "@/features/payments/hooks/use-payment";
import {
  clearPaymentSession,
  readPaymentSession,
} from "@/features/payments/utils/payment-session";
import type { PaymentSession } from "@/features/payments/types/payment.types";
import { formatMinorMoney } from "@/utils/formatCurrency";
import { apiErrorMessage } from "@/lib/api/axios";

interface PaymentReturnPageProps {
  outcome: "success" | "cancelled";
}

export function PaymentReturnPage({ outcome }: PaymentReturnPageProps) {
  const t = useTranslations("Payment");
  const locale = useLocale();
  const { user, status: authStatus } = useAuth();
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [retryError, setRetryError] = useState("");
  const paymentQuery = useOrderPayment(session?.orderId ?? "");
  const createCheckout = useCreatePaymentCheckout();

  useEffect(() => {
    setSession(readPaymentSession());
    setSessionLoaded(true);
  }, []);

  const payment = paymentQuery.data;

  useEffect(() => {
    if (payment?.status === "paid" || payment?.status === "expired") {
      clearPaymentSession();
    }
  }, [payment?.status]);

  async function continuePayment() {
    if (!session || createCheckout.isPending) return;

    setRetryError("");
    try {
      const result = await createCheckout.mutateAsync({
        orderId: session.orderId,
        idempotencyKey: session.idempotencyKey,
      });

      if (result.status === "pending" && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }

      await paymentQuery.refetch();
    } catch (error) {
      setRetryError(apiErrorMessage(error));
    }
  }

  if (!sessionLoaded || authStatus === "loading") {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center gap-3 px-4 text-sm text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        {t("loading")}
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <CircleAlert className="size-11 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">{t("sessionMissingTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("sessionMissingDescription")}</p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/orders">{t("viewOrders")}</Link>
        </Button>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">{t("signInTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("signInDescription")}</p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/login">{t("signIn")}</Link>
        </Button>
      </main>
    );
  }

  if (paymentQuery.isLoading && !payment) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center gap-3 px-4 text-sm text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        {t("checking")}
      </main>
    );
  }

  const paid = payment?.status === "paid";
  const expired = payment?.status === "expired";
  const pending = payment?.status === "pending";
  const paymentStatusLabel = payment?.status === "unpaid"
    ? t("status.unpaid")
    : payment?.status === "paid"
      ? t("status.paid")
      : payment?.status === "pending"
        ? t("status.pending")
        : payment?.status === "expired"
          ? t("status.expired")
          : payment?.status ?? "";
  const title = paid
    ? t("paidTitle")
    : expired
      ? t("expiredTitle")
      : outcome === "cancelled"
        ? t("cancelledTitle")
        : t("pendingTitle");
  const description = paid
    ? t("paidDescription")
    : expired
      ? t("expiredDescription")
      : outcome === "cancelled"
        ? t("cancelledDescription")
        : t("pendingDescription");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[720px] items-center justify-center px-4 py-12">
      <section className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
        <span className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${paid ? "bg-emerald-500/10 text-emerald-600" : expired ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"}`}>
          {paid ? <CheckCircle2 className="size-9" /> : expired ? <CircleAlert className="size-9" /> : <Clock3 className="size-9" />}
        </span>
        <h1 className="mt-5 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>

        {payment ? (
          <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-start">
            <p className="text-xs text-muted-foreground">{t("orderReference")}</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold">{payment.orderId}</p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">{t("amount")}</span>
              <strong>{formatMinorMoney(payment.amountMinor, { locale, currency: payment.currency, currencyExponent: 2 })}</strong>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{t("status")}</span>
              <strong>{paymentStatusLabel}</strong>
            </div>
          </div>
        ) : paymentQuery.isError ? (
          <p className="mt-5 text-sm text-destructive">{apiErrorMessage(paymentQuery.error)}</p>
        ) : null}

        {retryError ? <p className="mt-4 text-sm text-destructive">{retryError}</p> : null}

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          {pending && payment?.checkoutUrl && outcome === "cancelled" ? (
            <Button onClick={() => window.location.assign(payment.checkoutUrl!)} className="rounded-xl">
              {t("continuePayment")}
            </Button>
          ) : null}
          {pending && !payment?.checkoutUrl && session ? (
            <Button onClick={() => void continuePayment()} disabled={createCheckout.isPending} className="rounded-xl">
              {createCheckout.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {t("retryPayment")}
            </Button>
          ) : null}
          {paymentQuery.isError ? (
            <Button variant="outline" onClick={() => void paymentQuery.refetch()} className="rounded-xl">
              <RefreshCw className="size-4" />
              {t("retryVerification")}
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/orders">{t("viewOrders")}</Link>
          </Button>
        </div>
        {pending ? <p className="mt-4 text-xs text-muted-foreground">{t("automaticVerification")}</p> : null}
      </section>
    </main>
  );
}
