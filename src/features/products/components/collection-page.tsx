import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ProductsGrid } from "@/features/products/components/products-grid";
import { ProductsHeader } from "@/features/products/components/products-header";
import { ProductsPagination } from "@/features/products/components/products-pagination";
import {
  getProductCollectionPageData,
  type CatalogSearchParams,
  type ProductCollectionSection,
} from "@/features/products/api/catalog.server";

interface CollectionPageProps {
  params: Promise<{ locale: string; section: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

const COLLECTIONS: ProductCollectionSection[] = ["latest", "best-offers", "best-sellers"];

function isCollectionSection(value: string): value is ProductCollectionSection {
  return COLLECTIONS.includes(value as ProductCollectionSection);
}

export async function generateMetadata({ params }: Pick<CollectionPageProps, "params">): Promise<Metadata> {
  const { locale, section } = await params;
  if (!isCollectionSection(section)) return {};
  const titles = locale === "ar"
    ? { latest: "أحدث المنتجات", "best-offers": "أفضل العروض", "best-sellers": "الأكثر مبيعاً" }
    : { latest: "New arrivals", "best-offers": "Best offers", "best-sellers": "Best sellers" };
  return { title: titles[section], robots: { index: true, follow: true } };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const [{ locale, section }, currentSearchParams] = await Promise.all([params, searchParams]);
  if (!isCollectionSection(section)) notFound();

  const [data, t] = await Promise.all([
    getProductCollectionPageData(locale, section, currentSearchParams),
    getTranslations({ locale, namespace: "Collections" }),
  ]);
  const copy = section === "latest"
    ? { eyebrow: t("latestEyebrow"), title: t("latestTitle"), description: t("latestDescription") }
    : section === "best-offers"
      ? { eyebrow: t("offersEyebrow"), title: t("offersTitle"), description: t("offersDescription") }
      : { eyebrow: t("sellersEyebrow"), title: t("sellersTitle"), description: t("sellersDescription") };

  if (!data) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("loadError")}</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("loadErrorDescription")}</p>
        <Button asChild className="mt-6 rounded-xl"><Link href="/">{t("backHome")}</Link></Button>
      </section>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <ProductsHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        productCount={data.pagination.total}
        productCountLabel={t("productCountLabel")}
      />
      <section aria-label={copy.title} className="min-w-0">
        <ProductsGrid
          products={data.products}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
          emptyTitle={t("emptyTitle")}
          emptyDescription={t("emptyDescription")}
          viewAllLabel={t("viewAll")}
        />
        <ProductsPagination
          pagination={data.pagination}
          searchParams={currentSearchParams}
          basePath={`/collections/${section}`}
          labels={{
            previous: t("previous"),
            next: t("next"),
            page: t("page"),
            of: t("of"),
            ariaLabel: t("paginationLabel"),
          }}
        />
      </section>
    </main>
  );
}
