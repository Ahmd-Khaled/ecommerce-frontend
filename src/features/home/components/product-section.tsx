"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import type { HomepageProduct } from "../types/home.types";

interface ProductSectionProps {
  title: string;
  eyebrow: string;
  description: string;
  products: HomepageProduct[];
  currency: string;
  currencyExponent: number;
  locale: string;
  href?: string;
  viewAllLabel: string;
  previousLabel: string;
  nextLabel: string;
}

export function ProductSection({
  title,
  eyebrow,
  description,
  products,
  currency,
  currencyExponent,
  locale,
  href = "/products",
  viewAllLabel,
  previousLabel,
  nextLabel,
}: ProductSectionProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === "ar";

  if (products.length === 0) return null;

  function scrollRail(direction: "previous" | "next") {
    const amount = direction === "next" ? 340 : -340;
    railRef.current?.scrollBy({
      left: isRtl ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
            {eyebrow}
          </p>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-[1.75rem]">
            {title}
          </h2>
          <p className="mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
            {description}
          </p>
        </div>

        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-[11px] font-semibold transition hover:border-primary/40 hover:text-primary sm:px-4 sm:text-xs"
        >
          {viewAllLabel}
          <ArrowRight className="size-3.5 rtl:rotate-180" />
        </Link>
      </div>

      {products.length > 3 ? (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollRail("previous")}
            aria-label={previousLabel}
            className="size-9 rounded-full bg-background"
          >
            {isRtl ? <ArrowRight /> : <ArrowLeft />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollRail("next")}
            aria-label={nextLabel}
            className="size-9 rounded-full bg-background"
          >
            {isRtl ? <ArrowLeft /> : <ArrowRight />}
          </Button>
        </div>
      ) : null}

      <div
        ref={railRef}
        dir={locale}
        className="home-product-rail flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-4 lg:gap-5"
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="w-[68vw] max-w-[17rem] shrink-0 snap-start sm:w-[42vw] sm:max-w-[18rem] md:w-[29vw] lg:w-[18rem]"
          >
            <ProductCard
              product={product}
              currency={currency}
              currencyExponent={currencyExponent}
              locale={locale}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
