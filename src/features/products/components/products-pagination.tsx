import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { CatalogSearchParams } from "@/features/products/api/catalog.server";
import type { ProductListResponse } from "@/features/products/types/product.types";

interface ProductsPaginationProps {
  pagination: ProductListResponse["pagination"];
  searchParams: CatalogSearchParams;
  labels: { previous: string; next: string; page: string; of: string; ariaLabel: string };
}

function buildPageHref(searchParams: CatalogSearchParams, page: number) {
  const query = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "page" || value === undefined) return;
    query.set(key, Array.isArray(value) ? value[0] : value);
  });
  query.set("page", String(page));
  return `/products?${query.toString()}`;
}

export function ProductsPagination({ pagination, searchParams, labels }: ProductsPaginationProps) {
  if (pagination.totalPages <= 1) return null;
  return (
    <nav aria-label={labels.ariaLabel} className="mt-10 flex items-center justify-center gap-3">
      {pagination.hasPreviousPage ? (
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={buildPageHref(searchParams, pagination.page - 1)}>{labels.previous}</Link>
        </Button>
      ) : <Button variant="outline" className="rounded-xl" disabled>{labels.previous}</Button>}
      <span className="min-w-24 text-center text-sm text-muted-foreground">
        {labels.page} <strong className="text-foreground">{pagination.page}</strong> {labels.of} {pagination.totalPages}
      </span>
      {pagination.hasNextPage ? (
        <Button asChild className="rounded-xl">
          <Link href={buildPageHref(searchParams, pagination.page + 1)}>{labels.next}</Link>
        </Button>
      ) : <Button className="rounded-xl" disabled>{labels.next}</Button>}
    </nav>
  );
}
