"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  MapPin,
  MapPinned,
  Pencil,
  Plus,
  Star,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-context";
import { useAddresses } from "@/features/addresses/hooks/use-addresses";
import { AddressFormDialog } from "@/features/addresses/components/address-form-dialog";
import type {
  AddressPayload,
  CustomerAddress,
} from "@/features/addresses/types/address.types";
import { apiErrorMessage } from "@/lib/api/axios";

export function AddressesPage() {
  const t = useTranslations("Addresses");
  const { user } = useAuth();
  const {
    addresses,
    isLoading,
    error,
    refetch,
    create,
    update,
    setDefault,
    remove,
    isMutating,
  } = useAddresses(user?.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(address: CustomerAddress) {
    setEditing(address);
    setDialogOpen(true);
  }

  async function saveAddress(payload: AddressPayload) {
    try {
      if (editing) {
        await update.mutateAsync({ addressId: editing._id, payload });
        toast.success(t("updated"));
      } else {
        await create.mutateAsync(payload);
        toast.success(t("created"));
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function makeDefault(addressId: string) {
    try {
      await setDefault.mutateAsync(addressId);
      toast.success(t("defaultUpdated"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function deleteAddress(address: CustomerAddress) {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await remove.mutateAsync(address._id);
      toast.success(t("deleted"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button onClick={openCreate} className="h-10 rounded-xl">
          <Plus className="size-4" />
          {t("addAddress")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
          {t("loading")}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center">
          <p className="font-semibold">{t("loadError")}</p>
          <Button variant="outline" onClick={() => void refetch()} className="mt-4 rounded-xl">
            {t("retry")}
          </Button>
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <MapPinned className="size-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-bold">{t("emptyTitle")}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {t("emptyDescription")}
          </p>
          <Button onClick={openCreate} className="mt-5 rounded-xl">
            <Plus className="size-4" />
            {t("addAddress")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address._id}
              className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold">{address.label}</h2>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {address.fullName}
                    </p>
                  </div>
                </div>
                {address.isDefault ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                    <Star className="size-3 fill-current" />
                    {t("default")}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 space-y-1.5 text-xs leading-5 text-muted-foreground">
                <p>{address.street}{address.building ? `, ${address.building}` : ""}{address.apartment ? `, ${address.apartment}` : ""}</p>
                <p>{address.city}, {address.country}</p>
                <p dir="ltr" className="text-start">{address.phone}</p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
                {!address.isDefault ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isMutating}
                    onClick={() => void makeDefault(address._id)}
                    className="rounded-lg text-xs"
                  >
                    <Star className="size-3.5" />
                    {t("setDefault")}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isMutating}
                  onClick={() => openEdit(address)}
                  className="rounded-lg text-xs"
                >
                  <Pencil className="size-3.5" />
                  {t("edit")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isMutating}
                  onClick={() => void deleteAddress(address)}
                  className="rounded-lg text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  {t("delete")}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {dialogOpen ? (
        <AddressFormDialog
          open={dialogOpen}
          address={editing}
          isSaving={create.isPending || update.isPending}
          onOpenChange={setDialogOpen}
          onSubmit={saveAddress}
        />
      ) : null}
    </main>
  );
}
