import type { ReactNode } from "react";
import { StorefrontFooter } from "./storefront-footer";
import { StorefrontHeader } from "./storefront-header";

interface StorefrontLayoutProps {
  children: ReactNode;
}

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontHeader />
      {children}
      <StorefrontFooter />
    </div>
  );
}
