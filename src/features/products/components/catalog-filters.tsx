"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface CatalogFiltersProps {
  locale: string;
  labels: {
    filters: string;
    searchLabel: string;
    searchPlaceholder: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    newest: string;
    price: string;
    name: string;
    order: string;
    descending: string;
    ascending: string;
    applyFilters: string;
    reset: string;
    closeFilters: string;
  };
  values: {
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy: string;
    sortOrder: string;
  };
}

export function CatalogFilters({
  locale,
  labels,
  values,
}: CatalogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = Boolean(
    values.search ||
      values.minPrice ||
      values.maxPrice ||
      values.sortBy !== "createdAt" ||
      values.sortOrder !== "desc",
  );

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
        <Button
          type="button"
          variant="outline"
          aria-expanded={isOpen}
          aria-controls="catalog-filter-panel"
          onClick={() => setIsOpen((open) => !open)}
          className="h-10 gap-2 rounded-xl px-4"
        >
          {isOpen ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
          {isOpen ? labels.closeFilters : labels.filters}
          {hasActiveFilters ? (
            <span className="size-1.5 rounded-full bg-primary" aria-label="Active filters" />
          ) : null}
        </Button>
        {hasActiveFilters ? (
          <Link
            href="/products"
            className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {labels.reset}
          </Link>
        ) : null}
      </div>

      <aside
        id="catalog-filter-panel"
        aria-label={labels.filters}
        className={`rounded-2xl border border-border/80 bg-card p-4 shadow-sm shadow-black/[0.025] sm:p-5 lg:sticky lg:top-24 lg:block lg:p-5 ${isOpen ? "block" : "hidden"}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight">{labels.filters}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {locale === "ar" ? "خصص النتائج حسب احتياجك" : "Refine the results to your needs"}
            </p>
          </div>
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" />
          </span>
        </div>

        <form method="get" className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="catalog-search" className="text-xs font-semibold">
              {labels.searchLabel}
            </label>
            <input
              id="catalog-search"
              type="search"
              name="search"
              defaultValue={values.search}
              maxLength={150}
              placeholder={labels.searchPlaceholder}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold">{locale === "ar" ? "نطاق السعر" : "Price range"}</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {locale === "ar" ? "حدد الحد الأدنى والأعلى للسعر" : "Set your preferred minimum and maximum"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="min-w-0 space-y-1.5">
                <span className="text-[11px] text-muted-foreground">{labels.minPrice}</span>
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  step="any"
                  defaultValue={values.minPrice}
                  placeholder="0"
                  className="h-10 w-full min-w-0 rounded-xl border border-input bg-background px-2.5 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
                />
              </label>
              <label className="min-w-0 space-y-1.5">
                <span className="text-[11px] text-muted-foreground">{labels.maxPrice}</span>
                <input
                  type="number"
                  name="maxPrice"
                  min="0"
                  step="any"
                  defaultValue={values.maxPrice}
                  placeholder="—"
                  className="h-10 w-full min-w-0 rounded-xl border border-input bg-background px-2.5 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="catalog-sort" className="text-xs font-semibold">
              {labels.sortBy}
            </label>
            <select
              id="catalog-sort"
              name="sortBy"
              defaultValue={values.sortBy}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
            >
              <option value="createdAt">{labels.newest}</option>
              <option value="price">{labels.price}</option>
              <option value="name">{labels.name}</option>
            </select>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold">{labels.order}</legend>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1">
              {(["desc", "asc"] as const).map((order) => (
                <label
                  key={order}
                  className={`flex h-9 cursor-pointer items-center justify-center rounded-lg px-2 text-xs font-medium transition ${values.sortOrder === order ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <input
                    type="radio"
                    name="sortOrder"
                    value={order}
                    defaultChecked={values.sortOrder === order}
                    className="sr-only"
                  />
                  {order === "desc" ? labels.descending : labels.ascending}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-2 border-t border-border/70 pt-4">
            <Button type="submit" className="h-10 rounded-xl">
              {labels.applyFilters}
            </Button>
            <Button asChild type="button" variant="outline" className="h-10 rounded-xl">
              <Link href="/products">{labels.reset}</Link>
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
