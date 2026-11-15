import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  const t = useTranslations("Storefront");

  return (
    <main className="flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <section className="w-full max-w-[460px]">
        <Link
          href="/"
          className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-base font-black text-primary-foreground">
            S
          </span>
          <span className="text-base font-extrabold tracking-tight">{t("brand")}</span>
        </Link>

        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xl shadow-slate-950/[0.04] sm:p-8">
          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          {children}

          <div className="mt-6 border-t border-border/70 pt-5 text-center text-xs text-muted-foreground">
            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}
