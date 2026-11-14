import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PackageCheck, PackageX } from "lucide-react";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { ProductPurchasePanel } from "@/features/products/components/product-purchase-panel";
import {
  getProductBySlug,
  getProductDetailsPageData,
} from "@/features/products/api/product-details.server";
import { formatMajorMoney } from "@/utils/formatCurrency";

interface ProductDetailsPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return {
      title: locale === "ar" ? "المنتج غير موجود" : "Product not found",
    };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) ??
      (locale === "ar" ? "تفاصيل المنتج" : "Product details"),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { locale, slug } = await params;
  const [data, t] = await Promise.all([
    getProductDetailsPageData(slug, locale),
    getTranslations({ locale, namespace: "ProductDetails" }),
  ]);

  if (!data) notFound();

  const { product, currency, currencyExponent } = data;
  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : undefined;
  const price = formatMajorMoney(product.price, {
    locale,
    currency,
    currencyExponent,
  });
  const comparePrice =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price
      ? formatMajorMoney(product.compareAtPrice, {
          locale,
          currency,
          currencyExponent,
        })
      : null;
  const discountPercentage = comparePrice
    ? Math.round(
        ((product.compareAtPrice! - product.price) /
          product.compareAtPrice!) *
          100,
      )
    : 0;
  const isAvailable = product.stock > 0;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <nav
        aria-label={t("breadcrumbLabel")}
        className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          {t("home")}
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href="/products"
          className="transition-colors hover:text-foreground"
        >
          {t("allProducts")}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="max-w-[55vw] truncate font-medium text-foreground">
          {product.name}
        </span>
      </nav>

      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={product.images ?? []}
          productName={product.name}
          labels={{
            imageAlt: t("productImages"),
            previousImage: t("previousImage"),
            nextImage: t("nextImage"),
            imageNumber: t("imageNumber"),
          }}
        />

        <section className="min-w-0 lg:py-2">
          <div className="flex flex-wrap items-center gap-2">
            {categoryName ? (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                {categoryName}
              </span>
            ) : null}
            {discountPercentage > 0 ? (
              <span className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold text-white">
                {t("discount", { percentage: discountPercentage })}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {price}
            </span>
            {comparePrice ? (
              <span className="text-base text-muted-foreground line-through">
                {comparePrice}
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-card p-4">
            <div className="min-w-0">
              <span className="block text-[10px] font-medium text-muted-foreground">
                {t("sku")}
              </span>
              <span className="mt-1 block truncate text-xs font-semibold tabular-nums">
                {product.sku}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-medium text-muted-foreground">
                {t("availability")}
              </span>
              <span
                className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${isAvailable ? "text-emerald-600" : "text-destructive"}`}
              >
                {isAvailable ? (
                  <PackageCheck className="size-4" />
                ) : (
                  <PackageX className="size-4" />
                )}
                {isAvailable ? t("inStock") : t("outOfStock")}
              </span>
            </div>
          </div>

          {product.description ? (
            <div className="mt-7">
              <h2 className="text-sm font-bold">{t("description")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {product.description}
              </p>
            </div>
          ) : null}

          <div className="mt-7">
            <ProductPurchasePanel
              locale={locale}
              stock={product.stock}
              labels={{
                quantity: t("quantity"),
                decreaseQuantity: t("decreaseQuantity"),
                increaseQuantity: t("increaseQuantity"),
                addToCart: t("addToCart"),
                buyNow: t("buyNow"),
                cartComingSoon: t("cartComingSoon"),
                checkoutComingSoon: t("checkoutComingSoon"),
                unavailable: t("outOfStock"),
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
