# Stripe payment integration

**Routes:**
- `/[locale]/payment/success`
- `/[locale]/payment/cancelled`

The storefront uses the backend's Stripe-hosted Checkout integration. The browser never receives a Stripe secret key or handles card data.

## Customer payment lifecycle

1. The customer reviews their authenticated cart and saved delivery address.
2. The storefront creates the order through `POST /orders/checkout`, preserving the order request's existing idempotency key.
3. After the order is created, the storefront generates a separate payment idempotency key and stores it with the order ID in tab-scoped `sessionStorage`.
4. The storefront calls `POST /payments/checkout` with `{ orderId }` and the payment `Idempotency-Key` header.
5. The backend derives the amount and currency from the immutable order, creates or retrieves the Stripe Checkout session, and returns `checkoutUrl`.
6. The browser redirects to that exact backend-provided URL.
7. Stripe returns the customer to the configured success or cancellation route. Both routes recover the order ID from the same-tab payment session and call `GET /payments/orders/:orderId`.
8. The return page polls every 2.5 seconds while payment is pending. It reports payment as successful only when the backend reports `paid`.

## API contracts

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/payments/checkout` | Create or retrieve an order's Stripe Checkout session |
| GET | `/payments/orders/:orderId` | Retrieve customer-owned payment state |

Payment data includes `orderId`, `status`, `amountMinor`, `currency`, `checkoutUrl`, and `paidAt`. Supported statuses are `unpaid`, `pending`, `paid`, and `expired`.

The webhook endpoint is backend-only. Never call it from the storefront. Stripe webhook verification and order-state updates are handled by the backend.

## Idempotency and recovery

- Order creation and payment session creation use different idempotency keys.
- The payment key must remain unchanged for every retry of the same order's payment-session creation.
- The storefront persists the key and order ID in `sessionStorage` before calling the payment endpoint, so a network timeout can be retried safely in the same browser tab.
- The backend allows one Checkout session per order. An expired session cannot be restarted; the customer must follow the backend's new-order process.
- A cancelled return URL does not mean that the session expired. A still-pending session can be resumed using its existing `checkoutUrl`.

## Return URL configuration

For local development, configure the backend with storefront URLs such as:

```env
PAYMENT_SUCCESS_URL=http://localhost:3000/en/payment/success?session_id={CHECKOUT_SESSION_ID}
PAYMENT_CANCEL_URL=http://localhost:3000/en/payment/cancelled
```

Use HTTPS outside local development. These URLs are backend configuration values and are fixed per deployment, including the locale prefix.

## Important limitations

- Online Checkout currently supports EGP, USD, EUR, GBP, AED, and SAR.
- The storefront does not treat the Stripe redirect or query string as proof of payment.
- Payment status comes from the authenticated backend details endpoint, which is updated by verified Stripe webhooks.
- Refunds, disputes, and automated reconciliation are outside the current backend implementation.
- The return-page order lookup relies on the same browser tab's session storage. If that context is unavailable, the customer can still inspect the order from authenticated order history.
