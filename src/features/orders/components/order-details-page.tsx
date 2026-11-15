"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ClipboardList, CreditCard, LoaderCircle, MapPin, Package, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCancelOrder, useOrder } from "@/features/orders/hooks/use-orders";
import { useOrderPayment } from "@/features/payments/hooks/use-payment";
import { paymentsApi } from "@/features/payments/api/payments.api";
import { apiErrorMessage } from "@/lib/api/axios";
import { formatMinorMoney } from "@/utils/formatCurrency";
import type { OrderAddressSnapshot } from "@/features/orders/types/order.types";

function AddressDetails({ address, fallback }: { address?: OrderAddressSnapshot; fallback: string }) {
  if (!address) return <p className="text-sm text-muted-foreground">{fallback}</p>;
  const lines = [
    address.fullName,
    [address.street, address.building, address.apartment].filter(Boolean).join(", "),
    [address.city, address.country].filter(Boolean).join(", "),
    address.phone,
  ].filter(Boolean);
  return <div className="space-y-1 text-sm leading-6 text-muted-foreground">{lines.map((line, index) => <p key={index}>{line}</p>)}</div>;
}

export function OrderDetailsPage() {
  const t = useTranslations("Orders");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const { user, status } = useAuth();
  const orderId = params.orderId;
  const query = useOrder(orderId);
  const paymentQuery = useOrderPayment(orderId);
  const cancelOrder = useCancelOrder();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isResumingPayment, setIsResumingPayment] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const order = query.data;
  const exponent = order?.currencyExponent ?? 2;
  const currency = order?.currency ?? "EGP";

  function money(amount?: number) {
    if (typeof amount !== "number" || !order?.currency) return t("notAvailable");
    return formatMinorMoney(amount, { locale, currency, currencyExponent: exponent });
  }

  async function continuePayment() {
    if (isResumingPayment) return;

    setIsResumingPayment(true);
    try {
      // The backend retrieves the stored Stripe session and only creates a new one if it expired.
      const payment = await paymentsApi.createCheckout(orderId);

      if (payment.status === "pending" && payment.checkoutUrl) {
        window.location.assign(payment.checkoutUrl);
        return;
      }

      await paymentQuery.refetch();

      if (payment.status === "paid") {
        router.push("/payment/success");
        return;
      }

      toast.info(t("paymentStatusLabels.pending"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsResumingPayment(false);
    }
  }

  async function submitCancellation() {
    const trimmedReason = reason.trim();
    if (trimmedReason.length > 500) {
      setReasonError(t("reasonTooLong"));
      return;
    }
    setReasonError("");
    try {
      await cancelOrder.mutateAsync({
        orderId,
        payload: trimmedReason ? { reason: trimmedReason } : {},
      });
      toast.success(t("cancelSuccess"));
      setDialogOpen(false);
      setReason("");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  if (status === "loading" || (status === "authenticated" && query.isLoading)) {
    return <main className="flex min-h-[55vh] items-center justify-center px-4"><LoaderCircle className="me-2 size-5 animate-spin text-primary" />{t("loading")}</main>;
  }

  if (!user) {
    return <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center"><h1 className="text-2xl font-bold">{t("signInTitle")}</h1><Button asChild className="mt-5 rounded-xl"><Link href="/login">{t("signIn")}</Link></Button></main>;
  }

  if (query.isError || !order) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <Package className="size-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">{t("detailsError")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("detailsErrorDescription")}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={() => void query.refetch()} className="rounded-xl"><RefreshCw className="size-4" />{t("retry")}</Button>
          <Button asChild className="rounded-xl"><Link href="/orders">{t("backToOrders")}</Link></Button>
        </div>
      </main>
    );
  }

  const statusKey = order.status.toLowerCase();
  const statusLabels: Record<string, string> = { pending: t("status.pending"), confirmed: t("status.confirmed"), processing: t("status.processing"), shipped: t("status.shipped"), delivered: t("status.delivered"), cancelled: t("status.cancelled"), refunded: t("status.refunded") };
  const statusLabel = statusLabels[statusKey] ?? order.status;
  const address = order.shippingAddress ?? order.address;
  const paymentStatus = paymentQuery.data?.status ?? order.paymentStatus;
  const canRequestCancellation = !paymentQuery.isLoading && !paymentQuery.isError && !["cancelled", "refunded"].includes(statusKey) && !["pending", "paid"].includes(paymentStatus ?? "unpaid");
  const paymentStatusLabel = paymentStatus === "unpaid"
    ? t("paymentStatusLabels.unpaid")
    : paymentStatus === "paid"
    ? t("paymentStatusLabels.paid")
    : paymentStatus === "pending"
      ? t("paymentStatusLabels.pending")
      : paymentStatus === "expired"
        ? t("paymentStatusLabels.expired")
        : paymentStatus;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-5 -ms-3 rounded-xl text-muted-foreground">
        <Link href="/orders"><ArrowLeft className="size-4" />{t("backToOrders")}</Link>
      </Button>

      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t("detailsTitle")}</h1>
          <p className="mt-2 break-all text-sm text-muted-foreground">#{order._id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} label={statusLabel} />
          {["pending", "expired"].includes(paymentQuery.data?.status ?? "") ? <Button onClick={() => void continuePayment()} disabled={isResumingPayment || paymentQuery.isLoading} className="rounded-xl">{isResumingPayment ? <LoaderCircle className="size-4 animate-spin" /> : <CreditCard className="size-4" />}{t("continuePayment")}</Button> : null}
          {canRequestCancellation ? <Button variant="outline" onClick={() => setDialogOpen(true)} className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"><XCircle className="size-4" />{t("cancelOrder")}</Button> : null}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2"><Package className="size-4 text-primary" /><h2 className="font-bold">{t("orderItems")}</h2></div>
            <div className="divide-y divide-border">
              {order.items?.map((item, index) => (
                <div key={`${item.product}-${index}`} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.name || t("unnamedProduct")}</p>
                    {item.sku ? <p className="mt-1 text-xs text-muted-foreground">{t("sku")}: {item.sku}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">{t("quantity")}: {item.quantity}</p>
                    {typeof item.unitPriceMinor === "number" ? <p className="mt-1 text-xs text-muted-foreground">{t("unitPrice")}: {money(item.unitPriceMinor)}</p> : null}
                  </div>
                  <p className="shrink-0 text-sm font-bold">{money(item.lineTotalMinor)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2"><MapPin className="size-4 text-primary" /><h2 className="font-bold">{t("deliveryAddress")}</h2></div>
            <AddressDetails address={address} fallback={t("addressUnavailable")} />
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2"><ClipboardList className="size-4 text-primary" /><h2 className="font-bold">{t("summary")}</h2></div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t("subtotal")}</dt><dd className="font-semibold">{money(order.subtotalMinor)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t("shipping")}</dt><dd className="font-semibold">{money(order.shippingMinor)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t("discount")}</dt><dd className="font-semibold">{money(order.discountMinor)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t("tax")}</dt><dd className="font-semibold">{money(order.taxMinor)}</dd></div>
            <div className="flex justify-between gap-3 border-t border-border pt-3 text-base"><dt className="font-bold">{t("total")}</dt><dd className="font-extrabold text-primary">{money(order.grandTotalMinor)}</dd></div>
          </dl>
          <div className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
            <p>{t("orderDate")}: {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</p>
            {paymentStatus ? <p className="mt-2">{t("paymentStatus")}: {paymentStatusLabel}</p> : null}
          </div>
        </aside>
      </div>

      {dialogOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !cancelOrder.isPending) setDialogOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-order-title" className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl">
            <h2 id="cancel-order-title" className="text-lg font-bold">{t("cancelDialogTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("cancelDialogDescription")}</p>
            <label htmlFor="cancellation-reason" className="mt-5 block text-xs font-semibold">{t("cancellationReason")}</label>
            <textarea id="cancellation-reason" value={reason} onChange={(event) => { setReason(event.target.value); setReasonError(""); }} maxLength={500} rows={4} placeholder={t("reasonPlaceholder")} className="mt-2 w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>{reasonError}</span><span>{reason.length}/500</span></div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" disabled={cancelOrder.isPending} onClick={() => setDialogOpen(false)} className="rounded-xl">{t("keepOrder")}</Button>
              <Button variant="destructive" disabled={cancelOrder.isPending || reason.trim().length > 500} onClick={() => void submitCancellation()} className="rounded-xl">
                {cancelOrder.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                {t("confirmCancellation")}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
