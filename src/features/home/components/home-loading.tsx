import { ProductCardSkeleton } from "@/components/storefront/product-card-skeleton";

export function HomeLoading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] space-y-12 px-4 py-6 sm:space-y-16 sm:px-6 sm:py-9 lg:px-8">
      <div className="image-skeleton-shimmer aspect-[5/5.2] rounded-[1.75rem] sm:aspect-[16/7]" />

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-card p-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl px-1 py-2"
          >
            <div className="image-skeleton-shimmer size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="image-skeleton-shimmer h-3.5 w-4/5 rounded-md" />
              <div className="image-skeleton-shimmer h-3 w-3/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-5">
        <div className="space-y-2">
          <div className="image-skeleton-shimmer h-3 w-24 rounded-md" />
          <div className="image-skeleton-shimmer h-8 w-52 rounded-lg" />
          <div className="image-skeleton-shimmer h-4 w-72 max-w-full rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
