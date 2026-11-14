"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Maximize,
  X,
} from "lucide-react";
import { ImageWithSkeleton } from "@/components/storefront/image-with-skeleton";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  labels: {
    imageAlt: string;
    previousImage: string;
    nextImage: string;
    imageNumber: string;
    fullscreen: string;
    closeFullscreen: string;
    thumbnails: string;
  };
}

export function ProductGallery({
  images,
  productName,
  labels,
}: ProductGalleryProps) {
  const galleryImages = images.filter(
    (image): image is string =>
      typeof image === "string" && image.trim().length > 0,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const activeImage = galleryImages[activeIndex];

  useEffect(() => {
    if (!isFullscreenOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFullscreenOpen(false);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === 0 ? galleryImages.length - 1 : current - 1,
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === galleryImages.length - 1 ? 0 : current + 1,
        );
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [galleryImages.length, isFullscreenOpen]);

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1,
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1,
    );
  }

  const imageCounter = labels.imageNumber
    .replace("{current}", String(activeIndex + 1))
    .replace("{total}", String(galleryImages.length));

  return (
    <>
      <section className="min-w-0" aria-label={labels.imageAlt}>
        <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[76px_minmax(0,1fr)]">
          {galleryImages.length > 1 ? (
            <div
              aria-label={labels.thumbnails}
              className="order-2 flex min-w-0 gap-2 overflow-x-auto pb-1 lg:order-1 lg:max-h-[min(42rem,calc(100vh-10rem))] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pe-1 lg:pb-0"
            >
              {galleryImages.map((image, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={labels.imageNumber
                      .replace("{current}", String(index + 1))
                      .replace("{total}", String(galleryImages.length))}
                    aria-pressed={isActive}
                    className={`relative size-[4.25rem] shrink-0 overflow-hidden rounded-xl border bg-muted/40 transition sm:size-[4.75rem] lg:size-[4.5rem] ${isActive ? "border-primary ring-2 ring-primary/20" : "border-border/70 hover:border-primary/50"}`}
                  >
                    <ImageWithSkeleton
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      unoptimized
                      sizes="76px"
                      className="object-contain p-1.5"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="order-1 min-w-0 lg:order-2">
            <div className="group relative isolate aspect-square w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/30 sm:rounded-3xl">
              {activeImage ? (
                <ImageWithSkeleton
                  src={activeImage}
                  alt={productName}
                  priority
                  unoptimized
                  sizes="(max-width: 1023px) 100vw, 55vw"
                  className="object-contain p-4 sm:p-7 lg:p-9"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <ImageIcon className="size-14" strokeWidth={1.2} />
                  <span className="text-sm">{labels.imageAlt}</span>
                </div>
              )}

              {galleryImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    aria-label={labels.previousImage}
                    className="absolute start-3 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background sm:size-10 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <ChevronLeft className="size-4 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label={labels.nextImage}
                    className="absolute end-3 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background sm:size-10 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <ChevronRight className="size-4 rtl:rotate-180" />
                  </button>
                </>
              ) : null}

              {activeImage ? (
                <button
                  type="button"
                  onClick={() => setIsFullscreenOpen(true)}
                  aria-label={labels.fullscreen}
                  title={labels.fullscreen}
                  className="absolute bottom-3 start-3 z-20 grid size-10 place-items-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm backdrop-blur transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Maximize className="size-4" />
                </button>
              ) : null}

              {galleryImages.length > 1 ? (
                <span className="absolute bottom-3 end-3 z-20 rounded-full border border-border/60 bg-background/90 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-foreground shadow-sm backdrop-blur">
                  {imageCounter}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {isFullscreenOpen && activeImage ? (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-slate-950 p-3 text-white sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={labels.fullscreen}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsFullscreenOpen(false);
            }
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 pb-3 sm:pb-4">
            <p className="min-w-0 truncate text-sm font-semibold">
              {productName}
            </p>
            <button
              type="button"
              onClick={() => setIsFullscreenOpen(false)}
              aria-label={labels.closeFullscreen}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <ImageWithSkeleton
              src={activeImage}
              alt={productName}
              unoptimized
              sizes="100vw"
              className="object-contain p-1 sm:p-3"
            />
          </div>

          {galleryImages.length > 1 ? (
            <div className="flex shrink-0 items-center justify-center gap-3 pt-3 sm:pt-4">
              <button
                type="button"
                onClick={showPrevious}
                aria-label={labels.previousImage}
                className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20"
              >
                <ChevronLeft className="size-5 rtl:rotate-180" />
              </button>
              <span className="min-w-20 text-center text-xs font-semibold tabular-nums">
                {imageCounter}
              </span>
              <button
                type="button"
                onClick={showNext}
                aria-label={labels.nextImage}
                className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20"
              >
                <ChevronRight className="size-5 rtl:rotate-180" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
