# Categories — `/[locale]/categories`

## Routes

- `/[locale]/categories` — public category tree and category cards.
- `/[locale]/categories/[slug]` — category details, child-category navigation, and directly assigned products.

## Data fetching

**Server module:** `src/features/categories/api/categories-page.server.ts`

The listing uses `GET /categories/tree`. The detail page resolves its category with `GET /categories/slug/:slug`, then loads directly assigned products from `GET /products/category/:categoryId` using the supported product filters and pagination. Currency metadata is read from `GET /home?view=desktop&limit=1`.

Requests are server-side, use `Accept-Language`, and are not shared-cached. Category product results must not be described as including descendant-category products unless the backend contract explicitly changes.

## Page behavior

- Category cards link to localized category slugs and use API-provided names and images.
- Detail pages show breadcrumbs, description when supplied, and child categories when available.
- Search, minimum/maximum price, sorting, and pagination are scoped to the selected category.
- Invalid category slugs use the not-found experience; API failures use a localized error state.
- Product cards reuse the shared storefront product card and currency formatting.

## Localization and SEO

Category labels and interface copy use the `Categories` namespace in both message dictionaries. Metadata is generated from the resolved category data and locale. Arabic layout direction comes from the locale layout.

## Main files

- `src/app/[locale]/categories/page.tsx`
- `src/app/[locale]/categories/[slug]/page.tsx`
- `src/features/categories/api/categories-page.server.ts`
- `src/features/categories/components/categories-page.tsx`
- `src/features/categories/components/category-detail-page.tsx`
- `src/features/categories/components/category-products-filters.tsx`

