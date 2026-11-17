# Product reviews: frontend implementation completed

## Implemented

- Added a dedicated reviews feature module with typed public/customer review contracts, API methods, and TanStack Query hooks.
- Integrated published customer reviews into product details, including the backend-provided average rating and published-review count.
- Added a five-star rating display, optional written feedback, public review cards, empty/error/loading states, and cursor-based load-more behavior.
- Added authenticated review submission and editing from product details. The UI displays the backend review state and handles pending, published, hidden, and removed states.
- Added the localized customer review history route at `/[locale]/reviews`, linked from the customer account page and product review section.
- Customer history includes all lifecycle states and supports cursor pagination, editing non-removed reviews, and withdrawing reviews.
- Connected mutations to customer-scoped query keys and invalidated public product reviews and the signed-in customer's history after changes.
- Added English and Arabic translations and retained RTL behavior through the locale layout.
- Extended the product type with optional `ratingsAverage` and `ratingsCount` fields.

## Backend contract

The frontend consumes these backend endpoints without changing their business rules:

- `GET /products/:productId/reviews`
- `POST /products/:productId/reviews`
- `GET /products/reviews/me`
- `PATCH /products/reviews/me/:reviewId`
- `DELETE /products/reviews/me/:reviewId`

The backend remains authoritative for delivered-order eligibility, one-review-per-customer/product enforcement, moderation, approval settings, cursor validation, and rating-counter transactions. The frontend never sends user/order IDs or moderation fields.

## Lifecycle behavior

- Public reviews and product rating summaries contain published reviews only.
- Customer history displays pending, published, hidden, and removed reviews.
- Hidden reviews remain hidden after customer edits; published edits may return to pending according to the backend approval setting.
- Removed reviews remain visible in customer history but cannot be edited or restored by the customer.
- Withdrawing a review does not free the unique customer/product review slot.
- Submission eligibility is not guessed from browser order data; backend business errors are displayed to the customer.

## Main files

Added:
- `src/features/reviews/types/review.types.ts`
- `src/features/reviews/api/reviews.api.ts`
- `src/features/reviews/hooks/use-reviews.ts`
- `src/features/reviews/components/product-reviews.tsx`
- `src/features/reviews/components/my-reviews-page.tsx`
- `src/app/[locale]/reviews/page.tsx`

Updated:
- `src/features/products/types/product.types.ts`
- `src/features/products/components/product-details-page.tsx`
- `src/features/auth/components/account-page.tsx`
- `messages/en.json`
- `messages/ar.json`
- `docs/API_FETCHING.md`

## Verification status

- Reviewed against the backend completed-work document, API reference, review validation, controller, service, and lifecycle implementation.
- Source changes are committed to a dedicated feature branch.
- Automated lint, TypeScript semantic checks, and Next.js production build were not run in this remote GitHub editing session. Run locally:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
```

- Manual verification against a transaction-capable backend should cover delivered-order eligibility, duplicate submission, manual/automatic approval, published-only public counts, hidden/published edits, withdrawal, cursor pagination, and English/Arabic RTL layouts.
