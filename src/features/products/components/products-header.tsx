interface ProductsHeaderProps {
  eyebrow: string; title: string; description: string;
  productCount: number; productCountLabel: string;
}

export function ProductsHeader({ eyebrow, title, description, productCount, productCountLabel }: ProductsHeaderProps) {
  return (
    <header className="mb-7 border-b border-border/70 pb-6 sm:mb-8 sm:pb-8">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
        </div>
        <div className="rounded-xl bg-muted/60 px-3.5 py-2 text-sm">
          <span className="font-bold tabular-nums text-foreground">{productCount}</span>
          <span className="ms-1.5 text-muted-foreground">{productCountLabel}</span>
        </div>
      </div>
    </header>
  );
}
