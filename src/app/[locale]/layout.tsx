import { Providers } from "@/app/providers";
import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alexandria } from "next/font/google";
import "../globals.css";

// Locale params are required to render the document-level lang and dir attributes.
// This route is allowed to resolve them before responding.
export const instant = false;

export const metadata: Metadata = {
  title: {
    default: "Storefront",
    template: "%s | Storefront",
  },
  description: "Discover products, collections and everyday essentials.",
};

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-alexandria",
  weight: ["300", "400", "500", "600", "700", "800"],
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const direction = locale === "ar" ? "rtl" : "ltr";
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={alexandria.variable} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <StorefrontLayout>{children}</StorefrontLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
