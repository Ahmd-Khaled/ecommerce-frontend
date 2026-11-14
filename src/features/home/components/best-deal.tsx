import Image from "next/image";
import { ArrowLeft, ArrowRight, BadgeCheck, PackageOpen } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatMajorMoney } from "@/utils/formatCurrency";
import type { HomepageProduct } from "../types/home.types";

interface BestDealProps {
  product: HomepageProduct;
  currency: string;
  currencyExponent: number;
}

export async function BestDeal({
  product,
  currency,
  currencyExponent,
}: BestDealProps) {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const isRtl = locale === "ar";

  return (
    <section className="relative isolate grid overflow-hidden rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/[0.11] via-primary/[0.045] to-card sm:grid-cols-[1.2fr_0.8fr]">
      <div className="relative z-10 flex flex-col items-start justify-center p-6 sm:p-9 lg:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-primary sm:text-xs">
          <BadgeCheck className="size-3.5" />
          {t("bestDealEyebrow")}
        </span>

        <h2 className="mt-4 max-w-xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          {product.name}
        </h2>

        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          {t("dealPrice")}
        </p>

        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <span className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {formatMajorMoney(product.price, {
              locale,
              currency,
              currencyExponent,
            })}
          </span>
          {product.compareAtPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatMajorMoney(product.compareAtPrice, {
                locale,
                currency,
                currencyExponent,
              })}
            </span>
          ) : null}
        </div>

        <Link
          href={\`/products/\${product.slug}\`}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:text-sm"
        >
          {t("shopDeal")}
          {isRtl ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
        </Link>
      </div>

      <div className="relative min-h-52 overflow-hidden sm:min-h-[22rem]">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary/[0.06]" />
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 45vw"
            className="object-contain p-5 transition-transform duration-700 hover:scale-105 sm:p-8"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/40">
            <PackageOpen className="size-20" strokeWidth={1} />
          </div>
        )}
      </div>
    </section>
  );
}
