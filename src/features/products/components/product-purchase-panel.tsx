"use client";

import { useState } from "react";
import { useLoginDialog } from "@/features/auth/components/login-dialog-provider";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/hooks/use-cart";
import { apiErrorMessage } from "@/lib/api/axios";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Zap, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductPurchasePanelProps {
  locale: string;
  productId: string;
  slug: string;
  stock: number;
  labels: {
    quantity: string;
    decreaseQuantity: string;
    increaseQuantity: string;
    addToCart: string;
    buyNow: string;
    checkoutComingSoon: string;
    unavailable: string;
  };
}

export function ProductPurchasePanel({ locale, productId, slug, stock, labels }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const isAvailable = stock > 0;
  const { status, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const isAddingToCart = addItem.isPending;
  const { requestLogin } = useLoginDialog();
  const t = useTranslations("Cart");

  async function submitAddToCart(nextQuantity: number) {
    if (status === "loading" || addItem.isPending) return;
    if (!isAuthenticated) {
      requestLogin("cart", async () => {
        await addItem.mutateAsync({ productId, quantity: nextQuantity });
        toast.success(t("added"));
      });
      return;
    }
    try {
      await addItem.mutateAsync({ productId, quantity: nextQuantity });
      toast.success(t("added"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-4 border-t border-border/70 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold">{labels.quantity}</span>
        <div className="flex h-10 items-center overflow-hidden rounded-xl border border-border bg-background">
          <Button type="button" variant="ghost" size="icon" disabled={!isAvailable || quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label={labels.decreaseQuantity} className="size-10 rounded-none"><Minus className="size-3.5" /></Button>
          <span aria-live="polite" className="min-w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>
          <Button type="button" variant="ghost" size="icon" disabled={!isAvailable || quantity >= stock} onClick={() => setQuantity((current) => Math.min(stock, current + 1))} aria-label={labels.increaseQuantity} className="size-10 rounded-none"><Plus className="size-3.5" /></Button>
        </div>
      </div>
      {isAvailable ? <p className="text-xs text-muted-foreground">{locale === "ar" ? "متاح " + stock + " قطعة في المخزون" : stock + " available in stock"}</p> : <p className="text-xs font-medium text-destructive">{labels.unavailable}</p>}
      <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
        <Button type="button" onClick={() => void submitAddToCart(quantity)} disabled={!isAvailable || isAddingToCart || status === "loading"} className="h-12 rounded-xl text-xs font-semibold">
          {isAddingToCart ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingCart className="size-4" strokeWidth={2} />}{labels.addToCart}
        </Button>
        <Button type="button" variant="outline" onClick={() => toast.info(labels.checkoutComingSoon)} disabled={!isAvailable} className="h-12 rounded-xl text-xs font-semibold"><Zap className="size-4" strokeWidth={2} />{labels.buyNow}</Button>
      </div>
    </div>
  );
}
