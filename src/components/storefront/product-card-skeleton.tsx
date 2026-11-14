"use client";

export function ProductCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="flex min-w-0 animate-in fade-in-0 duration-500 flex-col overflow-hidden rounded-[1.35rem] border border-border/80 bg-card shadow-sm"
    >
      <div className="image-skeleton-shimmer aspect-[4/4.25] w-full" />
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="image-skeleton-shimmer h-4 w-4/5 rounded-md" />
        <div className="image-skeleton-shimmer mt-2 h-4 w-3/5 rounded-md" />
        <div className="mt-4 flex items-center gap-2">
          <div className="image-skeleton-shimmer h-5 w-24 rounded-md" />
          <div className="image-skeleton-shimmer h-3 w-14 rounded-md" />
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <div className="image-skeleton-shimmer h-9 rounded-xl sm:h-10" />
          <div className="image-skeleton-shimmer h-9 rounded-xl sm:h-10" />
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3">
          <div className="image-skeleton-shimmer size-3.5 rounded-full" />
          <div className="image-skeleton-shimmer h-3 w-16 rounded-md" />
        </div>
      </div>
    </article>
  );
}
