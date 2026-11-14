export function ProductDetailsSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1440px] animate-pulse px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-7 h-4 w-48 rounded bg-muted" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square rounded-3xl bg-muted" />
        <div className="space-y-5 py-2">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-9 w-3/4 rounded bg-muted" />
          <div className="h-7 w-40 rounded bg-muted" />
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="h-12 rounded-xl bg-muted" />
          <div className="h-12 rounded-xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
