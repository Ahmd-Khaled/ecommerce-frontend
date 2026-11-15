# Checkout review

**Route:** `/[locale]/checkout`

This page is the customer-facing review step before order placement. It does not collect payment details or charge a payment provider.

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
5. Display the created order reference and confirmed total after success.

The current backend policy sets shipping, discount, and tax to zero for this milestone. The page states this explicitly. No payment is collected.

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
