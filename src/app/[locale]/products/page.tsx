import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { CatalogFilters } from "@/features/products/components/catalog-filters";
import { getProductCatalogPageData } from "@/features/products/api/catalog.server";
import type { CatalogSearchParams } from "@/features/products/api/catalog.server";

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({
  params,
}: Pick<ProductsPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "ar" ? "جميع المنتجات" : "All products",
    description:
      locale === "ar"
        ? "تصفح جميع المنتجات واكتشف أحدث الإضافات والعروض."
        : "Browse our products and discover the latest arrivals and offers.",
  };
}

function buildPageHref(
  searchParams: CatalogSearchParams,
  page: number,
) {
  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "page" || value === undefined) return;
    query.set(key, Array.isArray(value) ? value[0] : value);
  });

  query.set("page", String(page));
  return `/products?${query.toString()}`;
}

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const [{ locale }, currentSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const data = await getProductCatalogPageData(locale, currentSearchParams);
  const isArabic = locale === "ar";
  const t = await getTranslations({ locale, namespace: "Catalog" });

  if (!data) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="mb-3 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
          {t("connectionIssue")}
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{t("loadError")}</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {t("loadErrorDescription")}
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </section>
    );
  }

  const { products, pagination, currency, currencyExponent } = data;
  const search = firstSearchValue(currentSearchParams.search);
  const minPrice = firstSearchValue(currentSearchParams.minPrice);
  const maxPrice = firstSearchValue(currentSearchParams.maxPrice);
  const invalidPriceRange =
    minPrice !== undefined &&
    minPrice.trim() !== "" &&
    maxPrice !== undefined &&
    maxPrice.trim() !== "" &&
    Number(minPrice) > Number(maxPrice);
  const sortBy = firstSearchValue(currentSearchParams.sortBy) ?? "createdAt";
  const sortOrder = firstSearchValue(currentSearchParams.sortOrder) ?? "desc";

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-7 border-b border-border/70 pb-6 sm:mb-8 sm:pb-8">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          {t("eyebrow")}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              {t("description")}
            </p>
          </div>
          <div className="rounded-xl bg-muted/60 px-3.5 py-2 text-sm">
            <span className="font-bold tabular-nums text-foreground">{pagination.total}</span>
            <span className="ms-1.5 text-muted-foreground">{t("productCountLabel")}</span>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[280px_minmax(0,1fr)]">
        <CatalogFilters
          locale={locale}
          values={{ search, minPrice, maxPrice, sortBy, sortOrder }}
          labels={{
            filters: t("filters"),
            searchLabel: t("searchLabel"),
            searchPlaceholder: t("searchPlaceholder"),
            minPrice: t("minPrice"),
            maxPrice: t("maxPrice"),
            sortBy: t("sortBy"),
            newest: t("newest"),
            price: t("price"),
            name: t("name"),
            order: t("order"),
            descending: t("descending"),
            ascending: t("ascending"),
            applyFilters: t("applyFilters"),
            reset: t("reset"),
            closeFilters: t("closeFilters"),
          }}
        />

        <section aria-label={t("title")} className="min-w-0">
          {invalidPriceRange ? (
            <p role="alert" className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
              {t("invalidPriceRange")}
            </p>
          ) : null}

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5">
              {products.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  currency={currency}
                  currencyExponent={currencyExponent}
                  locale={locale}
                  priority={index === 0}
                />
              ))}
            </div>
          ) : (
            <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
              <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <span className="text-2xl" aria-hidden="true">⌕</span>
              </span>
              <h2 className="text-lg font-bold">{t("noProducts")}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {t("noProductsDescription")}
              </p>
              <Button asChild variant="outline" className="mt-5 rounded-xl">
                <Link href="/products">{t("viewAllProducts")}</Link>
              </Button>
            </section>
          )}

          {pagination.totalPages > 1 ? (
            <nav
              aria-label={isArabic ? "صفحات المنتجات" : "Product pages"}
              className="mt-10 flex items-center justify-center gap-3"
            >
              {pagination.hasPreviousPage ? (
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href={buildPageHref(currentSearchParams, pagination.page - 1)}>
                    {t("previous")}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" className="rounded-xl" disabled>
                  {t("previous")}
                </Button>
              )}
              <span className="min-w-24 text-center text-sm text-muted-foreground">
                {t("page")}{" "}
                <strong className="text-foreground">{pagination.page}</strong>{" "}
                {t("of")} {pagination.totalPages}
              </span>
              {pagination.hasNextPage ? (
                <Button asChild className="rounded-xl">
                  <Link href={buildPageHref(currentSearchParams, pagination.page + 1)}>
                    {t("next")}
                  </Link>
                </Button>
              ) : (
                <Button className="rounded-xl" disabled>
                  {t("next")}
                </Button>
              )}
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
