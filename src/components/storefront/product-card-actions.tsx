"use client";

import { ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardActionsProps {
  locale: string;
  isAvailable: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const actionButtonClass =
  "h-8 w-full min-w-0 gap-1 rounded-lg border px-1.5 py-0 text-[9px] font-semibold leading-none tracking-normal sm:h-9 lg:h-8";

export function ProductCardActions({
  locale,
  isAvailable,
  onAddToCart,
  onBuyNow,
}: ProductCardActionsProps) {
  const addToCartLabel = locale === "ar" ? "أضف للسلة" : "Add to cart";
  const buyNowLabel = locale === "ar" ? "اشتر الآن" : "Buy now";

  return (
    <div className="mt-auto grid grid-cols-1 gap-1.5 pt-3 min-[380px]:grid-cols-2 sm:gap-2">
      <Button
        type="button"
        size="sm"
        onClick={onAddToCart}
        disabled={!isAvailable}
        className={actionButtonClass}
        style={{ fontSize: "9px" }}
      >
        <ShoppingBag className="size-3 shrink-0" aria-hidden="true" />
        <span className="block min-w-0 whitespace-nowrap text-[9px] leading-3">
          {addToCartLabel}
        </span>
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onBuyNow}
        disabled={!isAvailable}
        aria-label={buyNowLabel}
        title={buyNowLabel}
        className={actionButtonClass}
        style={{ fontSize: "9px" }}
      >
        <Zap className="size-3 shrink-0" aria-hidden="true" />
        <span className="block min-w-0 whitespace-nowrap text-[9px] leading-3">
          {buyNowLabel}
        </span>
      </Button>
    </div>
  );
}
