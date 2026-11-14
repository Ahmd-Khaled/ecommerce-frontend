import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import type { Product } from "@/features/products/types/product.types";

interface RelatedProductsProps {
  products: Product[];
  currency: string;
  currencyExponent: number;
  locale: string;
  eyebrow: string;
  title: string;
  viewAllLabel: string;
}

export function RelatedProducts({
  products,
  currency,
  currencyExponent,
  locale,
  eyebrow,
  title,
  viewAllLabel,
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border/70 pt-9 sm:mt-16 sm:pt-12">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-lg font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
        </div>
        <Link
          href="/products"
          className="shrink-0 rounded-lg text-xs font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {viewAllLabel}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            currency={currency}
            currencyExponent={currencyExponent}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
