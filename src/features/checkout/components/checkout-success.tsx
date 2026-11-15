"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatMinorMoney } from "@/utils/formatCurrency";
import type { PlacedOrder } from "@/features/checkout/types/checkout.types";

interface CheckoutSuccessProps {
  order: PlacedOrder;
  locale: string;
  fallbackCurrency: string;
  fallbackExponent: number;
}

export function CheckoutSuccess({
  order,
  locale,
  fallbackCurrency,
  fallbackExponent,
}: CheckoutSuccessProps) {
  const t = useTranslations("Checkout");
  const total = order.grandTotalMinor ?? 0;
  const currency = order.currency ?? fallbackCurrency;
  const currencyExponent = order.currencyExponent ?? fallbackExponent;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[720px] items-center justify-center px-4 py-12">
      <section className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-9" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">{t("successTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("successDescription")}</p>
        <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-start">
          <p className="text-xs text-muted-foreground">{t("orderReference")}</p>
          <p className="mt-1 break-all font-mono text-sm font-semibold">{order._id}</p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">{t("orderTotal")}</span>
            <strong>{formatMinorMoney(total, { locale, currency, currencyExponent })}</strong>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-xl">
            <Link href="/products">{t("continueShopping")}</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/account">{t("myAccount")}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
