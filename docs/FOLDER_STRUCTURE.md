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
    CART.md                   Authenticated cart page, API and quantity management
    ADDRESSES.md              Saved customer address management
    CHECKOUT.md               Checkout review, minor-unit confirmation, and order idempotency\n    PAYMENTS.md               Stripe Checkout session, redirects, webhook verification, and return flow
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
      cart/
        page.tsx              Customer cart route wrapper
      addresses/
        page.tsx              Saved customer addresses route wrapper
      checkout/
        page.tsx              Checkout review route wrapper
      orders/
        page.tsx              Customer order history route wrapper
        [orderId]/
          page.tsx            Customer order details route wrapper
    globals.css               Shared design tokens and global styles
    providers.tsx             Theme, query, and toast providers
  components/
    layout/                   Storefront layout
    storefront/               Shared storefront components (cards, images, etc.)
    ui/                       Reusable UI primitives
  features/
    home/                     Homepage API, response types, and sections
    products/                 Catalog and product details API, types, and components
    cart/                     Authenticated cart API, types, query hooks, and components
    addresses/                Saved customer address API, types, query hooks, and UI
    checkout/                 Checkout API, request/order types, and review UI
    orders/                   Customer order API, types, query hooks, and pages\n    payments/                 Stripe payment API, types, query hooks, return pages, and session recovery
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
