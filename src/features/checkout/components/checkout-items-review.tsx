"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CartItem } from "@/features/cart/types/cart.types";
import { formatMinorMoney } from "@/utils/formatCurrency";

interface CheckoutItemsReviewProps {
  items: CartItem[];
  unavailableCount: number;
  locale: string;
  currency: string;
  currencyExponent: number;
}

export function CheckoutItemsReview({
  items,
  unavailableCount,
  locale,
  currency,
  currencyExponent,
}: CheckoutItemsReviewProps) {
  const t = useTranslations("Checkout");

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">{t("reviewItems")}</h2>
        <Link href="/cart" className="text-xs font-semibold text-primary hover:underline">
          {t("editCart")}
        </Link>
      </div>
      <div className="mt-4 divide-y divide-border">
        {items.map((item) => (
          <div key={item.product._id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold">
                {item.product.name ?? t("unavailableProduct")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("quantity")}: {item.quantity}
              </p>
              {!item.available ? (
                <p className="mt-1 text-xs font-medium text-destructive">{t("unavailable")}</p>
              ) : null}
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {typeof item.subtotalMinor === "number"
                ? formatMinorMoney(item.subtotalMinor, { locale, currency, currencyExponent })
                : "—"}
            </span>
          </div>
        ))}
      </div>
      {unavailableCount > 0 ? (
        <p className="mt-4 rounded-xl bg-destructive/5 p-3 text-xs leading-5 text-destructive">
          {t("unavailableNotice")}
        </p>
      ) : null}
    </section>
  );
}
