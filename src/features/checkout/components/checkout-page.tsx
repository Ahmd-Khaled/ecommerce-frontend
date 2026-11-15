"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CheckCircle2,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useAddresses } from "@/features/addresses/hooks/use-addresses";
import { addressApi } from "@/features/addresses/api/address.api";
import { AddressFormDialog } from "@/features/addresses/components/address-form-dialog";
import type { AddressPayload, CustomerAddress } from "@/features/addresses/types/address.types";
import { checkoutApi } from "@/features/checkout/api/checkout.api";
import type { CheckoutPayload, PlacedOrder } from "@/features/checkout/types/checkout.types";
import { formatMinorMoney } from "@/utils/formatCurrency";
import { apiErrorMessage } from "@/lib/api/axios";

export function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const { user } = useAuth();
  const { cart, isLoading: isCartLoading, error: cartError, refetch: refetchCart } = useCart();
  const {
    addresses,
    isLoading: isAddressesLoading,
    error: addressError,
    refetch: refetchAddresses,
  } = useAddresses(user?.id);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const idempotencyRef = useRef<{ fingerprint: string; key: string } | null>(null);

  const selectedAddress =
    addresses.find((address) => address._id === selectedAddressId) ??
    addresses.find((address) => address.isDefault) ??
    addresses[0];

  const currency = cart?.currency ?? "EGP";
  const currencyExponent = cart?.currencyExponent ?? 2;
  const moneyOptions = { locale, currency, currencyExponent };

  const unavailableItems = cart?.items.filter(
    (item) => !item.available || !Number.isSafeInteger(item.unitPriceMinor),
  ) ?? [];

  const payload = useMemo<CheckoutPayload | null>(() => {
    if (!cart || !selectedAddress || cart.items.length === 0) return null;
    if (cart.items.some((item) => !item.available || !Number.isSafeInteger(item.unitPriceMinor))) {
      return null;
    }

    return {
      version: cart.version,
      addressId: selectedAddress._id,
      items: cart.items.map((item) => ({
        productId: item.product._id,
        unitPriceMinor: item.unitPriceMinor!,
      })),
    };
  }, [cart, selectedAddress]);

  const subtotalMinor = cart?.subtotalMinor ?? 0;
  const canSubmit =
    Boolean(payload) &&
    unavailableItems.length === 0 &&
    !isSubmitting &&
    !isCartLoading &&
    !isAddressesLoading;

  async function saveAddress(values: AddressPayload) {
    setIsSavingAddress(true);
    try {
      const address = await addressApi.create(values);
      await refetchAddresses();
      setSelectedAddressId(address._id);
      setAddressDialogOpen(false);
      toast.success(t("addressSaved"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function submitCheckout() {
    if (!payload || !canSubmit) return;

    const fingerprint = JSON.stringify({
      version: payload.version,
      addressId: payload.addressId,
      items: [...payload.items].sort((a, b) => a.productId.localeCompare(b.productId)),
    });

    if (idempotencyRef.current?.fingerprint !== fingerprint) {
      idempotencyRef.current = {
        fingerprint,
        key: crypto.randomUUID().replaceAll("-", ""),
      };
    }

    setIsSubmitting(true);
    try {
      const result = await checkoutApi.placeOrder(
        payload,
        idempotencyRef.current.key,
      );
      setPlacedOrder(result.data);
      idempotencyRef.current = null;
      void refetchCart();
      toast.success(result.replayed ? t("orderRecovered") : t("orderPlaced"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
      void refetchCart();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCartLoading || isAddressesLoading) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-[1100px] items-center justify-center gap-3 px-4 py-12 text-sm text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        {t("loading")}
      </main>
    );
  }

  if (placedOrder) {
    const total = placedOrder.grandTotalMinor ?? 0;
    const orderCurrency = placedOrder.currency ?? currency;
    const orderExponent = placedOrder.currencyExponent ?? currencyExponent;

    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[720px] items-center justify-center px-4 py-12">
        <section className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-9" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">{t("successTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("successDescription")}</p>
          <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-start">
            <p className="text-xs text-muted-foreground">{t("orderReference")}</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold">{placedOrder._id}</p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">{t("orderTotal")}</span>
              <strong>{formatMinorMoney(total, { locale, currency: orderCurrency, currencyExponent: orderExponent })}</strong>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-xl">
              <Link href="/products">{t("continueShopping")}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/account">{t("myAccount")}</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (cartError || !cart || cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-[760px] flex-col items-center justify-center px-4 py-12 text-center">
        <PackageCheck className="size-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">{cartError ? t("cartError") : t("emptyTitle")}</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {cartError ? t("cartErrorDescription") : t("emptyDescription")}
        </p>
        {cartError ? (
          <Button onClick={() => void refetchCart()} className="mt-5 rounded-xl">{t("retry")}</Button>
        ) : (
          <Button asChild className="mt-5 rounded-xl"><Link href="/products">{t("continueShopping")}</Link></Button>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">{t("deliveryAddress")}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t("chooseAddress")}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddressDialogOpen(true)} className="rounded-xl">
                <Plus className="size-4" />
                {t("addAddress")}
              </Button>
            </div>

            {addressError ? (
              <div className="mt-4 rounded-xl bg-destructive/5 p-4 text-sm">
                <p>{t("addressError")}</p>
                <Button variant="link" onClick={() => void refetchAddresses()} className="mt-1 h-auto p-0">{t("retry")}</Button>
              </div>
            ) : addresses.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
                <MapPin className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">{t("noAddresses")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("addAddressHint")}</p>
                <Button type="button" onClick={() => setAddressDialogOpen(true)} className="mt-4 rounded-xl">{t("addFirstAddress")}</Button>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {addresses.map((address: CustomerAddress) => (
                  <button
                    key={address._id}
                    type="button"
                    onClick={() => setSelectedAddressId(address._id)}
                    aria-pressed={selectedAddress?._id === address._id}
                    className={`rounded-xl border p-4 text-start transition ${selectedAddress?._id === address._id ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border hover:border-primary/50"}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">{address.label}</span>
                      {address.isDefault ? <span className="text-[10px] font-semibold text-primary">{t("defaultAddress")}</span> : null}
                    </span>
                    <span className="mt-2 block text-xs font-medium">{address.fullName}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{address.street}{address.building ? `, ${address.building}` : ""}{address.apartment ? `, ${address.apartment}` : ""}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{address.city}, {address.country}</span>
                    <span dir="ltr" className="mt-1 block text-start text-xs text-muted-foreground">{address.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold">{t("reviewItems")}</h2>
              <Link href="/cart" className="text-xs font-semibold text-primary hover:underline">{t("editCart")}</Link>
            </div>
            <div className="mt-4 divide-y divide-border">
              {cart.items.map((item) => (
                <div key={item.product._id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold">{item.product.name ?? t("unavailableProduct")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t("quantity")}: {item.quantity}</p>
                    {!item.available ? <p className="mt-1 text-xs font-medium text-destructive">{t("unavailable")}</p> : null}
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {typeof item.subtotalMinor === "number" ? formatMinorMoney(item.subtotalMinor, moneyOptions) : "—"}
                  </span>
                </div>
              ))}
            </div>
            {unavailableItems.length > 0 ? (
              <p className="mt-4 rounded-xl bg-destructive/5 p-3 text-xs leading-5 text-destructive">{t("unavailableNotice")}</p>
            ) : null}
          </section>
        </div>

        <aside className="rounded-2xl border border-border/80 bg-card p-5 lg:sticky lg:top-28">
          <h2 className="text-base font-bold">{t("summary")}</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-semibold tabular-nums">{formatMinorMoney(subtotalMinor, moneyOptions)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("shipping")}</span>
              <span className="font-semibold tabular-nums">{formatMinorMoney(0, moneyOptions)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("discount")}</span>
              <span className="font-semibold tabular-nums">{formatMinorMoney(0, moneyOptions)}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-border pt-3 text-base">
              <span className="font-bold">{t("total")}</span>
              <span className="font-bold tabular-nums">{formatMinorMoney(subtotalMinor, moneyOptions)}</span>
            </div>
          </div>
          <p className="mt-4 text-[11px] leading-5 text-muted-foreground">{t("feesNote")}</p>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-[11px] leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            {t("priceConfirmationNote")}
          </div>
          <Button
            type="button"
            onClick={() => void submitCheckout()}
            disabled={!canSubmit}
            className="mt-5 h-11 w-full rounded-xl font-semibold"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {isSubmitting ? t("placingOrder") : t("confirmOrder")}
          </Button>
          {!selectedAddress && addresses.length > 0 ? (
            <p className="mt-2 text-center text-xs text-destructive">{t("selectAddress")}</p>
          ) : null}
        </aside>
      </div>

      <AddressFormDialog
        open={addressDialogOpen}
        isSaving={isSavingAddress}
        onOpenChange={setAddressDialogOpen}
        onSubmit={saveAddress}
      />
    </main>
  );
}
