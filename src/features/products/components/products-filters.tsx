"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface ProductsFiltersProps {
  locale: string;
  maxPriceLimit: number;
  labels: {
    filters: string; searchLabel: string; searchPlaceholder: string;
    minPrice: string; maxPrice: string; sortBy: string; newest: string;
    price: string; name: string; order: string; descending: string;
    ascending: string; applyFilters: string; reset: string; closeFilters: string;
  };
  values: {
    search?: string; minPrice?: string; maxPrice?: string;
    sortBy: string; sortOrder: string;
  };
}

function getInitialPrice(value: string | undefined, fallback: number) {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function FilterForm({
  locale, maxPriceLimit, labels, values, onClose, onApplied,
}: ProductsFiltersProps & { onClose?: () => void; onApplied?: () => void }) {
  const initialMin = getInitialPrice(values.minPrice, 0);
  const initialMax = getInitialPrice(values.maxPrice, maxPriceLimit);
  const sliderMax = Math.max(1, maxPriceLimit, initialMin, initialMax);
  const [minPrice, setMinPrice] = useState(Math.min(initialMin, sliderMax));
  const [maxPrice, setMaxPrice] = useState(Math.min(initialMax, sliderMax));
  const safeMaxPrice = Math.max(minPrice, maxPrice);
  const minPercent = (minPrice / sliderMax) * 100;
  const maxPercent = (safeMaxPrice / sliderMax) * 100;
  const numberFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">{labels.filters}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "ar" ? "خصص النتائج حسب احتياجك" : "Refine the results to your needs"}
          </p>
        </div>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon" onClick={onClose}
            aria-label={labels.closeFilters} className="size-9 rounded-xl">
            <X className="size-4" />
          </Button>
        ) : (
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" />
          </span>
        )}
      </div>
      <form method="get" onSubmit={onApplied} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="catalog-search" className="text-xs font-semibold">{labels.searchLabel}</label>
          <input id="catalog-search" type="search" name="search" defaultValue={values.search}
            maxLength={150} placeholder={labels.searchPlaceholder}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25" />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold">{locale === "ar" ? "نطاق السعر" : "Price range"}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {locale === "ar" ? "اسحب المؤشرات لتحديد نطاق السعر" : "Drag the handles to set your price range"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 rounded-xl bg-muted/60 px-3 py-2.5">
              <span className="block text-[10px] font-medium text-muted-foreground">{labels.minPrice}</span>
              <output className="mt-1 block truncate text-sm font-bold tabular-nums text-foreground">
                {numberFormat.format(minPrice)}
              </output>
            </div>
            <div className="min-w-0 rounded-xl bg-muted/60 px-3 py-2.5">
              <span className="block text-[10px] font-medium text-muted-foreground">{labels.maxPrice}</span>
              <output className="mt-1 block truncate text-sm font-bold tabular-nums text-foreground">
                {numberFormat.format(safeMaxPrice)}
              </output>
            </div>
          </div>

          <div className="price-range relative mx-1 h-7" dir="ltr"
            style={{ background: `linear-gradient(to right, var(--muted) ${minPercent}%, var(--primary) ${minPercent}%, var(--primary) ${maxPercent}%, var(--muted) ${maxPercent}%)` }}>
            <input
              aria-label={labels.minPrice}
              className="price-range-input"
              type="range"
              min={0}
              max={sliderMax}
              step={1}
              value={minPrice}
              onChange={(event) => setMinPrice(Math.min(Number(event.target.value), safeMaxPrice))}
              style={{ zIndex: minPrice > sliderMax - sliderMax * 0.08 ? 5 : 3 }}
            />
            <input
              aria-label={labels.maxPrice}
              className="price-range-input"
              type="range"
              min={0}
              max={sliderMax}
              step={1}
              value={safeMaxPrice}
              onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice))}
              style={{ zIndex: 4 }}
            />
          </div>
          <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground" dir="ltr">
            <span>0</span>
            <span>{numberFormat.format(sliderMax)}</span>
          </div>

          {minPrice > 0 ? <input type="hidden" name="minPrice" value={minPrice} /> : null}
          {safeMaxPrice < sliderMax || values.maxPrice ? (
            <input type="hidden" name="maxPrice" value={safeMaxPrice} />
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="catalog-sort" className="text-xs font-semibold">{labels.sortBy}</label>
          <select id="catalog-sort" name="sortBy" defaultValue={values.sortBy}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25">
            <option value="createdAt">{labels.newest}</option>
            <option value="price">{labels.price}</option>
            <option value="name">{labels.name}</option>
          </select>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold">{labels.order}</legend>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1">
            {(["desc", "asc"] as const).map((order) => (
              <label key={order} className={`flex h-9 cursor-pointer items-center justify-center rounded-lg px-2 text-xs font-medium transition ${values.sortOrder === order ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <input type="radio" name="sortOrder" value={order}
                  defaultChecked={values.sortOrder === order} className="sr-only" />
                {order === "desc" ? labels.descending : labels.ascending}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-2 border-t border-border/70 pt-4">
          <Button type="submit" className="h-10 rounded-xl">{labels.applyFilters}</Button>
          <Button asChild type="button" variant="outline" className="h-10 rounded-xl">
            <Link href="/products">{labels.reset}</Link>
          </Button>
        </div>
      </form>
    </>
  );
}

export function ProductsFilters({ locale, maxPriceLimit, labels, values }: ProductsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = Boolean(values.search || values.minPrice || values.maxPrice ||
    values.sortBy !== "createdAt" || values.sortOrder !== "desc");

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
        <Button type="button" variant="outline" aria-expanded={isOpen}
          aria-controls="mobile-catalog-filter-panel" onClick={() => setIsOpen(true)}
          className="h-10 gap-2 rounded-xl px-4">
          <SlidersHorizontal className="size-4" />
          {labels.filters}
          {hasActiveFilters ? <span className="size-1.5 rounded-full bg-primary" /> : null}
        </Button>
        {hasActiveFilters ? (
          <Link href="/products" className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {labels.reset}
          </Link>
        ) : null}
      </div>

      <aside className="hidden rounded-2xl border border-border/80 bg-card p-4 shadow-sm shadow-black/[0.025] lg:sticky lg:top-24 lg:block lg:p-5">
        <FilterForm locale={locale} maxPriceLimit={maxPriceLimit} labels={labels} values={values} />
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button type="button" aria-label={labels.closeFilters} onClick={() => setIsOpen(false)}
            className="absolute inset-0 size-full bg-slate-950/50 backdrop-blur-[2px]" />
          <aside id="mobile-catalog-filter-panel" role="dialog" aria-modal="true"
            aria-label={labels.filters}
            className="absolute inset-y-0 start-0 z-10 w-[min(88vw,380px)] overflow-y-auto border-e border-border bg-card p-5 shadow-2xl">
            <FilterForm locale={locale} maxPriceLimit={maxPriceLimit} labels={labels} values={values}
              onClose={() => setIsOpen(false)} onApplied={() => setIsOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
