import { getTranslations } from "next-intl/server";
import {
  Headphones,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";

export async function TrustStrip() {
  const t = await getTranslations("Home");

  const items = [
    {
      icon: Truck,
      title: t("benefitShipping"),
      detail: t("benefitShippingText"),
    },
    {
      icon: ShieldCheck,
      title: t("benefitSecure"),
      detail: t("benefitSecureText"),
    },
    {
      icon: RefreshCw,
      title: t("benefitReturns"),
      detail: t("benefitReturnsText"),
    },
    {
      icon: Headphones,
      title: t("benefitSupport"),
      detail: t("benefitSupportText"),
    },
  ];

  return (
    <section
      aria-label={t("shoppingBenefits")}
      className="grid grid-cols-2 gap-2.5 rounded-2xl border border-border/70 bg-card p-3 sm:gap-4 sm:p-5 md:grid-cols-4"
    >
      {items.map(({ icon: Icon, title, detail }) => (
        <div
          key={title}
          className="flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-2 sm:gap-3 sm:px-2"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-11">
            <Icon className="size-[18px] sm:size-5" strokeWidth={1.8} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold leading-4 sm:text-sm sm:leading-5">
              {title}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[9px] leading-4 text-muted-foreground sm:text-xs">
              {detail}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
