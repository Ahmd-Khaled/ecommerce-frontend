# Folder structure

```text
messages/                    English and Arabic website translations
public/                      Website static assets
src/
  app/
    [locale]/
      layout.tsx             Locale validation, direction, and providers
      page.tsx               Minimal website starting page
    globals.css              Shared design tokens and global styles
    layout.tsx               Root document, font, and metadata
    providers.tsx            Theme, React Query, and toast providers
  components/
    providers/               Reusable provider wrappers
    ui/                      Reusable UI primitives
  features/
    categories/              Read-only category API and response types
    home/                    Public homepage API, query hook, and types
    products/                Read-only product API and response types
  hooks/                     Shared responsive hook
  i18n/                      Locale routing, navigation, and request config
  lib/
    api/axios.ts             Shared HTTP client and error messages
    utils.ts                 Class name helper
  utils/formatCurrency.ts    Existing EGP display formatter
  proxy.ts                   Locale routing proxy
```

Add website features under `src/features/<feature>`, with API, types, hooks, and components as needed. Add public routes under `src/app/[locale]`. The homepage response includes currency and currencyExponent; respect those when rendering its prices instead of assuming EGP.
