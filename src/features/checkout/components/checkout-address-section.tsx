"use client";

import { MapPin, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { CustomerAddress } from "@/features/addresses/types/address.types";

interface CheckoutAddressSectionProps {
  addresses: CustomerAddress[];
  selectedAddressId: string;
  hasError: boolean;
  onSelect: (addressId: string) => void;
  onAddAddress: () => void;
  onRetry: () => void;
}

export function CheckoutAddressSection({
  addresses,
  selectedAddressId,
  hasError,
  onSelect,
  onAddAddress,
  onRetry,
}: CheckoutAddressSectionProps) {
  const t = useTranslations("Checkout");

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">{t("deliveryAddress")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("chooseAddress")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAddAddress} className="rounded-xl">
          <Plus className="size-4" />
          {t("addAddress")}
        </Button>
      </div>

      {hasError ? (
        <div className="mt-4 rounded-xl bg-destructive/5 p-4 text-sm">
          <p>{t("addressError")}</p>
          <Button variant="link" onClick={onRetry} className="mt-1 h-auto p-0">
            {t("retry")}
          </Button>
        </div>
      ) : addresses.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
          <MapPin className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">{t("noAddresses")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("addAddressHint")}</p>
          <Button type="button" onClick={onAddAddress} className="mt-4 rounded-xl">
            {t("addFirstAddress")}
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <button
              key={address._id}
              type="button"
              onClick={() => onSelect(address._id)}
              aria-pressed={selectedAddressId === address._id}
              className={`rounded-xl border p-4 text-start transition ${selectedAddressId === address._id ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border hover:border-primary/50"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">{address.label}</span>
                {address.isDefault ? <span className="text-[10px] font-semibold text-primary">{t("defaultAddress")}</span> : null}
              </span>
              <span className="mt-2 block text-xs font-medium">{address.fullName}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {address.street}{address.building ? `, ${address.building}` : ""}{address.apartment ? `, ${address.apartment}` : ""}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{address.city}, {address.country}</span>
              <span dir="ltr" className="mt-1 block text-start text-xs text-muted-foreground">{address.phone}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
