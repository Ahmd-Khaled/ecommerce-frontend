"use client";

import { ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardActionsProps {
  locale: string;
  isAvailable: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const actionButtonClass =
  "h-11 w-full min-w-0 gap-1.5 rounded-[10px] border px-2 py-0 text-[10px] font-semibold leading-none sm:h-12 sm:gap-2 sm:px-2.5";

export function ProductCardActions({
  locale,
  isAvailable,
  onAddToCart,
  onBuyNow,
}: ProductCardActionsProps) {
  const addToCartLabel = locale === "ar" ? "أضف للسلة" : "Add to cart";
  const buyNowLabel = locale === "ar" ? "اشتر الآن" : "Buy now";

  return (
    <div className="mt-auto grid grid-cols-1 gap-2 pt-3 min-[380px]:grid-cols-2 sm:gap-2.5">
      <Button
        type="button"
        onClick={onAddToCart}
        disabled={!isAvailable}
        className={actionButtonClass}
      >
        <ShoppingCart
          className="size-3.5 shrink-0 sm:size-4"
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="min-w-0 whitespace-nowrap text-[10px]">{addToCartLabel}</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onBuyNow}
        disabled={!isAvailable}
        aria-label={buyNowLabel}
        title={buyNowLabel}
        className={actionButtonClass}
      >
        <Zap
          className="size-[18px] shrink-0 sm:size-5"
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="min-w-0 whitespace-nowrap text-[10px]">{buyNowLabel}</span>
      </Button>
    </div>
  );
}
