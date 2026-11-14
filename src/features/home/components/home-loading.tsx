export function HomeLoading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] space-y-12 px-4 py-6 sm:space-y-16 sm:px-6 sm:py-9 lg:px-8">
      <div className="aspect-[5/5.2] animate-pulse rounded-[1.75rem] bg-muted sm:aspect-[16/7]" />
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-card p-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <section className="space-y-5">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] w-64 shrink-0 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
