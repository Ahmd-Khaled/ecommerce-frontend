"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { LoaderCircle, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useAddresses } from "@/features/addresses/hooks/use-addresses";
import { addressApi } from "@/features/addresses/api/address.api";
import { AddressFormDialog } from "@/features/addresses/components/address-form-dialog";
import type { AddressPayload } from "@/features/addresses/types/address.types";
import { CheckoutAddressSection } from "@/features/checkout/components/checkout-address-section";
import { CheckoutItemsReview } from "@/features/checkout/components/checkout-items-review";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";
import { CheckoutSuccess } from "@/features/checkout/components/checkout-success";
import { checkoutApi } from "@/features/checkout/api/checkout.api";
import type { CheckoutPayload, PlacedOrder } from "@/features/checkout/types/checkout.types";
import { apiErrorMessage } from "@/lib/api/axios";

export function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const { user } = useAuth();
  const {
    cart,
    isLoading: isCartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useCart();
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
  const [pendingCheckout, setPendingCheckout] = useState<{ payload: CheckoutPayload; fingerprint: string; key: string } | null>(null);
  const submittingRef = useRef(false);

  const selectedAddress =
    addresses.find((address) => address._id === selectedAddressId) ??
    addresses.find((address) => address.isDefault) ??
    addresses[0];

  const currency = cart?.currency ?? "EGP";
  const currencyExponent = cart?.currencyExponent ?? 2;
  const unavailableCount =
    cart?.items.filter(
      (item) => !item.available || !Number.isSafeInteger(item.unitPriceMinor),
    ).length ?? 0;
  const subtotalMinor = cart?.subtotalMinor ?? 0;

  const payload: CheckoutPayload | null =
    cart && selectedAddress && cart.items.length > 0 && unavailableCount === 0
      ? {
          version: cart.version,
          addressId: selectedAddress._id,
          items: cart.items.map((item) => ({
            productId: item.product._id,
            unitPriceMinor: item.unitPriceMinor!,
          })),
        }
      : null;

  const canSubmit =
    Boolean(payload) &&
    !isSubmitting &&
    !isCartLoading &&
    !isAddressesLoading &&
    !cartError &&
    !addressError;

  async function saveAddress(values: AddressPayload) {
    setIsSavingAddress(true);
    try {
      const address = await addressApi.create(values);
      setSelectedAddressId(address._id);
      setAddressDialogOpen(false);
      toast.success(t("addressSaved"));
      void refetchAddresses();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function submitCheckout() {
    if (!payload || !canSubmit || submittingRef.current) return;

    const fingerprint = JSON.stringify({
      version: payload.version,
      addressId: payload.addressId,
      items: [...payload.items].sort((a, b) =>
        a.productId.localeCompare(b.productId),
      ),
    });

    const idempotencyKey =
      pendingCheckout?.fingerprint === fingerprint
        ? pendingCheckout.key
        : crypto.randomUUID().replaceAll("-", "");
    setPendingCheckout({ payload, fingerprint, key: idempotencyKey });

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await checkoutApi.placeOrder(payload, idempotencyKey);
      setPlacedOrder(result.data);
      setPendingCheckout(null);
      void refetchCart();
      toast.success(result.replayed ? t("orderRecovered") : t("orderPlaced"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
      void refetchCart();
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function retryPreviousCheckout() {
    const pending = pendingCheckout;
    if (!pending || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await checkoutApi.placeOrder(pending.payload, pending.key);
      setPendingCheckout(null);
      setPlacedOrder(result.data);
      void refetchCart();
      toast.success(t("orderRecovered"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
      void refetchCart();
    } finally {
      submittingRef.current = false;
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
    return (
      <CheckoutSuccess
        order={placedOrder}
        locale={locale}
        fallbackCurrency={currency}
        fallbackExponent={currencyExponent}
      />
    );
  }

  if ((!cart || cart.items.length === 0) && pendingCheckout) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-[760px] flex-col items-center justify-center px-4 py-12 text-center">
        <PackageCheck className="size-10 text-primary" />
        <h1 className="mt-4 text-xl font-bold">{t("recoveryTitle")}</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("recoveryDescription")}</p>
        <Button
          type="button"
          onClick={() => void retryPreviousCheckout()}
          disabled={isSubmitting}
          className="mt-5 rounded-xl"
        >
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSubmitting ? t("placingOrder") : t("retryPreviousCheckout")}
        </Button>
      </main>
    );
  }

  if (cartError || !cart || cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-[760px] flex-col items-center justify-center px-4 py-12 text-center">
        <PackageCheck className="size-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">
          {cartError ? t("cartError") : t("emptyTitle")}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {cartError ? t("cartErrorDescription") : t("emptyDescription")}
        </p>
        {cartError ? (
          <Button onClick={() => void refetchCart()} className="mt-5 rounded-xl">
            {t("retry")}
          </Button>
        ) : (
          <Button asChild className="mt-5 rounded-xl">
            <Link href="/products">{t("continueShopping")}</Link>
          </Button>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <CheckoutAddressSection
            addresses={addresses}
            selectedAddressId={selectedAddress?._id ?? ""}
            hasError={Boolean(addressError)}
            onSelect={setSelectedAddressId}
            onAddAddress={() => setAddressDialogOpen(true)}
            onRetry={() => void refetchAddresses()}
          />
          <CheckoutItemsReview
            items={cart.items}
            unavailableCount={unavailableCount}
            locale={locale}
            currency={currency}
            currencyExponent={currencyExponent}
          />
        </div>

        <CheckoutSummary
          locale={locale}
          currency={currency}
          currencyExponent={currencyExponent}
          subtotalMinor={subtotalMinor}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          hasAddresses={Boolean(selectedAddress)}
          onSubmit={() => void submitCheckout()}
        />
      </div>

      {addressDialogOpen ? (
        <AddressFormDialog
          open
          isSaving={isSavingAddress}
          onOpenChange={setAddressDialogOpen}
          onSubmit={saveAddress}
        />
      ) : null}
    </main>
  );
}
