"use client";

import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Languages, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function StorefrontHeader() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const isArabic = locale === "ar";

  function toggleLocale() {
    router.replace(pathname, { locale: isArabic ? "en" : "ar" });
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href={isArabic ? "/ar" : "/en"}
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={isArabic ? "الصفحة الرئيسية" : "Store homepage"}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            S
          </span>
          <span className="truncate text-base font-bold tracking-tight">
            {isArabic ? "متجرنا" : "Storefront"}
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a className="transition-colors hover:text-foreground" href="#home">
            {isArabic ? "الرئيسية" : "Home"}
          </a>
          <a className="transition-colors hover:text-foreground" href="#categories">
            {isArabic ? "التصنيفات" : "Categories"}
          </a>
          <a className="transition-colors hover:text-foreground" href="#products">
            {isArabic ? "المنتجات" : "Products"}
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleLocale}
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
            title={isArabic ? "English" : "العربية"}
          >
            <Languages />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isArabic ? "تغيير المظهر" : "Toggle theme"}
            title={isArabic ? "تغيير المظهر" : "Toggle theme"}
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </header>
  );
}
