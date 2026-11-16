# Product collections — `/[locale]/collections/[section]`

## Supported routes

- `/[locale]/collections/latest`
- `/[locale]/collections/best-offers`
- `/[locale]/collections/best-sellers`

## Data fetching

**Route:** `src/app/[locale]/collections/[section]/page.tsx`  
**Feature page:** `src/features/products/components/collection-page.tsx`  
**Server API:** `getProductCollectionPageData` in `src/features/products/api/catalog.server.ts`

The section is validated against the supported values before requesting data. Unknown values call Next.js `notFound()`.

The server sends `Accept-Language` and requests:

```http
GET /home/products?section=<section>&page=1&limit=12
```

The response contains `products`, `pagination`, `currency`, and `currencyExponent`. The backend owns collection membership and ranking:

- `latest` — newest products first.
- `best-offers` — products with a valid compare-at price greater than the current price, ranked by discount.
- `best-sellers` — products ranked by paid sales.

The storefront must not fabricate discounts or popularity. Pagination stays on the current collection route.

## Page composition

The page reuses `ProductsHeader`, `ProductsGrid`, `ProductCard`, and route-aware `ProductsPagination`. It includes localized loading, empty, and error states and metadata for each supported section.

## Localization

All collection copy is in the `Collections` namespace in `messages/en.json` and `messages/ar.json`.

## Main files

- `src/app/[locale]/collections/[section]/page.tsx`
- `src/app/[locale]/collections/[section]/loading.tsx`
- `src/features/products/components/collection-page.tsx`
- `src/features/products/api/catalog.server.ts`
- `src/features/products/components/products-pagination.tsx`
