import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/features/categories/types/category.types";

interface CategoryCardProps {
  category: Category;
  labels: { explore: string; products: string; subcategories: string };
}

export function CategoryCard({ category, locale, labels }: CategoryCardProps) {
  const count = category.totalProductCount ?? category.productCount ?? 0;
  const children = category.children ?? [];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm shadow-black/[0.025] transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <Link href={`/categories/${category.slug}`} className="relative block aspect-[5/3] overflow-hidden bg-muted" aria-label={`${labels.explore} ${category.name}`}>
        {category.image ? (
          <Image src={category.image} alt={category.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-primary/10 via-muted to-primary/5">
            <span className="text-4xl font-bold text-primary/40">{category.name.slice(0, 1)}</span>
          </div>
        )}
        <span className="absolute bottom-3 end-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          {count} {labels.products}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
            <Link href={`/categories/${category.slug}`}>{category.name}</Link>
          </h2>
          {category.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
          ) : null}
          {children.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{labels.subcategories}</p>
              <div className="flex flex-wrap gap-1.5">
                {children.slice(0, 4).map((child) => (
                  <Link key={child._id} href={`/categories/${child.slug}`} className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium transition hover:border-primary/40 hover:text-primary">
                    {child.name}
                  </Link>
                ))}
                {children.length > 4 ? <span className="px-1 py-1 text-[11px] text-muted-foreground">+{children.length - 4}</span> : null}
              </div>
            </div>
          ) : null}
        </div>
        <Link href={`/categories/${category.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {labels.explore}<span aria-hidden="true" className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}
