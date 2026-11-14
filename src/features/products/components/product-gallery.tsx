"use client";

import { useState } from "react";
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithSkeleton } from "@/components/storefront/image-with-skeleton";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  labels: {
    imageAlt: string;
    previousImage: string;
    nextImage: string;
    imageNumber: string;
  };
}

export function ProductGallery({
  images,
  productName,
  labels,
}: ProductGalleryProps) {
  const galleryImages = images.filter(
    (image): image is string => typeof image === "string" && image.length > 0,
  );
  const [activeIndex, setActiveIndex] = useState(0);
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

  return (
    <section className="min-w-0" aria-label={labels.imageAlt}>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/70 bg-muted/50">
        {activeImage ? (
          <ImageWithSkeleton
            src={activeImage}
            alt={productName}
            priority
            loading="eager"
            unoptimized
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-5 sm:p-8"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
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
              className="absolute start-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label={labels.nextImage}
              className="absolute end-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
            >
              <ChevronRight className="size-4 rtl:rotate-180" />
            </button>
            <span className="absolute bottom-3 end-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold tabular-nums text-foreground shadow-sm backdrop-blur">
              {labels.imageNumber
                .replace("{current}", String(activeIndex + 1))
                .replace("{total}", String(galleryImages.length))}
            </span>
          </>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={labels.imageNumber
                .replace("{current}", String(index + 1))
                .replace("{total}", String(galleryImages.length))}
              aria-pressed={activeIndex === index}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-muted/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeIndex === index ? "border-primary ring-2 ring-primary/20" : "border-border/70 hover:border-primary/50"}`}
            >
              <ImageWithSkeleton
                src={image}
                alt={`${productName} ${index + 1}`}
                unoptimized
                sizes="96px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
