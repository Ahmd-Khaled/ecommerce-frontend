# API fetching reference

This document describes how the storefront currently retrieves public backend data. Keep it synchronized with the feature API modules.

## Shared request contract

- Base URL: `process.env.NEXT_PUBLIC_API_URL`, including `/api/v1`.
- Headers:
  - `Accept: application/json`
  - `Accept-Language: en` or `ar`
- Response envelope:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

- A request is successful only when the HTTP response is OK and the response envelope contains `success: true` and a usable `data` value.
- Server feature modules log request/network failures and return `null` where the page needs a fallback.
- Current public page fetches use `cache: "no-store"`.

## Homepage

**Module:** `src/features/home/api/home.server.ts`

Requests in parallel:

```http
GET /home?view=desktop&limit=8
GET /home?view=mobile&limit=8
```

The API response data is typed as `HomepageResponse` in `src/features/home/types/home.types.ts`:

- `language`, `view`
- `currency`, `currencyExponent`
- `banners`
- `categories`
- `latestProducts`
- `bestOffers`
- `bestDeal`
- `bestSellers`

The homepage uses desktop data as its primary source and falls back to mobile data if the desktop request fails. Mobile banners are passed separately to the banner carousel; if no mobile banners are returned, the carousel falls back to the primary banner list.

## Product catalog

**Module:** `src/features/products/api/catalog.server.ts`

Requests in parallel:

```http
GET /products/list?page=1&limit=12&sortBy=createdAt&sortOrder=desc
GET /home?view=desktop&limit=1
```

The product-list query can include:

| Parameter | Meaning |
|---|---|
| `page` | Positive page number; defaults to 1 |
| `limit` | Fixed at 12 by the storefront |
| `search` | Trimmed product search text |
| `minPrice` | Optional non-negative minimum |
| `maxPrice` | Optional non-negative maximum |
| `sortBy` | `createdAt`, `price`, or `name` |
| `sortOrder` | `asc` or `desc` |

The list response uses `data.products` and `data.pagination`. Currency metadata comes from `data.currency` and `data.currencyExponent` in the homepage response.

## Product details

**Module:** `src/features/products/api/product-details.server.ts`

Requests in parallel:

```http
GET /products/slug/:slug
GET /home?view=desktop&limit=1
```

The product endpoint is expected to return the product under `data.product`. The product type is shared from `src/features/products/types/product.types.ts`. The details page uses:

- `name`, `slug`, `description`
- `sku`, `price`, `compareAtPrice`, `stock`
- `images`
- `category.name` when category is populated

The currency endpoint supplies `currency` and `currencyExponent`. If the product endpoint returns 404 or no product, the page calls Next.js `notFound()`.

## Currency formatting

Use `formatMajorMoney` from `src/utils/formatCurrency.ts` and pass:

```ts
formatMajorMoney(amount, {
  locale,
  currency,
  currencyExponent,
});
```

Do not assume all currencies have two fraction digits. Do not divide major-unit prices by 100 again.

## Adding a new endpoint

1. Confirm the endpoint, access rules, query parameters, and response envelope in the backend API documentation or implementation.
2. Add/extend the TypeScript response types in the relevant feature's `types` folder.
3. Add the request in the feature's server-only API module.
4. Send locale headers and handle non-OK responses and exceptions.
5. Keep the route component free of low-level fetch details.
6. Update the matching page guide and this document.
7. Run lint and build, then manually verify English and Arabic pages.
