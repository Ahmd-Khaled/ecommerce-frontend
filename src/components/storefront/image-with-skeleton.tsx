"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ImageWithSkeletonProps = {
  src: ImageProps["src"];
  alt: string;
  fill?: true;
  sizes?: string;
  loading?: ImageProps["loading"];
  priority?: boolean;
  unoptimized?: boolean;
  className?: string;
};

export function ImageWithSkeleton(props: ImageWithSkeletonProps) {
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
  loading,
  priority = false,
  unoptimized = false,
  className = "object-cover",
}: ImageWithSkeletonProps) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <span className="absolute inset-0 block overflow-hidden">
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          loading={loading}
          priority={priority}
          unoptimized={unoptimized}
          sizes={sizes}
          onLoad={() => setHasLoaded(true)}
          onError={() => setHasError(true)}
          className={`relative z-10 opacity-100 ${className}`}
        />
      ) : null}

      {!hasLoaded && !hasError ? (
        <span
          aria-hidden="true"
          className="image-skeleton-shimmer absolute inset-0 z-0 block"
        />
      ) : null}
    </span>
  );
}
