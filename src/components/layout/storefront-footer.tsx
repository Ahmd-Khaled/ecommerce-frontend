import { useTranslations } from "next-intl";

export function StorefrontFooter() {
  const t = useTranslations("Storefront");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
        <div className="max-w-md">
          <p className="text-base font-bold tracking-tight">{t("brand")}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("footerDescription")}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <a className="transition-colors hover:text-foreground" href="#home">
            {t("home")}
          </a>
          <a className="transition-colors hover:text-foreground" href="#categories">
            {t("categories")}
          </a>
          <a className="transition-colors hover:text-foreground" href="#products">
            {t("products")}
          </a>
        </nav>

        <div className="border-t border-border pt-5 text-xs text-muted-foreground md:col-span-2">
          © {year} {t("brand")}. {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
