"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ImageWithSkeletonProps = {
  src: ImageProps["src"];
  alt: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
  className?: string;
};

export function ImageWithSkeleton(props: ImageWithSkeletonProps) {
  // A keyed child resets its loading state when the source changes,
  // without a synchronous setState call inside an effect.
  const sourceKey =
    typeof props.src === "string"
      ? props.src
      : "src" in props.src
        ? props.src.src
        : String(props.src);

  return <ImageWithSkeletonContent key={sourceKey} {...props} />;
}

function ImageWithSkeletonContent({
  src,
  alt,
  sizes,
  priority = false,
  unoptimized = false,
  className = "object-cover",
}: ImageWithSkeletonProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

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
