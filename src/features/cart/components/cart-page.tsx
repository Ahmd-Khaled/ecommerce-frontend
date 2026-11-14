"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageWithSkeleton } from "@/components/storefront/image-with-skeleton";
import { useCart } from "@/features/cart/hooks/use-cart";
import { formatMajorMoney } from "@/utils/formatCurrency";
import { apiErrorMessage } from "@/lib/api/axios";

export function CartPage() {
  const locale = useLocale();
  const t = useTranslations("Cart");
  const isArabic = locale === "ar";
  const {
    cart,
    isLoading,
    error,
    refetch,
    updateItem,
    removeItem,
    clearCart,
    isMutating,
  } = useCart();

  const currency = cart?.currency ?? "EGP";
  const currencyExponent = cart?.currencyExponent ?? 2;
  const subtotal = formatMajorMoney(cart?.subtotal ?? 0, {
    locale,
    currency,
    currencyExponent,
  });

  async function changeQuantity(productId: string, quantity: number) {
    try {
      await updateItem.mutateAsync({ productId, quantity });
    } catch (mutationError) {
      toast.error(apiErrorMessage(mutationError));
    }
  }

  async function removeProduct(productId: string) {
    try {
      await removeItem.mutateAsync(productId);
      toast.success(t("itemRemoved"));
    } catch (mutationError) {
      toast.error(apiErrorMessage(mutationError));
    }
  }

  async function emptyCart() {
    try {
      await clearCart.mutateAsync();
      toast.success(t("cartCleared"));
    } catch (mutationError) {
      toast.error(apiErrorMessage(mutationError));
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[55vh] max-w-[1100px] px-4 py-12 sm:px-6">
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
          {t("loading")}
        </div>
      </main>
    );
  }

  if (error || !cart) {
    return (
      <main className="mx-auto min-h-[55vh] max-w-[1100px] px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-border bg-card p-8 text-center">
          <ShoppingBag className="size-10 text-muted-foreground" />
          <h1 className="mt-4 text-lg font-bold">{t("loadError")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("loadErrorDescription")}</p>
          <Button onClick={() => void refetch()} className="mt-5 rounded-xl">{t("retry")}</Button>
        </div>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-[1100px] items-center justify-center px-4 py-12 sm:px-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <span className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <ShoppingBag className="size-9" />
          </span>
          <h1 className="mt-6 text-2xl font-bold">{t("emptyTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("emptyDescription")}</p>
          <Button asChild className="mt-6 h-11 rounded-xl px-6">
            <Link href="/products">{t("continueShopping")}</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("itemCount", { count: cart.totalItems })}</p>
        </div>
        <Button variant="ghost" onClick={() => void emptyCart()} disabled={isMutating} className="text-xs text-destructive hover:text-destructive">
          <Trash2 className="size-4" /> {t("clearCart")}
        </Button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-3" aria-label={t("title")}>
          {cart.items.map((item) => {
            const productId = item.product._id;
            const name = item.product.name ?? t("unavailableProduct");
            const image = item.product.images?.[0];
            const unitPrice = item.product.price;
            const canIncrease = item.available && typeof item.product.stock === "number" && item.quantity < item.product.stock;
            return (
              <article key={productId} className="flex min-w-0 gap-3 rounded-2xl border border-border/80 bg-card p-3 sm:gap-4 sm:p-4">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28">
                  {image ? (
                    <ImageWithSkeleton src={image} alt={name} fill sizes="112px" unoptimized className="object-contain p-2" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t("noImage")}</div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {item.product.slug ? (
                        <Link href={`/products/${item.product.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">{name}</Link>
                      ) : (
                        <p className="line-clamp-2 text-sm font-semibold">{name}</p>
                      )}
                      {!item.available ? <p className="mt-1 text-[11px] font-medium text-destructive">{t("unavailable")}</p> : null}
                    </div>
                    <Button type="button" variant="ghost" size="icon" aria-label={t("removeItem")} title={t("removeItem")} disabled={isMutating} onClick={() => void removeProduct(productId)} className="size-8 shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {typeof unitPrice === "number" ? (
                    <p className="mt-1 text-sm font-bold">{formatMajorMoney(unitPrice, { locale, currency, currencyExponent })}</p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex h-8 items-center overflow-hidden rounded-lg border border-border">
                      <Button type="button" variant="ghost" size="icon" className="size-8 rounded-none" aria-label={t("decrease")} disabled={isMutating || item.quantity <= 1} onClick={() => void changeQuantity(productId, item.quantity - 1)}>
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="min-w-8 text-center text-xs font-semibold tabular-nums">{item.quantity}</span>
                      <Button type="button" variant="ghost" size="icon" className="size-8 rounded-none" aria-label={t("increase")} disabled={isMutating || !canIncrease} onClick={() => void changeQuantity(productId, item.quantity + 1)}>
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{formatMajorMoney(item.subtotal, { locale, currency, currencyExponent })}</span>
                  </div>
                </div>
              </article>
            );
          })}
          <div className="pt-2">
            <Button asChild variant="ghost" className="px-0 text-xs text-muted-foreground hover:text-primary">
              <Link href="/products">{isArabic ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}{t("continueShopping")}</Link>
            </Button>
          </div>
        </section>

        <aside className="rounded-2xl border border-border/80 bg-card p-5 lg:sticky lg:top-28">
          <h2 className="text-base font-bold">{t("summary")}</h2>
          <div className="mt-5 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{t("subtotal")}</span>
            <span className="font-bold tabular-nums">{subtotal}</span>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{t("shippingNote")}</p>
          <Button type="button" disabled className="mt-5 h-11 w-full rounded-xl">{t("checkoutComingSoon")}</Button>
        </aside>
      </div>
    </main>
  );
}
