import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductsGrid } from "@/features/products/components/products-grid";
import { ProductsPagination } from "@/features/products/components/products-pagination";
import { getProductCatalogPageData } from "@/features/products/api/catalog.server";
import type { CatalogSearchParams } from "@/features/products/api/catalog.server";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: Pick<SearchPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "البحث عن المنتجات" : "Search products",
    description: locale === "ar"
      ? "ابحث في المنتجات المتاحة واعثر على ما تحتاجه."
      : "Search the available products and find what you need.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const [{ locale }, currentParams] = await Promise.all([params, searchParams]);
  const query = (firstValue(currentParams.q) ?? "").trim().slice(0, 150);
  const [data, t] = await Promise.all([
    query
      ? getProductCatalogPageData(locale, {
          search: query,
          page: firstValue(currentParams.page),
        })
      : Promise.resolve(null),
    getTranslations({ locale, namespace: "Search" }),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{t("eyebrow")}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">{t("description")}</p>
        <form action={`/${locale}/search`} method="get" role="search" className="mx-auto mt-6 flex max-w-2xl gap-2">
          <label htmlFor="store-search" className="sr-only">{t("inputLabel")}</label>
          <div className="relative min-w-0 flex-1">
            <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="store-search"
              type="search"
              name="q"
              defaultValue={query}
              maxLength={150}
              placeholder={t("placeholder")}
              className="h-12 rounded-xl ps-10"
            />
          </div>
          <Button type="submit" className="h-12 rounded-xl px-5">{t("submit")}</Button>
        </form>
      </header>

      {!query ? (
        <section className="mx-auto flex min-h-64 max-w-2xl flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
          <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Search aria-hidden="true" className="size-6" />
          </span>
          <h2 className="text-lg font-bold">{t("startTitle")}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("startDescription")}</p>
        </section>
      ) : !data ? (
        <section className="mx-auto flex min-h-64 max-w-2xl flex-col items-center justify-center rounded-2xl border border-border bg-card px-5 py-12 text-center">
          <h2 className="text-lg font-bold">{t("errorTitle")}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("errorDescription")}</p>
        </section>
      ) : (
        <section aria-labelledby="search-results-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4">
            <div className="min-w-0">
              <h2 id="search-results-title" className="text-xl font-bold tracking-tight">{t("resultsTitle")}</h2>
              <p className="mt-1 break-words text-sm text-muted-foreground">
                {t("queryLabel", { query })}
              </p>
            </div>
            <p className="rounded-xl bg-muted/60 px-3.5 py-2 text-sm text-muted-foreground">
              <strong className="text-foreground">{data.pagination.total}</strong> {t("resultCount")}
            </p>
          </div>
          <ProductsGrid
            products={data.products}
            currency={data.currency}
            currencyExponent={data.currencyExponent}
            locale={locale}
            emptyTitle={t("noResultsTitle")}
            emptyDescription={t("noResultsDescription")}
            viewAllLabel={t("viewAll")}
          />
          <ProductsPagination
            pagination={data.pagination}
            searchParams={{ q: query }}
            basePath="/search"
            labels={{
              previous: t("previous"),
              next: t("next"),
              page: t("page"),
              of: t("of"),
              ariaLabel: t("paginationLabel"),
            }}
          />
        </section>
      )}
    </main>
  );
}
