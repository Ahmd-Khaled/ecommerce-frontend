"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import type { HomepageBanner } from "../types/home.types";

interface BannerCarouselProps {
  banners: HomepageBanner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const locale = useLocale();
  const t = useTranslations("Home");
  const [activeIndex, setActiveIndex] = useState(0);
  const isRtl = locale === "ar";

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  function move(direction: -1 | 1) {
    setActiveIndex((current) =>
      (current + direction + banners.length) % banners.length,
    );
  }

  return (
    <section
      aria-label={t("heroLabel")}
      className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-2xl shadow-slate-950/10"
    >
      <div className="relative aspect-[5/5.2] sm:aspect-[16/7] lg:aspect-[16/6.1]">
        {banners.map((banner, index) => {
          const isActive = index === activeIndex;
          const slide = (
            <>
              <Image
                src={banner.image}
                alt={banner.altText || banner.title || t("bannerAlt")}
                fill
                priority={index === 0}
                unoptimized
                sizes="100vw"
                className={\`object-cover transition-transform duration-[7000ms] ease-out \${isActive ? "scale-105" : "scale-100"}\`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/10" />
              <div className="absolute inset-y-0 start-0 flex w-full max-w-3xl flex-col items-start justify-center p-6 text-start text-white sm:p-10 lg:p-16">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md sm:text-xs">
                  <Sparkles className="size-3.5" />
                  {t("bannerEyebrow")}
                </span>
                <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl">
                  {banner.title || t("bannerTitle")}
                </h1>
                <p className="mt-4 max-w-lg text-xs leading-6 text-white/75 sm:text-base sm:leading-7">
                  {t("bannerDescription")}
                </p>
                {banner.linkUrl ? (
                  <a
                    href={banner.linkUrl}
                    className="mt-7 inline-flex min-h-11 items-center gap-3 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-slate-100 sm:text-sm"
                  >
                    {t("explore")}
                    {isRtl ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                  </a>
                ) : null}
              </div>
            </>
          );

          return (
            <div
              key={banner._id}
              aria-hidden={!isActive}
              className={\`absolute inset-0 transition-opacity duration-700 \${isActive ? "z-10 opacity-100" : "z-0 pointer-events-none opacity-0"}\`}
            >
              {slide}
            </div>
          );
        })}
      </div>

      {banners.length > 1 ? (
        <>
          <div className="absolute inset-x-5 bottom-5 z-20 flex items-center justify-between sm:inset-x-8 sm:bottom-8">
            <div className="flex items-center gap-2" aria-label={t("slideNavigation")}>
              {banners.map((banner, index) => (
                <button
                  key={banner._id}
                  type="button"
                  aria-label={t("goToSlide", { number: index + 1 })}
                  aria-current={activeIndex === index}
                  onClick={() => setActiveIndex(index)}
                  className={\`h-1.5 rounded-full transition-all \${activeIndex === index ? "w-8 bg-white" : "w-3 bg-white/45 hover:bg-white/75"}\`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => move(-1)}
                aria-label={t("previousSlide")}
                className="size-9 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                {isRtl ? <ArrowRight /> : <ArrowLeft />}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => move(1)}
                aria-label={t("nextSlide")}
                className="size-9 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                {isRtl ? <ArrowLeft /> : <ArrowRight />}
              </Button>
            </div>
          </div>
          <span className="sr-only" aria-live="polite">
            {t("slideStatus", { current: activeIndex + 1, total: banners.length })}
          </span>
        </>
      ) : null}
    </section>
  );
}
