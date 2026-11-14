"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type ImageWithSkeletonProps = {
  src: ImageProps["src"];
  alt: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
  className?: string;
};

export function ImageWithSkeleton({
  src,
  alt,
  sizes,
  priority = false,
  unoptimized = false,
  className = "object-cover",
}: ImageWithSkeletonProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    setStatus("loading");
  }, [src]);

  return (
    <span className="absolute inset-0 block overflow-hidden">
      {status !== "error" ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          unoptimized={unoptimized}
          sizes={sizes}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`transition-opacity duration-500 ${status === "loaded" ? "opacity-100" : "opacity-0"} ${className}`}
        />
      ) : null}

      {status !== "loaded" ? (
        <span
          aria-hidden="true"
          className="image-skeleton-shimmer absolute inset-0 z-10 block"
        />
      ) : null}
    </span>
  );
}
