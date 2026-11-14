export default function CartLoading() {
  return (
    <main className="mx-auto min-h-[55vh] max-w-[1100px] px-4 py-12 sm:px-6">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    </main>
  );
}
