import { ImageWithSkeleton } from "@/components/storefront/image-with-skeleton";
import { getTranslations } from "next-intl/server";
import type { HomepageBanner } from "../types/home.types";

interface PromotionalBannersProps {
  banners: HomepageBanner[];
}

export async function PromotionalBanners({
  banners,
}: PromotionalBannersProps) {
  const t = await getTranslations("Home");
  const promotions = banners.slice(1, 3);

  if (promotions.length === 0) return null;

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {promotions.map((banner) => {
        const content = (
          <>
            <ImageWithSkeleton
              src={banner.image}
              alt={banner.altText || banner.title || t("bannerAlt")}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 to-transparent" />
            <div className="absolute inset-y-0 start-0 flex max-w-sm flex-col justify-center p-5 text-start text-white sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                {t("bannerEyebrow")}
              </p>
              <h3 className="mt-2 text-lg font-bold leading-snug sm:text-2xl">
                {banner.title || t("bannerTitle")}
              </h3>
              {banner.linkUrl ? (
                <span className="mt-4 text-xs font-semibold underline underline-offset-4">
                  {t("explore")}
                </span>
              ) : null}
            </div>
          </>
        );

        return (
          <div
            key={banner._id}
            className="group relative isolate aspect-[16/8] overflow-hidden rounded-2xl bg-slate-900"
          >
            {banner.linkUrl ? (
              <a
                href={banner.linkUrl}
                className="absolute inset-0"
                aria-label={banner.title || t("bannerAlt")}
              >
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}
    </section>
  );
}
