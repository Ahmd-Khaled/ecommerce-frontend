# Product catalog — `/[locale]/products`

## Purpose

Displays the public product collection with search, price range filtering, sorting, pagination, and responsive product cards.

## Page composition

**Route file:** `src/app/[locale]/products/page.tsx`  
**Feature page:** `src/features/products/components/products-page.tsx`

Sections:

1. **Catalog header** — localized title, intro copy, and total product count.
2. **Filters** — desktop sticky sidebar and mobile slide-in overlay.
   - Search text.
   - Minimum and maximum numeric price.
   - Dual-thumb price slider, visually bounded from 0 to 100,000.
   - Sort field: newest, price, or name.
   - Sort direction: descending or ascending.
   - Apply and reset actions.
3. **Product grid** — responsive grid of reusable storefront product cards.
4. **Pagination** — previous/next controls and current page status.

The mobile filter drawer overlays the page rather than taking up grid layout space. The desktop filter remains sticky. The first product card image is prioritized.

## API fetching

**API module:** `src/features/products/api/catalog.server.ts`

The page awaits locale params and URL search params, then calls `getProductCatalogPageData(locale, searchParams)`.

Requests run concurrently:

- `GET /products/list` with query parameters `page`, `limit=12`, optional `search`, `minPrice`, `maxPrice`, plus `sortBy` and `sortOrder`.
- `GET /home?view=desktop&limit=1` for currency and currency exponent.

The product response supplies `products` and `pagination`. Currency metadata is passed to every product card. The catalog server parser validates positive page numbers, supported sort values, non-negative numeric price values, and invalid min/max ranges.

## Price filter behavior

- The slider range is capped at 100,000 for convenient pointer-based selection.
- The minimum and maximum number inputs do not have an upper HTML maximum or server-side 100,000 cap.
- Values larger than 100,000 can be entered manually and are submitted as query parameters.
- When a typed value exceeds the slider range, the slider thumb remains at the 100,000 endpoint while the numeric field retains the actual entered value.
- The slider endpoint is a UI convenience, not a product-price validation rule.

## Loading and error behavior

- `src/app/[locale]/products/loading.tsx` renders `ProductsPageSkeleton`.
- A failed catalog request shows a localized connection error with a link back home.
- An empty result shows an empty-state message and a link to all products.
- An invalid min/max range displays an inline alert.
- Pagination state is reflected in URL search parameters.

## Localization and SEO

- `Catalog` translations live in `messages/en.json` and `messages/ar.json`.
- Locale-aware links use the shared next-intl navigation helpers.
- `generateMetadata` sets localized title and description.
- Arabic layout direction is supplied by the locale layout.

## Main files

- `src/app/[locale]/products/page.tsx`
- `src/app/[locale]/products/loading.tsx`
- `src/features/products/components/products-page.tsx`
- `src/features/products/components/products-header.tsx`
- `src/features/products/components/products-filters.tsx`
- `src/features/products/components/products-grid.tsx`
- `src/features/products/components/products-pagination.tsx`
- `src/features/products/components/products-page-skeleton.tsx`
- `src/features/products/api/catalog.server.ts`
- `src/features/products/types/product.types.ts`

## Maintenance notes

Update this guide whenever filters, query parameters, pagination, response fields, or the catalog layout changes. Keep API details synchronized with `docs/API_FETCHING.md`.
