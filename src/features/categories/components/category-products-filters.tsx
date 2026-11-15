import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryProductsFiltersProps {
  basePath: string;
  labels: {
    filters: string; search: string; searchPlaceholder: string; minPrice: string;
    maxPrice: string; sortBy: string; newest: string; price: string; name: string;
    order: string; ascending: string; descending: string; apply: string; reset: string;
  };
  values: { search?: string; minPrice?: string; maxPrice?: string; sortBy: string; sortOrder: string };
}

export function CategoryProductsFilters({ basePath, labels, values }: CategoryProductsFiltersProps) {
  return (
    <aside className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm shadow-black/[0.025] lg:sticky lg:top-24 lg:p-5">
      <div className="mb-5">
        <h2 className="text-base font-bold tracking-tight">{labels.filters}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{labels.search}</p>
      </div>
      <form method="get" action={basePath} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-semibold">{labels.search}</span>
          <Input name="search" type="search" defaultValue={values.search} maxLength={150} placeholder={labels.searchPlaceholder} className="h-10 rounded-xl" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="min-w-0 space-y-2">
            <span className="block text-xs font-semibold">{labels.minPrice}</span>
            <Input name="minPrice" type="number" min="0" step="any" defaultValue={values.minPrice} placeholder="0" className="h-10 min-w-0 rounded-xl" />
          </label>
          <label className="min-w-0 space-y-2">
            <span className="block text-xs font-semibold">{labels.maxPrice}</span>
            <Input name="maxPrice" type="number" min="0" step="any" defaultValue={values.maxPrice} placeholder={labels.maxPrice} className="h-10 min-w-0 rounded-xl" />
          </label>
        </div>
        <label className="block space-y-2">
          <span className="text-xs font-semibold">{labels.sortBy}</span>
          <Select name="sortBy" defaultValue={values.sortBy}>
            <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder={labels.sortBy} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">{labels.newest}</SelectItem>
              <SelectItem value="price">{labels.price}</SelectItem>
              <SelectItem value="name">{labels.name}</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-semibold">{labels.order}</span>
          <Select name="sortOrder" defaultValue={values.sortOrder}>
            <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder={labels.order} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{labels.descending}</SelectItem>
              <SelectItem value="asc">{labels.ascending}</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <div className="grid grid-cols-2 gap-2 border-t border-border/70 pt-4">
          <Button type="submit" className="h-10 rounded-xl">{labels.apply}</Button>
          <Button asChild type="button" variant="outline" className="h-10 rounded-xl"><Link href={basePath}>{labels.reset}</Link></Button>
        </div>
      </form>
    </aside>
  );
}
