export default function SearchLoading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center">
        <div className="image-skeleton-shimmer mx-auto h-3 w-32 rounded-md" />
        <div className="image-skeleton-shimmer mx-auto h-10 w-64 max-w-full rounded-lg" />
        <div className="image-skeleton-shimmer mx-auto h-4 w-80 max-w-full rounded-md" />
        <div className="image-skeleton-shimmer mx-auto mt-6 h-12 w-full max-w-2xl rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="image-skeleton-shimmer aspect-square rounded-2xl" />
            <div className="image-skeleton-shimmer h-3 w-4/5 rounded-md" />
            <div className="image-skeleton-shimmer h-4 w-1/2 rounded-md" />
          </div>
        ))}
      </div>
    </main>
  );
}
