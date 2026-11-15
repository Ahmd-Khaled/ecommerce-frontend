import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ProductsGrid } from "@/features/products/components/products-grid";
import { CategoryProductsFilters } from "@/features/categories/components/category-products-filters";
import { getCategoryBySlugData, getCategoryDetailPageData } from "@/features/categories/api/categories-page.server";
import type { CatalogSearchParams } from "@/features/products/api/catalog.server";

interface CategoryDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: Pick<CategoryDetailPageProps, "params">): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlugData(slug, locale);
  if (!category) return { title: locale === "ar" ? "الفئة غير موجودة" : "Category not found" };
  return {
    title: category.name,
    description: category.description || (locale === "ar"
      ? `تسوق منتجات ${category.name} واكتشف المجموعة المتاحة.`
      : `Shop ${data.category.name} products and explore the available collection.`),
  };
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryDetailPageProps) {
  const [{ locale, slug }, currentSearchParams] = await Promise.all([params, searchParams]);
  const [data, t, catalog] = await Promise.all([
    getCategoryDetailPageData(slug, locale, currentSearchParams),
    getTranslations({ locale, namespace: "Categories" }),
    getTranslations({ locale, namespace: "Catalog" }),
  ]);

  if (!data) notFound();

  const basePath = `/categories/${data.category.slug}`;
  const search = firstValue(currentSearchParams.search);
  const minPrice = firstValue(currentSearchParams.minPrice);
  const maxPrice = firstValue(currentSearchParams.maxPrice);
  const sortBy = firstValue(currentSearchParams.sortBy) ?? "createdAt";
  const sortOrder = firstValue(currentSearchParams.sortOrder) ?? "desc";
  const pagination = data.pagination;
  const invalidPriceRange = minPrice && maxPrice && Number(minPrice) > Number(maxPrice);

  function pageHref(page: number) {
    const query = new URLSearchParams();
    Object.entries(currentSearchParams).forEach(([key, value]) => {
      if (key === "page" || value === undefined) return;
      query.set(key, Array.isArray(value) ? value[0] : value);
    });
    query.set("page", String(page));
    return `${basePath}?${query.toString()}`;
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <nav aria-label={t("breadcrumbLabel")} className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="transition hover:text-foreground">{t("home")}</Link>
        <span aria-hidden="true">/</span>
        <Link href="/categories" className="transition hover:text-foreground">{t("title")}</Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-foreground">{data.category.name}</span>
      </nav>

      <header className="mb-7 border-b border-border/70 pb-6 sm:mb-8 sm:pb-8">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{t("categoryEyebrow")}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{data.category.name}</h1>
            {data.category.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{data.category.description}</p> : null}
          </div>
          <div className="rounded-xl bg-muted/60 px-3.5 py-2 text-sm">
            <span className="font-bold tabular-nums">{pagination.total}</span>
            <span className="ms-1.5 text-muted-foreground">{t("products")}</span>
          </div>
        </div>
        {data.category.children?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {data.category.children.map((child) => (
              <Link key={child._id} href={`/categories/${child.slug}`} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:border-primary/40 hover:text-primary">{child.name}</Link>
            ))}
          </div>
        ) : null}
      </header>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[280px_minmax(0,1fr)]">
        <CategoryProductsFilters basePath={basePath} values={{ search, minPrice, maxPrice, sortBy, sortOrder }}
          labels={{ filters: catalog("filters"), search: catalog("searchLabel"), searchPlaceholder: catalog("searchPlaceholder"),
            minPrice: catalog("minPrice"), maxPrice: catalog("maxPrice"), sortBy: catalog("sortBy"),
            newest: catalog("newest"), price: catalog("price"), name: catalog("name"), order: catalog("order"),
            ascending: catalog("ascending"), descending: catalog("descending"), apply: catalog("applyFilters"), reset: catalog("reset") }} />
        <section aria-label={data.category.name} className="min-w-0">
          {invalidPriceRange ? <p role="alert" className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">{catalog("invalidPriceRange")}</p> : null}
          <ProductsGrid products={data.products} currency={data.currency} currencyExponent={data.currencyExponent}
            locale={locale} emptyTitle={catalog("noProducts")} emptyDescription={catalog("noProductsDescription")}
            viewAllLabel={catalog("viewAllProducts")} />
          {pagination.totalPages > 1 ? (
            <nav aria-label={t("productPages")} className="mt-10 flex items-center justify-center gap-3">
              {pagination.hasPreviousPage ? <Button asChild variant="outline" className="rounded-xl"><Link href={pageHref(pagination.page - 1)}>{catalog("previous")}</Link></Button> : <Button variant="outline" className="rounded-xl" disabled>{catalog("previous")}</Button>}
              <span className="min-w-24 text-center text-sm text-muted-foreground">{catalog("page")} <strong className="text-foreground">{pagination.page}</strong> {catalog("of")} {pagination.totalPages}</span>
              {pagination.hasNextPage ? <Button asChild className="rounded-xl"><Link href={pageHref(pagination.page + 1)}>{catalog("next")}</Link></Button> : <Button className="rounded-xl" disabled>{catalog("next")}</Button>}
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
