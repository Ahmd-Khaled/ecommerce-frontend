import { ProductCardSkeleton } from "@/components/storefront/product-card-skeleton";

export default function ProductsLoading() {
  return (
    <main
      aria-label="Loading products"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mb-8 space-y-3">
        <div className="image-skeleton-shimmer h-3 w-36 rounded-md" />
        <div className="image-skeleton-shimmer h-9 w-64 rounded-lg" />
        <div className="image-skeleton-shimmer h-4 w-80 max-w-full rounded-md" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-border/80 p-4 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="image-skeleton-shimmer h-3 w-20 rounded-md" />
            <div className="image-skeleton-shimmer h-10 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
