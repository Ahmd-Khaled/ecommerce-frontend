import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ProductsFilters } from "@/features/products/components/products-filters";
import { ProductsGrid } from "@/features/products/components/products-grid";
import { ProductsHeader } from "@/features/products/components/products-header";
import { ProductsPagination } from "@/features/products/components/products-pagination";
import { getProductCatalogPageData } from "@/features/products/api/catalog.server";
import type { CatalogSearchParams } from "@/features/products/api/catalog.server";

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({ params }: Pick<ProductsPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "جميع المنتجات" : "All products",
    description: locale === "ar"
      ? "تصفح جميع المنتجات واكتشف أحدث الإضافات والعروض."
      : "Browse our products and discover the latest arrivals and offers.",
  };
}

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const [{ locale }, currentSearchParams] = await Promise.all([params, searchParams]);
  const [data, t] = await Promise.all([
    getProductCatalogPageData(locale, currentSearchParams),
    getTranslations({ locale, namespace: "Catalog" }),
  ]);

  if (!data) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="mb-3 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">{t("connectionIssue")}</span>
        <h1 className="text-2xl font-bold tracking-tight">{t("loadError")}</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("loadErrorDescription")}</p>
        <Button asChild className="mt-6 rounded-xl"><Link href="/">{t("backHome")}</Link></Button>
      </section>
    );
  }

  const search = firstSearchValue(currentSearchParams.search);
  const minPrice = firstSearchValue(currentSearchParams.minPrice);
  const maxPrice = firstSearchValue(currentSearchParams.maxPrice);
  const invalidPriceRange = minPrice !== undefined && minPrice.trim() !== "" &&
    maxPrice !== undefined && maxPrice.trim() !== "" && Number(minPrice) > Number(maxPrice);
  const sortBy = firstSearchValue(currentSearchParams.sortBy) ?? "createdAt";
  const sortOrder = firstSearchValue(currentSearchParams.sortOrder) ?? "desc";

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <ProductsHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")}
        productCount={data.pagination.total} productCountLabel={t("productCountLabel")} />
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[280px_minmax(0,1fr)]">
        <ProductsFilters locale={locale} maxPriceLimit={data.maxCatalogPrice}
          values={{ search, minPrice, maxPrice, sortBy, sortOrder }}
          labels={{
            filters: t("filters"), searchLabel: t("searchLabel"), searchPlaceholder: t("searchPlaceholder"),
            minPrice: t("minPrice"), maxPrice: t("maxPrice"), sortBy: t("sortBy"),
            newest: t("newest"), price: t("price"), name: t("name"), order: t("order"),
            descending: t("descending"), ascending: t("ascending"), applyFilters: t("applyFilters"),
            reset: t("reset"), closeFilters: t("closeFilters"),
          }} />
        <section aria-label={t("title")} className="min-w-0">
          {invalidPriceRange ? (
            <p role="alert" className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">{t("invalidPriceRange")}</p>
          ) : null}
          <ProductsGrid products={data.products} currency={data.currency}
            currencyExponent={data.currencyExponent} locale={locale}
            emptyTitle={t("noProducts")} emptyDescription={t("noProductsDescription")}
            viewAllLabel={t("viewAllProducts")} />
          <ProductsPagination pagination={data.pagination} searchParams={currentSearchParams}
            labels={{
              previous: t("previous"), next: t("next"), page: t("page"), of: t("of"),
              ariaLabel: locale === "ar" ? "صفحات المنتجات" : "Product pages",
            }} />
        </section>
      </div>
    </main>
  );
}
