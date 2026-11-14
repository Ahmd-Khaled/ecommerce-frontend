"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Minus,
  Plus,
  RotateCcw,
  X,
  ZoomIn,
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
    zoom: string;
    closeZoom: string;
    zoomIn: string;
    zoomOut: string;
    resetZoom: string;
    thumbnails: string;
  };
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export function ProductGallery({
  images,
  productName,
  labels,
}: ProductGalleryProps) {
  const galleryImages = images.filter(
    (image): image is string => typeof image === "string" && image.length > 0,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const activeImage = galleryImages[activeIndex];

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

  function openZoom() {
    setZoom(MIN_ZOOM);
    setIsZoomOpen(true);
  }

  function closeZoom() {
    setIsZoomOpen(false);
    setZoom(MIN_ZOOM);
  }

  useEffect(() => {
    if (!isZoomOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsZoomOpen(false);
        setZoom(MIN_ZOOM);
      }
      if (event.key === "+" || event.key === "=") {
        setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP));
      }
      if (event.key === "-") {
        setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP));
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isZoomOpen]);

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
            <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/30 sm:rounded-3xl">
              {activeImage ? (
                <ImageWithSkeleton
                  src={activeImage}
                  alt={productName}
                  priority
                  loading="eager"
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
                    className="absolute start-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border/70 bg-background/90 text-foreground opacity-100 shadow-sm backdrop-blur transition hover:bg-background sm:size-10 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <ChevronLeft className="size-4 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label={labels.nextImage}
                    className="absolute end-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border/70 bg-background/90 text-foreground opacity-100 shadow-sm backdrop-blur transition hover:bg-background sm:size-10 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <ChevronRight className="size-4 rtl:rotate-180" />
                  </button>
                </>
              ) : null}

              {activeImage ? (
                <button
                  type="button"
                  onClick={openZoom}
                  aria-label={labels.zoom}
                  className="absolute bottom-3 start-3 inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-background/95 px-3 text-xs font-semibold text-foreground shadow-sm backdrop-blur transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ZoomIn className="size-4" />
                  <span className="hidden sm:inline">{labels.zoom}</span>
                </button>
              ) : null}

              {galleryImages.length > 1 ? (
                <span className="absolute bottom-3 end-3 rounded-full border border-border/60 bg-background/90 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-foreground shadow-sm backdrop-blur">
                  {labels.imageNumber
                    .replace("{current}", String(activeIndex + 1))
                    .replace("{total}", String(galleryImages.length))}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {isZoomOpen && activeImage ? (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-slate-950/95 p-3 text-white backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={labels.zoom}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeZoom();
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 pb-3 sm:pb-4">
            <p className="min-w-0 truncate text-sm font-semibold">
              {productName}
            </p>
            <button
              type="button"
              onClick={closeZoom}
              aria-label={labels.closeZoom}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 overflow-auto rounded-xl">
            <div
              className="relative mx-auto aspect-square max-h-full"
              style={{
                width: `${zoom * 100}%`,
                minWidth: "min(100%, 24rem)",
              }}
            >
              <ImageWithSkeleton
                src={activeImage}
                alt={productName}
                unoptimized
                sizes="100vw"
                className="object-contain p-2 sm:p-5"
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={() => setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP))}
              disabled={zoom <= MIN_ZOOM}
              aria-label={labels.zoomOut}
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-14 text-center text-xs font-semibold tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP))}
              disabled={zoom >= MAX_ZOOM}
              aria-label={labels.zoomIn}
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(MIN_ZOOM)}
              aria-label={labels.resetZoom}
              className="ms-1 inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-medium transition hover:bg-white/20"
            >
              <RotateCcw className="size-3.5" />
              {labels.resetZoom}
            </button>
          </div>
          <p className="sr-only" aria-live="polite">
            {Math.round(zoom * 100)}%
          </p>
        </div>
      ) : null}
    </>
  );
}
