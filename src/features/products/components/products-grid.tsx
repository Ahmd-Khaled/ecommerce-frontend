import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import type { Product } from "@/features/products/types/product.types";

interface ProductsGridProps {
  products: Product[]; currency: string; currencyExponent: number; locale: string;
  emptyTitle: string; emptyDescription: string; viewAllLabel: string;
}

export function ProductsGrid({ products, currency, currencyExponent, locale, emptyTitle, emptyDescription, viewAllLabel }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <span className="text-2xl" aria-hidden="true">⌕</span>
        </span>
        <h2 className="text-lg font-bold">{emptyTitle}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{emptyDescription}</p>
        <ButtonLink href="/products">{viewAllLabel}</ButtonLink>
      </section>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} currency={currency}
          currencyExponent={currencyExponent} locale={locale} priority={index === 0} />
      ))}
    </div>
  );
}

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted">{children}</Link>;
}
