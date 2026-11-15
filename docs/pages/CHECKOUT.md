# Checkout review

**Route:** `/[locale]/checkout`

This page is the customer-facing review step and order-placement entry point. After the backend creates the order, the storefront creates a Stripe-hosted Checkout session and redirects the customer to Stripe. Card details never pass through the storefront or backend.

## Feature modules

- `src/features/checkout/api/checkout.api.ts`
- `src/features/checkout/types/checkout.types.ts`
- `src/features/checkout/components/checkout-page.tsx`
- Saved address data comes from `src/features/addresses/`.
- Cart state comes from `src/features/cart/`.

## Review flow

1. Load the latest authenticated cart and saved addresses.
2. Select a saved delivery address or create one inline.
3. Review every cart product, quantity, line total, subtotal, shipping, discount, and total.
4. Confirm the order. Unavailable products or lines without `unitPriceMinor` block submission.
5. Create a Stripe Checkout session for the created order using a separate payment idempotency key.
6. Redirect to the backend-provided `checkoutUrl`; if session creation fails, keep the order reference visible and allow retry with the same payment key.

The current backend policy sets shipping, discount, and tax to zero for this milestone. The page states this explicitly. Online payment currently supports EGP, USD, EUR, GBP, AED, and SAR only.

## Checkout request

The frontend sends `POST /orders/checkout` with a request body matching the backend contract:

```json
{
  "version": 3,
  "addressId": "saved-address-id",
  "items": [
    {
      "productId": "cart-product-id",
      "unitPriceMinor": 50000
    }
  ]
}
```

The `Idempotency-Key` header contains a UUID-derived opaque key. Quantities are deliberately omitted; the backend reads them from the stored cart. The request includes the cart's last reviewed `version` and the server-provided `unitPriceMinor` for each line. The client never calculates the confirmed unit price.

## Concurrency and price safety

- The backend compares the submitted cart version to the persisted cart version.
- The submitted product set must exactly match the cart.
- The backend re-reads active products and compares each reviewed minor-unit price to the current catalog price.
- Stock deduction, order creation, and cart clearing happen in one MongoDB transaction.
- A stale cart, changed price, unavailable product, or insufficient stock aborts the transaction. The customer must refresh and review again.
- The idempotency key is reused for retries of the same request. A changed payload receives a new key; reusing a key with a different payload returns 409.
- The order stores immutable product and address snapshots, currency/exponent, and integer minor-unit totals.

## Verification

Test empty carts, missing addresses, changing selected addresses, stale cart versions, price changes, unavailable items, insufficient stock, double-click submission, network retries using the same idempotency key, successful cart clearing, and Arabic RTL layout. Run the backend replica-set integration tests for transactional rollback and idempotency races.

## Stripe payment handoff

The payment API is implemented in `src/features/payments/`:

- `POST /payments/checkout` with `{ orderId }` and a required `Idempotency-Key` header creates or retrieves the order's Stripe Checkout session.
- `GET /payments/orders/:orderId` retrieves the authenticated customer's payment status.
- The browser redirects only to the `checkoutUrl` returned by the backend. Never construct a Stripe URL or send client-calculated amounts.
- The payment idempotency key and order ID are retained in `sessionStorage` so a retry and the Stripe return route can recover the same payment attempt in the same browser tab.
- `/[locale]/payment/success` and `/[locale]/payment/cancelled` both query the backend for the payment state. A success redirect is not proof of payment; the page reports success only after the backend returns `paid` following verified webhook processing.
- Pending status is polled every 2.5 seconds. A cancelled Stripe redirect does not cancel or expire the Checkout session; the customer can continue using its existing URL.
- An expired session cannot be restarted for the same order. The backend requires a new order after the expired order is handled.

The configured backend return URLs must point to the storefront routes, for example:

```env
PAYMENT_SUCCESS_URL=http://localhost:3000/en/payment/success?session_id={CHECKOUT_SESSION_ID}
PAYMENT_CANCEL_URL=http://localhost:3000/en/payment/cancelled
```

Use HTTPS outside local development. The current backend uses a fixed configured locale in these URLs; configure the desired storefront locale for each deployment.
