export function ProductDetailsSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1440px] animate-pulse overflow-x-clip px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-5 h-4 w-48 rounded bg-muted sm:mb-7" />

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-10 xl:gap-14">
        <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[76px_minmax(0,1fr)]">
          <div className="order-2 flex gap-2 overflow-hidden lg:order-1 lg:flex-col">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="image-skeleton-shimmer size-[4.25rem] shrink-0 rounded-xl sm:size-[4.75rem] lg:size-[4.5rem]"
              />
            ))}
          </div>
          <div className="image-skeleton-shimmer order-1 aspect-square rounded-2xl sm:rounded-3xl lg:order-2" />
        </div>

        <div className="space-y-5 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-6 lg:border-0 lg:bg-transparent lg:p-0 lg:py-2">
          <div className="h-5 w-28 rounded-full bg-muted" />
          <div className="h-9 w-4/5 rounded-lg bg-muted sm:h-11" />
          <div className="h-8 w-40 rounded-lg bg-muted" />
          <div className="grid grid-cols-1 gap-3 rounded-2xl bg-muted/60 p-4 sm:grid-cols-2">
            <div className="h-10 rounded-lg bg-muted" />
            <div className="h-10 rounded-lg bg-muted" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-11/12 rounded bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
          </div>
          <div className="h-12 rounded-xl bg-muted" />
          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
            <div className="h-12 rounded-xl bg-muted" />
            <div className="h-12 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
