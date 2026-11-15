"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ClipboardList, LoaderCircle, PackageSearch, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { formatMinorMoney } from "@/utils/formatCurrency";

const PAGE_SIZE = 10;

export function OrdersPage() {
  const t = useTranslations("Orders");
  const locale = useLocale();
  const { user, status } = useAuth();
  const [page, setPage] = useState(1);
  const query = useOrders(page, PAGE_SIZE);
  const orders = query.data?.orders ?? [];
  const pagination = query.data?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const isArabic = locale === "ar";

  function money(amount?: number, currency?: string | null, exponent?: number) {
    if (typeof amount !== "number" || !currency) return t("notAvailable");
    return formatMinorMoney(amount, {
      locale,
      currency,
      currencyExponent: exponent ?? 2,
    });
  }

  if (status === "loading" || (status === "authenticated" && query.isLoading)) {
    return (
      <main className="mx-auto flex min-h-[55vh] w-full max-w-6xl items-center justify-center px-4">
        <LoaderCircle className="me-2 size-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{t("loading")}</span>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <ClipboardList className="size-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">{t("signInTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("signInDescription")}</p>
        <Button asChild className="mt-5 rounded-xl">
          <Link href="/login">{t("signIn")}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{t("description")}</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/account">{t("myAccount")}</Link>
        </Button>
      </div>

      {query.isError ? (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
          <PackageSearch className="size-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">{t("loadError")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("loadErrorDescription")}</p>
          <Button variant="outline" onClick={() => void query.refetch()} className="mt-5 rounded-xl">
            <RefreshCw className="size-4" /> {t("retry")}
          </Button>
        </section>
      ) : orders.length === 0 ? (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <ClipboardList className="size-11 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-bold">{t("emptyTitle")}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{t("emptyDescription")}</p>
          <Button asChild className="mt-5 rounded-xl">
            <Link href="/products">{t("shopNow")}</Link>
          </Button>
        </section>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => {
              const createdAt = new Date(order.createdAt);
              const statusKey = order.status.toLowerCase();
              const statusLabel = t.has(`status.${statusKey}`) ? t(`status.${statusKey}`) : order.status;
              return (
                <article key={order._id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("orderNumber")}</p>
                      <p className="mt-1 break-all text-sm font-bold">#{order._id}</p>
                    </div>
                    <OrderStatusBadge status={order.status} label={statusLabel} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/70 pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("orderDate")}</p>
                      <p className="mt-1 text-xs font-semibold">
                        {Number.isNaN(createdAt.getTime()) ? t("notAvailable") : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("items")}</p>
                      <p className="mt-1 text-xs font-semibold">{t("itemCount", { count: order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0 })}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] text-muted-foreground">{t("total")}</p>
                      <p className="mt-1 text-sm font-bold text-primary">{money(order.grandTotalMinor, order.currency, order.currencyExponent)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
                    <p className="text-xs text-muted-foreground">{t("lineSummary", { count: order.items?.length ?? 0 })}</p>
                    <Button asChild size="sm" className="h-9 rounded-xl">
                      <Link href={`/orders/${order._id}`}>
                        {t("viewDetails")}
                        {isArabic ? <ArrowLeft className="ms-1 size-3.5" /> : <ArrowRight className="ms-1 size-3.5" />}
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{t("pageOf", { page, total: totalPages })}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || query.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg">
                {isArabic ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
                {t("previous")}
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages || query.isFetching} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-lg">
                {t("next")}
                {isArabic ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
