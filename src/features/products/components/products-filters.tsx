"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const PRICE_SLIDER_MAX = 100_000;

interface ProductsFiltersProps {
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

function parsePrice(value: string | undefined, fallback: number) {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

interface FilterFormProps extends ProductsFiltersProps {
  onClose?: () => void;
  onApplied?: () => void;
}

function FilterForm({
  locale,
  labels,
  values,
  onClose,
  onApplied,
}: FilterFormProps) {
  const [minPrice, setMinPrice] = useState(() => parsePrice(values.minPrice, 0));
  const [maxPrice, setMaxPrice] = useState(() =>
    parsePrice(values.maxPrice, PRICE_FILTER_MAX),
  );
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">(
    values.sortOrder === "asc" ? "asc" : "desc",
  );

  const normalizedMin = Math.min(minPrice, maxPrice);
  const normalizedMax = Math.max(minPrice, maxPrice);
  const sliderMin = Math.min(normalizedMin, PRICE_SLIDER_MAX);
  const sliderMax = Math.min(normalizedMax, PRICE_SLIDER_MAX);
  const numberFormat = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  });

  function updateMinPrice(value: string) {
    const parsed = Number(value);
    if (value.trim() === "" || !Number.isFinite(parsed)) {
      setMinPrice(0);
      return;
    }
    const nextValue = Math.max(0, parsed);
    setMinPrice(Math.min(nextValue, maxPrice));
  }

  function updateMaxPrice(value: string) {
    const parsed = Number(value);
    if (value.trim() === "" || !Number.isFinite(parsed)) {
      setMaxPrice(minPrice);
      return;
    }
    const nextValue = Math.max(0, parsed);
    setMaxPrice(Math.max(nextValue, minPrice));
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">{labels.filters}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "ar"
              ? "خصص النتائج حسب احتياجك"
              : "Refine the results to your needs"}
          </p>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={labels.closeFilters}
            className="size-9 rounded-xl"
          >
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
          <label htmlFor="catalog-search" className="text-xs font-semibold">
            {labels.searchLabel}
          </label>
          <Input
            id="catalog-search"
            type="search"
            name="search"
            defaultValue={values.search}
            maxLength={150}
            placeholder={labels.searchPlaceholder}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-xs placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
          />
        </div>

        <section className="space-y-4" aria-labelledby="catalog-price-heading">
          <div>
            <h3 id="catalog-price-heading" className="text-xs font-semibold">
              {locale === "ar" ? "نطاق السعر" : "Price range"}
            </h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {locale === "ar"
                ? "اسحب المؤشرات أو أدخل السعر مباشرة"
                : "Drag the handles or enter prices below"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <label className="min-w-0 space-y-1.5">
              <span className="block text-[10px] font-medium text-muted-foreground">
                {labels.minPrice}
              </span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={undefined}
                step={1}
                value={normalizedMin}
                onChange={(event) => updateMinPrice(event.target.value)}
                aria-label={labels.minPrice}
                placeholder="0"
                className="h-10 w-full min-w-0 rounded-xl border border-input bg-background px-2.5 text-xs font-semibold tabular-nums outline-none transition placeholder:text-[10px] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
              />
            </label>
            <label className="min-w-0 space-y-1.5">
              <span className="block text-[10px] font-medium text-muted-foreground">
                {labels.maxPrice}
              </span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={undefined}
                step={1}
                value={normalizedMax}
                onChange={(event) => updateMaxPrice(event.target.value)}
                aria-label={labels.maxPrice}
                placeholder={String(PRICE_SLIDER_MAX)}
                className="h-10 w-full min-w-0 rounded-xl border border-input bg-background px-2.5 text-xs font-semibold tabular-nums outline-none transition placeholder:text-[10px] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
              />
            </label>
          </div>

          <Slider
            aria-label={locale === "ar" ? "نطاق السعر" : "Price range"}
            dir="ltr"
            min={0}
            max={undefined}
            step={1}
            minStepsBetweenThumbs={0}
            value={[sliderMin, sliderMax]}
            onValueChange={([nextMin, nextMax]) => {
              setMinPrice(nextMin);
              setMaxPrice(nextMax);
            }}
            className="py-2"
          />

          <div
            className="flex justify-between text-[10px] tabular-nums text-muted-foreground"
            dir="ltr"
          >
            <span>0</span>
            <span>{numberFormat.format(PRICE_SLIDER_MAX)}</span>
          </div>

          {normalizedMin > 0 ? (
            <input type="hidden" name="minPrice" value={normalizedMin} />
          ) : null}
          {normalizedMax !== PRICE_SLIDER_MAX ? (
            <input type="hidden" name="maxPrice" value={normalizedMax} />
          ) : null}
        </section>

        <div className="space-y-2">
          <label htmlFor="catalog-sort" className="text-xs font-semibold">
            {labels.sortBy}
          </label>
          <Select name="sortBy" defaultValue={values.sortBy}>
            <SelectTrigger
              id="catalog-sort"
              aria-label={labels.sortBy}
              className="h-10 w-full rounded-xl px-3 text-xs"
            >
              <SelectValue placeholder={labels.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">{labels.newest}</SelectItem>
              <SelectItem value="price">{labels.price}</SelectItem>
              <SelectItem value="name">{labels.name}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold">{labels.order}</legend>
          <input type="hidden" name="sortOrder" value={sortOrder} />
          <div
            className="grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1"
            role="group"
            aria-label={labels.order}
          >
            {(["desc", "asc"] as const).map((order) => {
              const isSelected = sortOrder === order;

              return (
                <Button
                  key={order}
                  type="button"
                  variant="ghost"
                  aria-pressed={isSelected}
                  onClick={() => setSortOrder(order)}
                  className={`h-9 w-full rounded-lg px-2 text-xs font-medium shadow-none transition-colors hover:bg-background/70 hover:text-foreground ${isSelected ? "bg-background text-foreground shadow-sm hover:bg-background" : "text-muted-foreground"}`}
                >
                  {order === "desc" ? labels.descending : labels.ascending}
                </Button>
              );
            })}
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
    </>
  );
}

export function ProductsFilters({ locale, labels, values }: ProductsFiltersProps) {
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
          aria-controls="mobile-catalog-filter-panel"
          onClick={() => setIsOpen(true)}
          className="h-10 gap-2 rounded-xl px-4"
        >
          <SlidersHorizontal className="size-4" />
          {labels.filters}
          {hasActiveFilters ? (
            <span className="size-1.5 rounded-full bg-primary" />
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

      <aside className="hidden rounded-2xl border border-border/80 bg-card p-4 shadow-sm shadow-black/[0.025] lg:sticky lg:top-24 lg:block lg:p-5">
        <FilterForm locale={locale} labels={labels} values={values} />
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label={labels.closeFilters}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 size-full bg-slate-950/50 backdrop-blur-[2px]"
          />
          <aside
            id="mobile-catalog-filter-panel"
            role="dialog"
            aria-modal="true"
            aria-label={labels.filters}
            className="absolute inset-y-0 start-0 z-10 w-[min(88vw,380px)] overflow-y-auto border-e border-border bg-card p-5 shadow-2xl"
          >
            <FilterForm
              locale={locale}
              labels={labels}
              values={values}
              onClose={() => setIsOpen(false)}
              onApplied={() => setIsOpen(false)}
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
