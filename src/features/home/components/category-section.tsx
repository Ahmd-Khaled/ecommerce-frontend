import { ImageWithSkeleton } from "@/components/storefront/image-with-skeleton";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { HomepageCategory } from "../types/home.types";

interface CategorySectionProps {
  categories: HomepageCategory[];
}

export async function CategorySection({
  categories,
}: CategorySectionProps) {
  const t = await getTranslations("Home");

  if (categories.length === 0) return null;

  return (
    <section id="categories" className="scroll-mt-24 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
            {t("categoriesEyebrow")}
          </p>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-[1.75rem]">
            {t("categoriesTitle")}
          </h2>
          <p className="mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
            {t("categoriesDescription")}
          </p>
        </div>

        <Link
          href="/categories"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-[11px] font-semibold transition hover:border-primary/40 hover:text-primary sm:px-4 sm:text-xs"
        >
          {t("viewAll")}
          <ArrowRight className="size-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="home-category-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 sm:gap-6">
        {categories.map((category, index) => (
          <Link
            key={category._id}
            href={`/categories/${category.slug}`}
            className="group flex w-[6.7rem] shrink-0 snap-start flex-col items-center gap-3 text-center sm:w-32"
          >
            <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.6rem] border border-border/70 bg-card shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg">
              {category.image ? (
                <ImageWithSkeleton
                  src={category.image}
                  alt={category.name}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  unoptimized
                  sizes="128px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {category.name.charAt(0)}
                </span>
              )}
            </span>
            <span className="line-clamp-2 text-xs font-semibold leading-5 transition-colors group-hover:text-primary sm:text-sm">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
