"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, PackageCheck, PackageOpen, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { formatMajorMoney } from "@/utils/formatCurrency";
import type { HomepageProduct } from "../types/home.types";

interface ProductCardProps {
  product: HomepageProduct;
  currency: string;
  currencyExponent: number;
  locale: string;
}

export function ProductCard({
  product,
  currency,
  currencyExponent,
  locale,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const image = product.images?.[0];
  const isAvailable = product.stock > 0;
  const price = formatMajorMoney(product.price, {
    locale,
    currency,
    currencyExponent,
  });
  const comparePrice = product.compareAtPrice
    ? formatMajorMoney(product.compareAtPrice, {
        locale,
        currency,
        currencyExponent,
      })
    : null;

  function handleCart() {
    toast.info(locale === "ar" ? "ميزة سلة التسوق قيد التجهيز" : "Shopping cart is coming soon");
  }

  function handleBuyNow() {
    toast.info(locale === "ar" ? "إتمام الشراء سيكون متاحاً قريباً" : "Quick checkout is coming soon");
  }

  function toggleFavorite() {
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    toast.success(
      nextValue
        ? locale === "ar" ? "أُضيف إلى المفضلة لهذه الجلسة" : "Added to favorites for this session"
        : locale === "ar" ? "أُزيل من المفضلة" : "Removed from favorites",
    );
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-border/80 bg-card shadow-sm shadow-slate-950/[0.025] transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-slate-950/[0.08]">
      <div className="relative isolate aspect-[4/4.25] overflow-hidden bg-muted/70">
        <Link
          href={\`/products/\${product.slug}\`}
          className="absolute inset-0 z-0"
          aria-label={product.name}
        >
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 260px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <PackageOpen className="size-11" strokeWidth={1.3} />
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1.5">
            {product.discountPercentage ? (
              <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-sm">
                -{Math.round(product.discountPercentage)}%
              </span>
            ) : null}
            {!isAvailable ? (
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground backdrop-blur">
                {locale === "ar" ? "نفد المخزون" : "Out of stock"}
              </span>
            ) : null}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={toggleFavorite}
            aria-label={isFavorite
              ? locale === "ar" ? "إزالة من المفضلة" : "Remove from favorites"
              : locale === "ar" ? "إضافة إلى المفضلة" : "Add to favorites"}
            className="pointer-events-auto size-9 rounded-full border border-white/60 bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
          >
            <Heart className={\`size-4 transition-colors \${isFavorite ? "fill-rose-500 text-rose-500" : ""}\`} />
          </Button>
        </div>

        <Link
          href={\`/products/\${product.slug}\`}
          className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-2 items-center justify-center gap-2 rounded-xl bg-background/95 px-3 py-2.5 text-xs font-semibold text-foreground opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-background group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 sm:flex"
        >
          {locale === "ar" ? "عرض التفاصيل" : "Quick view"}
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link
          href={\`/products/\${product.slug}\`}
          className="line-clamp-2 min-h-10 text-start text-xs font-semibold leading-5 text-card-foreground transition-colors hover:text-primary sm:text-sm"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex min-h-8 flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-bold tracking-tight text-foreground sm:text-base">
            {price}
          </span>
          {comparePrice ? (
            <span className="text-[11px] text-muted-foreground line-through sm:text-xs">
              {comparePrice}
            </span>
          ) : null}
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-3">
          <Button
            type="button"
            size="sm"
            onClick={handleCart}
            disabled={!isAvailable}
            className="h-9 min-w-0 gap-1.5 rounded-xl px-2 text-[11px] font-semibold sm:h-10 sm:gap-2 sm:px-3 sm:text-xs"
          >
            <ShoppingBag className="size-3.5 shrink-0" />
            <span className="truncate">{locale === "ar" ? "أضف للسلة" : "Add to cart"}</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleBuyNow}
            disabled={!isAvailable}
            aria-label={locale === "ar" ? "اشتر الآن" : "Buy now"}
            title={locale === "ar" ? "اشتر الآن" : "Buy now"}
            className="size-9 rounded-xl sm:size-10"
          >
            <Zap className="size-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-1.5 border-t border-border/70 pt-2.5 text-[10px] text-muted-foreground">
          <PackageCheck className="size-3.5 shrink-0" />
          <span>{isAvailable
            ? locale === "ar" ? "متوفر وجاهز للطلب" : "In stock and ready to ship"
            : locale === "ar" ? "غير متوفر حالياً" : "Currently unavailable"}</span>
        </div>
      </div>
    </article>
  );
}
