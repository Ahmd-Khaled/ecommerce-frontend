"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  AddressPayload,
  CustomerAddress,
} from "@/features/addresses/types/address.types";

interface AddressFormDialogProps {
  open: boolean;
  address?: CustomerAddress | null;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AddressPayload) => Promise<void>;
}

type FormValues = {
  label: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
  isDefault: boolean;
};

const emptyValues: FormValues = {
  label: "",
  fullName: "",
  phone: "",
  country: "",
  city: "",
  street: "",
  building: "",
  apartment: "",
  isDefault: false,
};

export function AddressFormDialog({
  open,
  address,
  isSaving = false,
  onOpenChange,
  onSubmit,
}: AddressFormDialogProps) {
  const t = useTranslations("Addresses");
  const [values, setValues] = useState<FormValues>(() =>
    address
      ? {
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          country: address.country,
          city: address.city,
          street: address.street,
          building: address.building ?? "",
          apartment: address.apartment ?? "",
          isDefault: address.isDefault,
        }
      : emptyValues,
  );

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      label: values.label.trim(),
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      country: values.country.trim(),
      city: values.city.trim(),
      street: values.street.trim(),
      building: values.building.trim(),
      apartment: values.apartment.trim(),
      ...(address
        ? { isDefault: values.isDefault }
        : values.isDefault
          ? { isDefault: true }
          : {}),
    });
  }

  const fields: {
    key: Exclude<keyof FormValues, "isDefault">;
    label: string;
    required?: boolean;
    wide?: boolean;
    type?: string;
  }[] = [
    { key: "label", label: t("label"), required: true },
    { key: "fullName", label: t("fullName"), required: true },
    { key: "phone", label: t("phone"), required: true, type: "tel" },
    { key: "country", label: t("country"), required: true },
    { key: "city", label: t("city"), required: true },
    { key: "street", label: t("street"), required: true, wide: true },
    { key: "building", label: t("building") },
    { key: "apartment", label: t("apartment") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {address ? t("editTitle") : t("addTitle")}
          </DialogTitle>
          <DialogDescription>{t("formDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.wide ? "sm:col-span-2" : undefined}
              >
                <Label htmlFor={`address-${field.key}`} className="mb-2">
                  {field.label}
                  {field.required ? <span className="text-destructive"> *</span> : null}
                </Label>
                <Input
                  id={`address-${field.key}`}
                  type={field.type ?? "text"}
                  required={field.required}
                  maxLength={field.key === "street" ? 300 : field.key === "label" ? 50 : 100}
                  value={values[field.key]}
                  onChange={(event) =>
                    update(field.key, event.target.value)
                  }
                  className="h-10 rounded-xl"
                />
              </div>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.isDefault}
              onChange={(event) => update("isDefault", event.target.checked)}
              className="size-4 accent-primary"
            />
            {t("makeDefault")}
          </label>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving} className="rounded-xl">
              {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {isSaving ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
