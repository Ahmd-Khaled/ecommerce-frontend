import { ProductCardSkeleton } from "@/components/storefront/product-card-skeleton";

export function ProductsPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-7 border-b border-border/70 pb-6 sm:mb-8 sm:pb-8">
        <div className="image-skeleton-shimmer mb-3 h-3 w-36 rounded-md" />
        <div className="image-skeleton-shimmer h-9 w-64 rounded-lg" />
        <div className="image-skeleton-shimmer mt-3 h-4 w-80 max-w-full rounded-md" />
      </div>
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
        <div className="space-y-4 rounded-2xl border border-border/80 p-5">
          <div className="image-skeleton-shimmer h-5 w-28 rounded-md" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="image-skeleton-shimmer h-3 w-20 rounded-md" />
              <div className="image-skeleton-shimmer h-11 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5">
          {Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)}
        </div>
      </div>
    </main>
  );
}
