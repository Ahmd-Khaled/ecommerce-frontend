export default function CategoriesLoading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8" aria-busy="true">
      <header className="mb-8 border-b border-border/70 pb-6 sm:mb-10 sm:pb-8">
        <div className="image-skeleton-shimmer mb-3 h-3 w-28 rounded-md" />
        <div className="image-skeleton-shimmer h-9 w-64 max-w-full rounded-lg" />
        <div className="image-skeleton-shimmer mt-3 h-4 w-80 max-w-full rounded-md" />
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="overflow-hidden rounded-2xl border border-border/80">
            <div className="image-skeleton-shimmer aspect-[5/3] rounded-none" />
            <div className="space-y-3 p-4 sm:p-5">
              <div className="image-skeleton-shimmer h-5 w-2/3 rounded-md" />
              <div className="image-skeleton-shimmer h-3 w-full rounded-md" />
              <div className="image-skeleton-shimmer h-3 w-4/5 rounded-md" />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
