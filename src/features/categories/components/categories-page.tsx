import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/features/categories/components/category-card";
import { getCategoriesPageData } from "@/features/categories/api/categories-page.server";

interface CategoriesPageProps { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: CategoriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تسوق حسب الفئة" : "Shop by category",
    description: locale === "ar"
      ? "استكشف جميع الفئات والتصنيفات واكتشف المنتجات المناسبة لك."
      : "Explore our categories and discover collections of products selected for you.",
  };
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  const [data, t] = await Promise.all([
    getCategoriesPageData(locale),
    getTranslations({ locale, namespace: "Categories" }),
  ]);

  if (!data) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="mb-3 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">{t("connectionIssue")}</span>
        <h1 className="text-2xl font-bold tracking-tight">{t("loadError")}</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("loadErrorDescription")}</p>
        <Button asChild className="mt-6 rounded-xl"><Link href="/">{t("backHome")}</Link></Button>
      </main>
    );
  }

  const categories = data.categories;
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8 border-b border-border/70 pb-6 sm:mb-10 sm:pb-8">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{t("eyebrow")}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{t("description")}</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">{t("viewAllProducts")} →</Link>
        </div>
      </header>

      {categories.length === 0 ? (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
          <h2 className="text-lg font-bold">{t("emptyTitle")}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("emptyDescription")}</p>
        </section>
      ) : (
        <section aria-label={t("title")} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category}
              labels={{ explore: t("explore"), products: t("products"), subcategories: t("subcategories") }} />
          ))}
        </section>
      )}
    </main>
  );
}
