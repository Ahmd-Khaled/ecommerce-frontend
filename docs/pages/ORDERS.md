# Customer orders

**Routes:**
- `/[locale]/orders` — authenticated customer's order history.
- `/[locale]/orders/[orderId]` — one order's details.

## Feature modules

- `src/features/orders/api/orders.api.ts`
- `src/features/orders/types/order.types.ts`
- `src/features/orders/hooks/use-orders.ts`
- `src/features/orders/components/orders-page.tsx`
- `src/features/orders/components/order-details-page.tsx`
- `src/features/orders/components/order-status-badge.tsx`

## Data and access

All requests use the shared Axios client and require a customer session. The backend scopes records to the authenticated customer; the frontend never sends a user ID.

- `GET /orders?page=1&limit=10` returns the customer's paginated order history.
- `GET /orders/:orderId` returns a customer-owned order.
- `PATCH /orders/:orderId/cancel` accepts an optional `{ reason }` string (1–500 characters when supplied).

Order totals and item prices are integer minor units. Format them using the order's `currency` and `currencyExponent` with `formatMinorMoney`. The order detail view renders the saved delivery address snapshot when returned by the API.

## Interactions

- The history page shows order reference, status, date, item count, total and pagination.
- The detail page shows items, unit and line prices, delivery snapshot, monetary breakdown, payment status and timestamps.
- Cancellation requires confirmation and accepts an optional reason. The backend remains authoritative about whether the current order status is cancellable; rejected requests are surfaced as API errors.
- Customer order queries use customer-scoped TanStack Query keys. A successful cancellation refreshes the history and updates the detail cache.

## Verification

Test signed-out prompts, an empty order history, multiple pages, an order with several line items, missing optional address fields, all backend order statuses, successful cancellation, cancellation rejected by backend rules, a reason at the 500-character limit, and API/network failures. Verify English and Arabic RTL at mobile, tablet and desktop widths.
