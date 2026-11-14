"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Heart,
  Languages,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function StorefrontHeader() {
  const locale = useLocale();
  const t = useTranslations("Storefront");
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const isArabic = locale === "ar";

  function toggleLocale() {
    router.replace(pathname, { locale: isArabic ? "en" : "ar" });
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!searchValue.trim()) return;
    toast.info(t("searchComingSoon"));
  }

  function showComingSoon(feature: string) {
    toast.info(feature);
  }

  const navigation = [
    { href: "/", label: t("home") },
    { href: "/categories", label: t("categories") },
    { href: "/products", label: t("products") },
  ];

  return (
    <>
      <div className="hidden bg-slate-950 text-slate-200 sm:block">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-6 text-[11px]">
          <p>{t("announcement")}</p>
          <p className="text-slate-400">{t("supportLine")}</p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 shadow-sm shadow-slate-950/[0.025] backdrop-blur-2xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:h-20 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-xl md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("home")}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary text-base font-black text-primary-foreground shadow-lg shadow-primary/20">
                S
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-base font-extrabold tracking-tight sm:text-lg">
                  {t("brand")}
                </span>
                <span className="block text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {t("brandTagline")}
                </span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-7 text-[13px] font-semibold text-muted-foreground lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-2 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="hidden h-11 min-w-0 max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 transition focus-within:border-primary/50 focus-within:bg-background lg:flex"
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="h-full min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] text-muted-foreground">
              ↵
            </kbd>
          </form>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => showComingSoon(t("wishlistComingSoon"))}
              aria-label={t("wishlist")}
              title={t("wishlist")}
              className="hidden size-10 rounded-xl sm:inline-flex"
            >
              <Heart className="size-[18px]" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => showComingSoon(t("accountComingSoon"))}
              aria-label={t("account")}
              title={t("account")}
              className="hidden size-10 rounded-xl sm:inline-flex"
            >
              <UserRound className="size-[18px]" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => showComingSoon(t("cartComingSoon"))}
              aria-label={t("cart")}
              title={t("cart")}
              className="relative size-10 rounded-xl"
            >
              <ShoppingBag className="size-[18px]" />
              <span className="absolute end-1 top-1 size-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
            <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleLocale}
              aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
              title={isArabic ? "English" : "العربية"}
              className="size-10 rounded-xl"
            >
              <Languages className="size-[18px]" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={isArabic ? "تغيير المظهر" : "Toggle theme"}
              title={isArabic ? "تغيير المظهر" : "Toggle theme"}
              className="size-10 rounded-xl"
            >
              {resolvedTheme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-border bg-background px-4 py-4 shadow-xl md:hidden">
            <form onSubmit={handleSearch} className="mb-4 flex h-11 items-center gap-2 rounded-xl border border-border bg-muted/60 px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
                className="h-full min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm" className="h-8 rounded-lg px-3 text-xs">
                {t("search")}
              </Button>
            </form>
            <nav className="grid grid-cols-3 gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-muted/70 px-3 py-3 text-center text-xs font-semibold transition hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
              <Button variant="outline" onClick={() => showComingSoon(t("wishlistComingSoon"))} className="rounded-xl">
                <Heart /> {t("wishlist")}
              </Button>
              <Button variant="outline" onClick={() => showComingSoon(t("accountComingSoon"))} className="rounded-xl">
                <UserRound /> {t("account")}
              </Button>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
