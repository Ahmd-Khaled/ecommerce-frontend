"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { LoaderCircle, PackageCheck, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useAddresses } from "@/features/addresses/hooks/use-addresses";
import { addressApi } from "@/features/addresses/api/address.api";
import { AddressFormDialog } from "@/features/addresses/components/address-form-dialog";
import type { AddressPayload } from "@/features/addresses/types/address.types";
import { CheckoutAddressSection } from "@/features/checkout/components/checkout-address-section";
import { CheckoutItemsReview } from "@/features/checkout/components/checkout-items-review";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";
import { checkoutApi } from "@/features/checkout/api/checkout.api";
import type { CheckoutPayload, PlacedOrder } from "@/features/checkout/types/checkout.types";
import { paymentsApi } from "@/features/payments/api/payments.api";
import {
  createPaymentIdempotencyKey,
  readPaymentSession,
  savePaymentSession,
} from "@/features/payments/utils/payment-session";
import { apiErrorMessage } from "@/lib/api/axios";
import { formatMinorMoney } from "@/utils/formatCurrency";

const SUPPORTED_PAYMENT_CURRENCIES = ["EGP", "USD", "EUR", "GBP", "AED", "SAR"];

export function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const router = useRouter();
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
  const [paymentError, setPaymentError] = useState("");
  const [pendingCheckout, setPendingCheckout] = useState<{ payload: CheckoutPayload; fingerprint: string; key: string } | null>(null);
  const submittingRef = useRef(false);

  const selectedAddress =
    addresses.find((address) => address._id === selectedAddressId) ??
    addresses.find((address) => address.isDefault) ??
    addresses[0];

  const currency = cart?.currency ?? "EGP";
  const currencyExponent = cart?.currencyExponent ?? 2;
  const paymentCurrencySupported = SUPPORTED_PAYMENT_CURRENCIES.includes(currency);
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
    paymentCurrencySupported &&
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

  async function beginPayment(order: PlacedOrder, idempotencyKey: string) {
    savePaymentSession({ orderId: order._id, idempotencyKey });

    const payment = await paymentsApi.createCheckout(order._id, idempotencyKey);

    if (payment.status === "pending" && payment.checkoutUrl) {
      window.location.assign(payment.checkoutUrl);
      return;
    }

    if (payment.status === "paid") {
      router.push("/payment/success");
      return;
    }

    if (payment.status === "expired") {
      throw new Error(t("paymentExpired"));
    }

    throw new Error(t("paymentNotReady"));
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
      pendingCheckout && pendingCheckout.fingerprint === fingerprint
        ? pendingCheckout.key
        : crypto.randomUUID().replaceAll("-", "");
    setPendingCheckout({ payload, fingerprint, key: idempotencyKey });

    submittingRef.current = true;
    setIsSubmitting(true);
    setPaymentError("");
    try {
      const result = await checkoutApi.placeOrder(payload, idempotencyKey);
      setPlacedOrder(result.data);
      setPendingCheckout(null);
      void refetchCart();
      toast.success(result.replayed ? t("orderRecovered") : t("orderPlaced"));

      try {
        await beginPayment(result.data, createPaymentIdempotencyKey());
      } catch (error) {
        setPaymentError(apiErrorMessage(error));
        toast.error(apiErrorMessage(error));
      }
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

      try {
        await beginPayment(result.data, createPaymentIdempotencyKey());
      } catch (error) {
        setPaymentError(apiErrorMessage(error));
        toast.error(apiErrorMessage(error));
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
      void refetchCart();
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function retryPayment() {
    const session = readPaymentSession();
    if (!placedOrder || !session || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setPaymentError("");
    try {
      await beginPayment(placedOrder, session.idempotencyKey);
    } catch (error) {
      setPaymentError(apiErrorMessage(error));
      toast.error(apiErrorMessage(error));
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
    const total = placedOrder.grandTotalMinor ?? 0;
    const orderCurrency = placedOrder.currency ?? currency;

    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[720px] items-center justify-center px-4 py-12">
        <section className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="size-9" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">{t("orderCreatedTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("orderCreatedDescription")}</p>
          <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-start">
            <p className="text-xs text-muted-foreground">{t("orderReference")}</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold">{placedOrder._id}</p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">{t("orderTotal")}</span>
              <strong>{formatMinorMoney(total, { locale, currency: orderCurrency, currencyExponent: placedOrder.currencyExponent ?? currencyExponent })}</strong>
            </div>
          </div>
          {paymentError ? (
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-start">
              <p className="text-sm font-semibold text-destructive">{t("paymentStartFailed")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{paymentError}</p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">{t("openingSecureCheckout")}</p>
          )}
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            {paymentError ? (
              <Button onClick={() => void retryPayment()} disabled={isSubmitting} className="rounded-xl">
                {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {isSubmitting ? t("placingOrder") : t("retryPayment")}
              </Button>
            ) : null}
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/orders">{t("viewOrders")}</Link>
            </Button>
          </div>
        </section>
      </main>
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

      {!paymentCurrencySupported ? (
        <p className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {t("paymentCurrencyUnsupported")}
        </p>
      ) : null}

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
