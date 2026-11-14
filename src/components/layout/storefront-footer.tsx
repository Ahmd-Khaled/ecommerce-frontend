import {
  ArrowUp,
  Headphones,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CurrentYear } from "./current-year";

export async function StorefrontFooter() {
  const t = await getTranslations("Storefront");

  const shoppingBenefits = [
    { icon: Truck, label: t("footerDelivery") },
    { icon: ShieldCheck, label: t("footerPayment") },
    { icon: RefreshCw, label: t("footerReturns") },
    { icon: Headphones, label: t("footerSupport") },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-card sm:mt-20">
      <div className="mx-auto max-w-[1440px] px-4 pb-6 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-12">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-[0.9rem] bg-primary text-lg font-black text-primary-foreground shadow-lg shadow-primary/20">
                S
              </span>
              <span>
                <span className="block text-lg font-extrabold tracking-tight text-foreground">
                  {t("brand")}
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t("brandTagline")}
                </span>
              </span>
            </Link>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {t("footerDescription")}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">
              {t("footerExploreTitle")}
            </h2>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-primary">
                {t("home")}
              </Link>
              <Link href="/categories" className="transition-colors hover:text-primary">
                {t("categories")}
              </Link>
              <Link href="/products" className="transition-colors hover:text-primary">
                {t("products")}
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">
              {t("footerShoppingTitle")}
            </h2>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">
              {shoppingBenefits.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.8} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">
              {t("footerHelpTitle")}
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {t("supportLine")}
            </p>
            <p className="mt-3 rounded-xl bg-muted/70 px-4 py-3 text-xs leading-6 text-muted-foreground">
              {t("footerHelpDescription")}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {t("brand")}. {t("copyright")}
          </p>

          <a
            href="#home"
            className="inline-flex items-center gap-2 self-start font-semibold transition-colors hover:text-primary sm:self-auto"
          >
            {t("backToTop")}
            <ArrowUp className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
