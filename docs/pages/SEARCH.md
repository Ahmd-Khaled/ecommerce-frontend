# Product search — `/[locale]/search?q=...`

## Purpose

Provides a focused search experience with a dedicated query field, result count, product grid, no-results guidance, and pagination.

## Data flow

**Route:** `src/app/[locale]/search/page.tsx`  
**Feature page:** `src/features/products/components/search-page.tsx`

The route reads `q` from URL search parameters, trims it to 150 characters, and maps it to the backend's `search` field. An empty query displays a prompt and does not fetch the unfiltered catalog.

For a non-empty query, the page reuses `getProductCatalogPageData`:

- `GET /products/list?page=1&limit=12&search=<query>&sortBy=createdAt&sortOrder=desc`
- `GET /home?view=desktop&limit=1` for currency metadata

The backend response supplies products and pagination. The query remains in the URL, and pagination preserves `q` while changing `page`.

## UX, localization and SEO

- Search form uses a GET request so the query is shareable and browser navigation works.
- `src/app/[locale]/search/loading.tsx` renders a search-specific skeleton. Errors and no-results have distinct localized states.
- Product cards reuse the shared product grid.
- The `Search` namespace is maintained in English and Arabic.
- Search pages set `noindex, follow` to avoid indexing arbitrary query combinations.

## Main files

- `src/app/[locale]/search/page.tsx`
- `src/features/products/components/search-page.tsx`
- `src/features/products/api/catalog.server.ts`
- `src/features/products/components/products-pagination.tsx`
