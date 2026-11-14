# Folder structure

```text
docs/
  README.md                  Main project guide and documentation index
  API_FETCHING.md             Public API request conventions and endpoint contracts
  FOLDER_STRUCTURE.md         This folder map
  pages/
    HOME.md                   Homepage sections and data flow
    PRODUCT_CATALOG.md        Catalog filters, grid, pagination, and API
    PRODUCT_DETAILS.md        Product gallery, zoom, responsive layout, and API
messages/                     English and Arabic website translations
public/                       Website static assets
src/
  app/
    [locale]/
      page.tsx                Homepage route wrapper
      layout.tsx              Locale validation, direction, and providers
      products/
        page.tsx              Product catalog route wrapper
        [slug]/
          page.tsx            Product details route wrapper
    globals.css               Shared design tokens and global styles
    providers.tsx             Theme, query, and toast providers
  components/
    layout/                   Storefront layout
    storefront/               Shared storefront components (cards, images, etc.)
    ui/                       Reusable UI primitives
  features/
    home/                     Homepage API, response types, and sections
    products/                 Catalog and product details API, types, and components
  i18n/                       Locale routing, navigation, and request config
  lib/                        Shared HTTP client and utilities
  utils/                      Currency formatting and other shared helpers
  proxy.ts                    Locale routing proxy
```

## Organization rules

- Keep route `page.tsx` files thin: import and export the feature page component.
- Put page composition, data orchestration, and feature-specific components under `src/features/<feature>`.
- Put reusable cross-feature primitives under `src/components`.
- Keep server-only API access in feature-specific server modules.
- Keep translations in `messages/en.json` and `messages/ar.json`.
- Update the matching `docs/pages/*.md` file whenever a page changes. Update `docs/API_FETCHING.md` for API contract changes and `docs/README.md` for project-wide conventions.
