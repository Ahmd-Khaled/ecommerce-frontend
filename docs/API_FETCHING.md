# API fetching reference

This document describes how the storefront retrieves public backend data and calls authenticated customer endpoints. Keep it synchronized with the feature API modules.

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

The product endpoint is expected to return the product under `data.product`. The product type is shared from `src/features/products/types/product.types.ts`. After the product is loaded, the page requests related items from its category when a category ID is available:

```http
GET /products/category/:categoryId?page=1&limit=8&sortBy=createdAt&sortOrder=desc
```

The page removes the current product from the result and displays up to four related products. If the product has no usable category ID or the related-products request fails, the related section is omitted without affecting the product details page.

The details page uses:

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

## Customer authentication (browser requests)

**Shared client:** `src/lib/api/axios.ts`

Browser requests use the same-origin `/api/v1` path. `next.config.ts` rewrites it to the configured `NEXT_PUBLIC_API_URL`, and the Axios client uses `withCredentials: true` so the browser includes the backend-managed refresh cookie.

The customer auth endpoints are:

| Method | Endpoint | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Register with first name, last name, email, password and confirmation |
| POST | `/auth/confirm-email` | Confirm an email using email and OTP |
| POST | `/auth/resend-confirm-email` | Resend the email confirmation code |
| POST | `/auth/login` | Sign in using email and password |
| POST | `/auth/refresh-token` | Rotate the HttpOnly refresh cookie and return a new access token |
| GET | `/auth/profile` | Read the current customer profile |
| POST | `/auth/logout` | Revoke the current device session |
| POST | `/auth/logout-all` | Invalidate all sessions for the customer |
| PATCH | `/auth/forgot-password` | Request a password reset code |
| PATCH | `/auth/reset-password` | Reset the password using email, OTP and new password |

The backend expects `Authorization: user <accessToken>`. The refresh token is never exposed to JavaScript: the backend sets it as an HttpOnly cookie scoped to `/api/v1/auth`. The access token is held in module memory and is not written to localStorage or sessionStorage.

The auth provider restores a session by refreshing the access token and then loading `/auth/profile`. A shared refresh promise prevents duplicate refresh-token rotation. Protected API calls that receive a 401 may refresh once and retry once; public auth endpoints and the refresh endpoint are excluded.

The active locale is sent through `Accept-Language`. The registration redirect to `/verify-email` intentionally does not include the email address in its query string; customers enter it on the verification screen. The email verification and password-reset screens collect a six-digit OTP. See [Customer authentication](pages/AUTHENTICATION.md) for the UI routes, context API and session lifecycle.

## Customer cart (authenticated browser requests)

**Feature:** `src/features/cart/`

The customer cart uses the shared Axios client and the following USER-only endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/cart` | Read the current customer's cart |
| POST | `/cart/items` | Add or increment a product line: `{ productId, quantity? }` |
| PATCH | `/cart/items/:productId` | Set the line quantity: `{ quantity }` |
| DELETE | `/cart/items/:productId` | Remove a product line |
| DELETE | `/cart/clear` | Remove all cart lines |

The response data contains `items`, `totalItems`, `subtotal`, `subtotalMinor`, `currency`, `currencyExponent`, and `version`. Active product lines include current product details, availability, `unitPriceMinor`, `subtotal`, and `subtotalMinor`. Deleted/inactive products remain as unavailable minimal lines with zero subtotal.

Cart data is held in TanStack Query under a customer-scoped key. Successful mutations replace that customer's cached cart from the response. Cart display values remain major currency units; checkout must use the minor-unit confirmation fields and reviewed cart version. Stock checks on add/increase are advisory and do not reserve inventory.

See [Customer cart](pages/CART.md) for page behavior and verification scenarios.

## Saved customer addresses

**Feature:** `src/features/addresses/`

All address endpoints require the authenticated customer USER token. Ownership is derived from the token; the client must not send a user ID.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/addresses` | List saved addresses |
| POST | `/addresses` | Create an address |
| PATCH | `/addresses/:addressId` | Update an address |
| PATCH | `/addresses/:addressId/default` | Set default address |
| DELETE | `/addresses/:addressId` | Delete an address |

The response data is an address or an array of addresses with `_id`, `label`, `fullName`, `phone`, `country`, `city`, `street`, optional `building`/`apartment`, and `isDefault`. The addresses are embedded in the authenticated user's record on the backend. See [Saved addresses](pages/ADDRESSES.md).

## Checkout review

**Feature:** `src/features/checkout/`

Checkout uses `POST /orders/checkout` and requires an `Idempotency-Key` header. The body includes the reviewed cart `version`, selected saved `addressId`, and one `{ productId, unitPriceMinor }` confirmation for every cart line. Quantities and totals are intentionally not sent; the backend derives them from the persisted cart and authoritative product records.

The response contains `replayed` and the created order under `data`. New orders return HTTP 201; an idempotent replay returns HTTP 200. The backend validates cart version, exact product set, current price and stock, then atomically deducts inventory, creates the order snapshots, and clears the cart. The frontend reuses the same key for retries of an unchanged request and generates a new key when the request changes. See [Checkout review](pages/CHECKOUT.md).

## Customer orders

**Feature:** `src/features/orders/`

All customer order routes require the authenticated customer USER token. Customer ownership is derived by the backend; the frontend does not send a customer ID.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/orders?page=1&limit=10` | Paginated order history |
| GET | `/orders/:orderId` | Read one customer-owned order |
| PATCH | `/orders/:orderId/cancel` | Request cancellation with optional `{ reason }` (1–500 characters) |

The backend documents the list and detail responses as `{ success, data }`; the list data contains `orders` and `pagination`, and detail data contains one order. The order contains server-calculated line items, minor-unit monetary totals, a delivery-address snapshot, status, and timestamps. The storefront formats amounts using the returned `currency` and `currencyExponent`; never treat minor-unit amounts as major units.

The TanStack Query cache is scoped by customer ID. A successful cancellation updates the order detail cache and invalidates that customer's order history. Cancellation eligibility remains authoritative on the backend: the UI submits the request and displays backend validation/conflict errors rather than assuming every order can be cancelled.

The order list and details are available at `/[locale]/orders` and `/[locale]/orders/:orderId`. English and Arabic labels are maintained in `messages/en.json` and `messages/ar.json`.

## Adding a new endpoint

1. Confirm the endpoint, access rules, query parameters, and response envelope in the backend API documentation or implementation.
2. Add/extend the TypeScript response types in the relevant feature's `types` folder.
3. Add the request in the feature's server-only API module.
4. Send locale headers and handle non-OK responses and exceptions.
5. Keep the route component free of low-level fetch details.
6. Update the matching page guide and this document.
7. Run lint and build, then manually verify English and Arabic pages.
