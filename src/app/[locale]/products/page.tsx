import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
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

  if (!data) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="mb-3 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
          {isArabic ? "تعذر الاتصال بالمتجر" : "Store connection issue"}
        </span>
        <h1 className="text-2xl font-bold tracking-tight">
          {isArabic ? "تعذر تحميل المنتجات" : "We couldn't load products"}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {isArabic
            ? "يرجى المحاولة مرة أخرى بعد قليل."
            : "Please try again in a moment."}
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/">{isArabic ? "العودة للرئيسية" : "Back to home"}</Link>
        </Button>
      </section>
    );
  }

  const { products, pagination, categories, currency, currencyExponent } = data;
  const search = firstSearchValue(currentSearchParams.search);
  const minPrice = firstSearchValue(currentSearchParams.minPrice);
  const maxPrice = firstSearchValue(currentSearchParams.maxPrice);
  const sortBy = firstSearchValue(currentSearchParams.sortBy) ?? "createdAt";
  const sortOrder = firstSearchValue(currentSearchParams.sortOrder) ?? "desc";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          {isArabic ? "اكتشف مجموعتنا" : "Explore our collection"}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {isArabic ? "جميع المنتجات" : "All products"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {isArabic
                ? "تصفح مجموعتنا الكاملة وابحث عن المنتجات المناسبة لك."
                : "Browse the full collection and find the products that are right for you."}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {pagination.total}
            </span>{" "}
            {isArabic ? "منتج" : "products"}
          </p>
        </div>
      </header>

      {categories.length > 0 ? (
        <nav
          aria-label={isArabic ? "تصفح التصنيفات" : "Browse categories"}
          className="mb-7 flex gap-2 overflow-x-auto pb-2"
        >
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      ) : null}

      <form
        method="get"
        className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:grid-cols-6"
      >
        <label className="col-span-2 flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-semibold">
            {isArabic ? "ابحث عن منتج" : "Search products"}
          </span>
          <input
            type="search"
            name="search"
            defaultValue={search}
            maxLength={150}
            placeholder={isArabic ? "اسم المنتج..." : "Product name..."}
            className="h-10 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">
            {isArabic ? "أقل سعر" : "Min price"}
          </span>
          <input
            type="number"
            name="minPrice"
            min="0"
            step="any"
            defaultValue={minPrice}
            placeholder="0"
            className="h-10 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">
            {isArabic ? "أعلى سعر" : "Max price"}
          </span>
          <input
            type="number"
            name="maxPrice"
            min="0"
            step="any"
            defaultValue={maxPrice}
            placeholder="—"
            className="h-10 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">
            {isArabic ? "ترتيب حسب" : "Sort by"}
          </span>
          <select
            name="sortBy"
            defaultValue={sortBy}
            className="h-10 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <option value="createdAt">
              {isArabic ? "الأحدث" : "Newest"}
            </option>
            <option value="price">{isArabic ? "السعر" : "Price"}</option>
            <option value="name">{isArabic ? "الاسم" : "Name"}</option>
          </select>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">
            {isArabic ? "الاتجاه" : "Order"}
          </span>
          <select
            name="sortOrder"
            defaultValue={sortOrder}
            className="h-10 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <option value="desc">{isArabic ? "تنازلي" : "Descending"}</option>
            <option value="asc">{isArabic ? "تصاعدي" : "Ascending"}</option>
          </select>
        </div>

        <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-6">
          <Button type="submit" className="h-10 rounded-xl px-6">
            {isArabic ? "تطبيق الفلاتر" : "Apply filters"}
          </Button>
          <Button asChild type="button" variant="outline" className="h-10 rounded-xl">
            <Link href="/products">{isArabic ? "إعادة ضبط" : "Reset"}</Link>
          </Button>
        </div>
      </form>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
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
        <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
          <h2 className="text-lg font-bold">
            {isArabic ? "لا توجد منتجات مطابقة" : "No products found"}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {isArabic
              ? "جرّب تغيير كلمات البحث أو تعديل نطاق السعر."
              : "Try changing your search terms or adjusting the price range."}
          </p>
          <Button asChild variant="outline" className="mt-5 rounded-xl">
            <Link href="/products">{isArabic ? "عرض كل المنتجات" : "View all products"}</Link>
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
                {isArabic ? "السابق" : "Previous"}
              </Link>
            </Button>
          ) : (
            <Button variant="outline" className="rounded-xl" disabled>
              {isArabic ? "السابق" : "Previous"}
            </Button>
          )}
          <span className="min-w-24 text-center text-sm text-muted-foreground">
            {isArabic ? "صفحة" : "Page"}{" "}
            <strong className="text-foreground">{pagination.page}</strong>{" "}
            {isArabic ? "من" : "of"} {pagination.totalPages}
          </span>
          {pagination.hasNextPage ? (
            <Button asChild className="rounded-xl">
              <Link href={buildPageHref(currentSearchParams, pagination.page + 1)}>
                {isArabic ? "التالي" : "Next"}
              </Link>
            </Button>
          ) : (
            <Button className="rounded-xl" disabled>
              {isArabic ? "التالي" : "Next"}
            </Button>
          )}
        </nav>
      ) : null}
    </main>
  );
}

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
