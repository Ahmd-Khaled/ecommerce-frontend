"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Headphones,
  PackageOpen,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatMajorMoney } from "@/utils/formatCurrency";
import { useHome } from "../hooks/use-home";
import { BannerCarousel } from "./banner-carousel";
import { ProductCard } from "./product-card";
import type {
  HomepageCategory,
  HomepageProduct,
} from "../types/home.types";

function CategoryTile({ category }: { category: HomepageCategory }) {
  return (
    <Link
      href={\`/categories/\${category.slug}\`}
      className="group flex w-[6.7rem] shrink-0 flex-col items-center gap-3 text-center sm:w-32"
    >
      <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.6rem] border border-border/70 bg-card shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            unoptimized
            sizes="128px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="text-2xl font-bold text-primary">
            {category.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="line-clamp-2 text-xs font-semibold leading-5 transition-colors group-hover:text-primary sm:text-sm">
        {category.name}
      </span>
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  viewAll,
  href,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  viewAll?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
          {eyebrow}
        </p>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-[1.75rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {viewAll && href ? (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-[11px] font-semibold transition hover:border-primary/40 hover:text-primary sm:px-4 sm:text-xs"
        >
          {viewAll}
          <ArrowRight className="size-3.5 rtl:rotate-180" />
        </Link>
      ) : null}
    </div>
  );
}

function ProductSection({
  title,
  eyebrow,
  description,
  products,
  currency,
  currencyExponent,
  locale,
  href,
}: {
  title: string;
  eyebrow: string;
  description: string;
  products: HomepageProduct[];
  currency: string;
  currencyExponent: number;
  locale: string;
  href?: string;
}) {
  const t = useTranslations("Home");
  const railRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === "ar";

  if (products.length === 0) return null;

  function scrollRail(direction: "previous" | "next") {
    const amount = direction === "next" ? 340 : -340;
    railRef.current?.scrollBy({
      left: isRtl ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        viewAll={t("viewAll")}
        href={href || "/products"}
      />
      <div className="relative">
        <div
          ref={railRef}
          dir={locale}
          className="home-product-rail flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-4 lg:gap-5"
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="w-[68vw] max-w-[17rem] shrink-0 snap-start sm:w-[42vw] sm:max-w-[18rem] md:w-[29vw] lg:w-[calc((100%-3.75rem)/4)]"
            >
              <ProductCard
                product={product}
                currency={currency}
                currencyExponent={currencyExponent}
                locale={locale}
              />
            </div>
          ))}
        </div>
        {products.length > 3 ? (
          <div className="absolute -top-[4.5rem] end-0 hidden items-center gap-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollRail("previous")}
              aria-label={t("previousProducts")}
              className="size-9 rounded-full bg-background"
            >
              {isRtl ? <ArrowRight /> : <ArrowLeft />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollRail("next")}
              aria-label={t("nextProducts")}
              className="size-9 rounded-full bg-background"
            >
              {isRtl ? <ArrowLeft /> : <ArrowRight />}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TrustStrip() {
  const t = useTranslations("Home");
  const items = [
    { icon: Truck, title: t("benefitShipping"), detail: t("benefitShippingText") },
    { icon: ShieldCheck, title: t("benefitSecure"), detail: t("benefitSecureText") },
    { icon: RefreshCw, title: t("benefitReturns"), detail: t("benefitReturnsText") },
    { icon: Headphones, title: t("benefitSupport"), detail: t("benefitSupportText") },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-4 sm:gap-4 sm:p-5">
      {items.map(({ icon: Icon, title, detail }) => (
        <div key={title} className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <Icon className="size-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold sm:text-sm">{title}</p>
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-muted-foreground sm:text-xs">
              {detail}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

function BestDeal({
  product,
  currency,
  currencyExponent,
  locale,
}: {
  product: HomepageProduct;
  currency: string;
  currencyExponent: number;
  locale: string;
}) {
  const t = useTranslations("Home");
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

function HomeSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="aspect-[5/5.2] w-full rounded-[1.75rem] sm:aspect-[16/7]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-2xl" />
        ))}
      </div>
      <section className="space-y-5">
        <Skeleton className="h-8 w-52" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-64 shrink-0 rounded-2xl" />
          ))}
        </div>
      </section>
    </main>
  );
}

export function HomeContent() {
  const locale = useLocale();
  const t = useTranslations("Home");
  const isMobile = useIsMobile();
  const { data, isLoading, isError, refetch, isFetching } = useHome(
    isMobile ? "mobile" : "desktop",
    locale,
  );

  if (isLoading) return <HomeSkeleton />;

  if (isError || !data) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-bold">{t("errorTitle")}</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {t("errorDescription")}
        </p>
        <Button className="mt-6" onClick={() => void refetch()} disabled={isFetching}>
          {t("retry")}
        </Button>
      </main>
    );
  }

  const hasStoreContent =
    data.banners.length > 0 ||
    data.categories.length > 0 ||
    data.latestProducts.length > 0 ||
    data.bestOffers.length > 0 ||
    data.bestSellers.length > 0 ||
    data.bestDeal !== null;

  return (
    <main id="home" className="mx-auto w-full max-w-[1440px] space-y-12 px-4 py-6 sm:space-y-16 sm:px-6 sm:py-9 lg:px-8">
      {!hasStoreContent ? (
        <section className="flex min-h-[45vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <PackageOpen className="size-8" />
          </span>
          <h1 className="mt-5 text-xl font-bold">{t("emptyTitle")}</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </section>
      ) : null}

      <BannerCarousel banners={data.banners} />

      <TrustStrip />

      {data.categories.length > 0 ? (
        <section id="categories" className="scroll-mt-24 space-y-5">
          <SectionHeading
            eyebrow={t("categoriesEyebrow")}
            title={t("categoriesTitle")}
            description={t("categoriesDescription")}
            viewAll={t("viewAll")}
            href="/categories"
          />
          <div
            dir={locale}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 sm:gap-6"
          >
            {data.categories.map((category) => (
              <div key={category._id} className="snap-start">
                <CategoryTile category={category} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {data.bestDeal ? (
        <BestDeal
          product={data.bestDeal}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
        />
      ) : null}

      <div id="products" className="scroll-mt-24 space-y-12 sm:space-y-16">
        <ProductSection
          eyebrow={t("latestEyebrow")}
          title={t("latestTitle")}
          description={t("latestDescription")}
          products={data.latestProducts}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
        />
        <ProductSection
          eyebrow={t("offersEyebrow")}
          title={t("offersTitle")}
          description={t("offersDescription")}
          products={data.bestOffers}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
        />
        <ProductSection
          eyebrow={t("bestSellersEyebrow")}
          title={t("bestSellersTitle")}
          description={t("bestSellersDescription")}
          products={data.bestSellers}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
        />
      </div>

      {data.banners.length > 1 ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {data.banners.slice(1, 3).map((banner, index) => {
            const promo = (
              <>
                <Image
                  src={banner.image}
                  alt={banner.altText || banner.title || t("bannerAlt")}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-transparent" />
                <div className="absolute inset-y-0 start-0 flex max-w-sm flex-col justify-center p-5 text-start text-white sm:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                    {t("bannerEyebrow")}
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-snug sm:text-2xl">
                    {banner.title || t("bannerTitle")}
                  </h3>
                  <span className="mt-4 text-xs font-semibold underline underline-offset-4">
                    {t("explore")}
                  </span>
                </div>
              </>
            );

            return (
              <div
                key={banner._id}
                className="group relative isolate aspect-[16/8] overflow-hidden rounded-2xl bg-slate-900"
              >
                {banner.linkUrl ? (
                  <a href={banner.linkUrl} className="absolute inset-0">
                    {promo}
                  </a>
                ) : (
                  promo
                )}
              </div>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}
