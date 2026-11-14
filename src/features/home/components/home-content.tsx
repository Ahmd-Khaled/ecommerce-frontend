import { getLocale, getTranslations } from "next-intl/server";
import { getHomepageData } from "../api/home.server";
import { BannerCarousel } from "./banner-carousel";
import { BestDeal } from "./best-deal";
import { CategorySection } from "./category-section";
import { ProductSection } from "./product-section";
import { PromotionalBanners } from "./promotional-banners";
import { TrustStrip } from "./trust-strip";

export async function HomeContent() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const [desktopData, mobileData] = await Promise.all([
    getHomepageData(locale, "desktop"),
    getHomepageData(locale, "mobile"),
  ]);
  const data = desktopData ?? mobileData;

  if (!data) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <span className="text-2xl font-bold">!</span>
        </span>
        <h1 className="mt-5 text-xl font-bold">{t("errorTitle")}</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {t("errorDescription")}
        </p>
        <a
          href={locale === "ar" ? "/ar" : "/en"}
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {t("retry")}
        </a>
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
    <main
      id="home"
      className="mx-auto w-full max-w-[1440px] space-y-12 px-4 py-6 sm:space-y-16 sm:px-6 sm:py-9 lg:px-8"
    >
      {!hasStoreContent ? (
        <section className="flex min-h-[45vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <span className="text-3xl">◇</span>
          </span>
          <h1 className="mt-5 text-xl font-bold">{t("emptyTitle")}</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </section>
      ) : null}

      <BannerCarousel banners={data.banners} mobileBanners={mobileData?.banners ?? []} />

      <TrustStrip />

      <CategorySection categories={data.categories} />

      {data.bestDeal ? (
        <BestDeal
          product={data.bestDeal}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
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
          viewAllLabel={t("viewAll")}
          previousLabel={t("previousProducts")}
          nextLabel={t("nextProducts")}
        />

        <ProductSection
          eyebrow={t("offersEyebrow")}
          title={t("offersTitle")}
          description={t("offersDescription")}
          products={data.bestOffers}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
          viewAllLabel={t("viewAll")}
          previousLabel={t("previousProducts")}
          nextLabel={t("nextProducts")}
        />

        <ProductSection
          eyebrow={t("bestSellersEyebrow")}
          title={t("bestSellersTitle")}
          description={t("bestSellersDescription")}
          products={data.bestSellers}
          currency={data.currency}
          currencyExponent={data.currencyExponent}
          locale={locale}
          viewAllLabel={t("viewAll")}
          previousLabel={t("previousProducts")}
          nextLabel={t("nextProducts")}
        />
      </div>

      <PromotionalBanners banners={data.banners} />
    </main>
  );
}
