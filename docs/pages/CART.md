# Customer cart

**Route:** `/[locale]/cart`

The cart is available only to authenticated customers and is synchronized with the backend. No guest cart or localStorage persistence is used.

## API

Feature modules:

- `src/features/cart/api/cart.api.ts`
- `src/features/cart/types/cart.types.ts`
- `src/features/cart/hooks/use-cart.ts`

All endpoints require a customer USER access token. The shared Axios client sends the in-memory access token and includes the backend-managed HttpOnly refresh cookie.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/cart` | Load the signed-in customer's cart |
| POST | `/cart/items` | Add a product with productId and optional quantity |
| PATCH | `/cart/items/:productId` | Replace a line quantity |
| DELETE | `/cart/items/:productId` | Remove a line |
| DELETE | `/cart/clear` | Clear all lines |

The cart query is scoped by customer ID. Successful mutations replace the cached cart response. The backend owns quantity, stock and concurrency validation; the UI does not assume that stock checks reserve inventory.

## Page behavior

- The cart page shows loading, retryable error, empty, and populated states.
- Each line displays the current product image/name, current price, quantity controls, availability and line subtotal.
- Unavailable/deleted products remain visible so customers can remove them. Quantity increases are disabled when the line is unavailable or current stock is reached; reductions and removal remain available.
- The summary uses the backend's currency and currency exponent. Cart values are major-unit display values; checkout uses the backend-provided minor-unit confirmation fields.
- The checkout link is disabled if any cart line is unavailable or has no confirmed minor-unit price.

## Add-to-cart

Product cards and product details add items through the same cart mutation. If a signed-out customer tries to add a product, the shared in-place quick-login dialog appears. After login, the pending add-to-cart action is completed before the current page reloads.

## Checkout handoff

The cart links to `/[locale]/checkout`. Checkout re-reads the latest cart and requires every line to be available with a server-provided `unitPriceMinor`. It submits the cart `version`, product IDs, reviewed minor-unit prices, a saved address ID, and an idempotency key. See [Checkout review](CHECKOUT.md) and [Saved addresses](ADDRESSES.md).

## Verification

Test signed-in and signed-out states, empty and populated carts, add existing/new lines, quantity replacement, unavailable products, deletion, clear, stock boundaries, API failures, session expiry, and checkout navigation in both locales and RTL/LTR.
