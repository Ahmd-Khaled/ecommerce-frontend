"use client";

import { useTranslations } from "next-intl";
import { LoaderCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMinorMoney } from "@/utils/formatCurrency";

interface CheckoutSummaryProps {
  locale: string;
  currency: string;
  currencyExponent: number;
  subtotalMinor: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  hasAddresses: boolean;
  onSubmit: () => void;
}

export function CheckoutSummary({
  locale,
  currency,
  currencyExponent,
  subtotalMinor,
  canSubmit,
  isSubmitting,
  hasAddresses,
  onSubmit,
}: CheckoutSummaryProps) {
  const t = useTranslations("Checkout");
  const moneyOptions = { locale, currency, currencyExponent };

  return (
    <aside className="rounded-2xl border border-border/80 bg-card p-5 lg:sticky lg:top-28">
      <h2 className="text-base font-bold">{t("summary")}</h2>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span className="font-semibold tabular-nums">{formatMinorMoney(subtotalMinor, moneyOptions)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">{t("shipping")}</span>
          <span className="font-semibold tabular-nums">{formatMinorMoney(0, moneyOptions)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">{t("discount")}</span>
          <span className="font-semibold tabular-nums">{formatMinorMoney(0, moneyOptions)}</span>
        </div>
        <div className="flex justify-between gap-3 border-t border-border pt-3 text-base">
          <span className="font-bold">{t("total")}</span>
          <span className="font-bold tabular-nums">{formatMinorMoney(subtotalMinor, moneyOptions)}</span>
        </div>
      </div>
      <p className="mt-4 text-[11px] leading-5 text-muted-foreground">{t("feesNote")}</p>
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-[11px] leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        {t("priceConfirmationNote")}
      </div>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mt-5 h-11 w-full rounded-xl font-semibold"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {isSubmitting ? t("placingOrder") : t("confirmOrder")}
      </Button>
      {!hasAddresses ? (
        <p className="mt-2 text-center text-xs text-destructive">{t("selectAddress")}</p>
      ) : null}
    </aside>
  );
}
