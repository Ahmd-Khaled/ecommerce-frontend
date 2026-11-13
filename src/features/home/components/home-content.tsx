"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, ArrowLeft, ArrowRight, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatMajorMoney } from "@/utils/formatCurrency";
import { useHome } from "../hooks/use-home";
import type {
  HomepageBanner,
  HomepageCategory,
  HomepageProduct,
} from "../types/home.types";

function ProductCard({
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
  const image = product.images?.[0];

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
      <Link
        href={`/products/${product.slug}`}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 280px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <PackageOpen className="size-10" />
            </div>
          )}
          {product.discountPercentage ? (
            <span className="absolute start-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-semibold text-white">
              {Math.round(product.discountPercentage)}% {t("off")}
            </span>
          ) : null}
        </div>
        <div className="space-y-2 p-3.5 sm:p-4">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-card-foreground">
            {product.name}
          </h3>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm font-bold text-primary">
              {formatMajorMoney(product.price, {
                locale,
                currency,
                currencyExponent,
              })}
            </span>
            {product.compareAtPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatMajorMoney(product.compareAtPrice, {
                  locale,
                  currency,
                  currencyExponent,
                })}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

function CategoryCard({ category }: { category: HomepageCategory }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex min-w-0 flex-col items-center gap-3 rounded-2xl border border-border bg-card p-3 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:p-4"
    >
      <div className="relative size-20 overflow-hidden rounded-full bg-muted sm:size-24">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            unoptimized
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-2xl font-bold text-primary">
            {category.name.charAt(0)}
          </span>
        )}
      </div>
      <span className="line-clamp-2 text-xs font-semibold sm:text-sm">
        {category.name}
      </span>
    </Link>
  );
}

function Banner({ banner }: { banner: HomepageBanner }) {
  const t = useTranslations("Home");
  const content = (
    <>
      <Image
        src={banner.image}
        alt={banner.altText || banner.title || t("bannerAlt")}
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/30 to-transparent" />
      <div className="absolute inset-y-0 start-0 flex max-w-2xl flex-col justify-center p-6 text-white sm:p-10 lg:p-14">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          {t("bannerEyebrow")}
        </span>
        <h1 className="mt-3 max-w-xl text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {banner.title || t("bannerTitle")}
        </h1>
        <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
          {t("explore")}
          {banner.language === "ar" ? (
            <ArrowLeft className="size-4" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </span>
      </div>
    </>
  );

  return (
    <section className="relative isolate aspect-[5/4] overflow-hidden rounded-3xl bg-slate-900 sm:aspect-[16/6]">
      {banner.linkUrl ? (
        <a
          href={banner.linkUrl}
          className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          aria-label={banner.title || t("bannerAlt")}
        >
          {content}
        </a>
      ) : (
        <div className="absolute inset-0">{content}</div>
      )}
    </section>
  );
}

function ProductSection({
  title,
  products,
  currency,
  currencyExponent,
  locale,
  id,
}: {
  title: string;
  products: HomepageProduct[];
  currency: string;
  currencyExponent: number;
  locale: string;
  id?: string;
}) {
  const t = useTranslations("Home");

  if (products.length === 0) return null;

  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        <span className="text-xs font-medium text-muted-foreground">
          {products.length} {t("items")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            currency={currency}
            currencyExponent={currencyExponent}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

function HomeSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="aspect-[5/4] w-full rounded-3xl sm:aspect-[16/6]" />
      <section className="space-y-5">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <Skeleton className="size-20 rounded-full sm:size-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-5">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] rounded-2xl" />
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
    <main id="home" className="mx-auto w-full max-w-7xl space-y-12 px-4 py-7 sm:space-y-16 sm:px-6 sm:py-10 lg:px-8">
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
      {data.banners[0] ? <Banner banner={data.banners[0]} /> : null}

      {data.categories.length > 0 ? (
        <section id="categories" className="scroll-mt-24 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {t("categoriesTitle")}
            </h2>
            <Link
              href="/categories"
              className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
            {data.categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </section>
      ) : null}

      {data.bestDeal ? (
        <section className="grid gap-5 overflow-hidden rounded-3xl border border-primary/15 bg-primary/5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {t("bestDealEyebrow")}
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {data.bestDeal.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("dealPrice")}{" "}
              <strong className="text-primary">
                {formatMajorMoney(data.bestDeal.price, {
                  locale,
                  currency: data.currency,
                  currencyExponent: data.currencyExponent,
                })}
              </strong>
            </p>
            <Link
              href={`/products/${data.bestDeal.slug}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {t("shopDeal")}
              {locale === "ar" ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
            </Link>
          </div>
          <div className="relative aspect-square w-full max-w-44 justify-self-center overflow-hidden rounded-2xl bg-muted sm:w-44">
            {data.bestDeal.images[0] ? (
              <Image
                src={data.bestDeal.images[0]}
                alt={data.bestDeal.name}
                fill
                unoptimized
                sizes="176px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <PackageOpen className="size-10" />
              </div>
            )}
          </div>
        </section>
      ) : null}

      <div id="products" className="space-y-12 scroll-mt-24 sm:space-y-16">
        <ProductSection
          id="latest-products"
          title={t("latestTitle")}
          products={data.latestProducts}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
        />
        <ProductSection
          title={t("offersTitle")}
          products={data.bestOffers}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
        />
        <ProductSection
          title={t("bestSellersTitle")}
          products={data.bestSellers}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
        />
      </div>

      {data.banners.length > 1 ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {data.banners.slice(1, 3).map((banner) => (
            <div key={banner._id} className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={banner.image}
                alt={banner.altText || banner.title || t("bannerAlt")}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </section>
      ) : null}
    </main>
  );
}
