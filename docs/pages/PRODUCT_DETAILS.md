# Product details — `/[locale]/products/[slug]`

## Purpose

Presents one product with a responsive image gallery, an optional full-screen image viewer, product information, availability, quantity selection, and purchase actions.

## Page composition

**Route file:** `src/app/[locale]/products/[slug]/page.tsx`  
**Feature page:** `src/features/products/components/product-details-page.tsx`

Sections:

1. **Breadcrumbs** — links to the homepage and catalog, followed by the current product name.
2. **Product gallery** — main square product image and every valid product image as a selectable thumbnail.
   - Desktop: vertical thumbnail rail beside the main image.
   - Mobile/tablet: horizontal thumbnail strip beneath the main image.
   - Previous/next buttons appear when there is more than one image.
   - The main image has its own positioned stacking context so navigation and full-screen controls do not cover or displace the image.
   - The shared `ImageWithSkeleton` keeps the image visible while the shimmer is rendered behind it; an image load event is not required to reveal the image.
3. **Full-screen image viewer** — opens from the expand icon on the main image.
   - Displays the selected image fitted inside the available viewport; it does not magnify, zoom, or create a scrollable oversized image.
   - Previous/next controls remain available for products with multiple images.
   - Close button, backdrop click, and Escape key close the viewer.
   - Body scrolling is locked while it is open.

The details layout uses a single column on smaller screens and a two-column gallery/summary layout on large screens. Width constraints, wrapping, and compact mobile spacing prevent the product title, SKU, prices, and action buttons from forcing horizontal overflow.

## API fetching

**API module:** `src/features/products/api/product-details.server.ts`

The server page fetches product and currency data concurrently:

- `GET /products/slug/:slug`
- `GET /home?view=desktop&limit=1`

Both requests send the active locale through `Accept-Language` and currently use `cache: "no-store"`.

The product endpoint returns the product in `data.product`. The page consumes:

- `name`, `slug`, `description`
- `sku`, `price`, `compareAtPrice`, `stock`
- `images`
- `category.name` when category is a populated object

Currency and `currencyExponent` come from the homepage response. If currency metadata is unavailable, the API module falls back to EGP and exponent 2. A missing product resolves to Next.js `notFound()`.

The same product-by-slug request is also used by `generateMetadata` to set the page title, description, and Open Graph image.

## Price display

Prices are formatted with `formatMajorMoney` from `src/utils/formatCurrency.ts`, using the active locale and API currency metadata. The compare-at price is shown only when it is greater than the current price. The discount percentage is derived from those two values.

## Loading and failure behavior

- `src/app/[locale]/products/[slug]/loading.tsx` renders `ProductDetailsSkeleton`.
- Missing products render the not-found route.
- Image failures are handled by the shared `ImageWithSkeleton` component.
- Empty image arrays show an image placeholder.
- Stock at or below zero disables purchase actions.

## Purchase integration status

The quantity selector is interactive and prevents selecting less than 1 or more than available stock. Add-to-cart and Buy now currently display localized “coming soon” toast messages; they are placeholders until cart and checkout APIs are integrated. Do not document these controls as completing an order.

## Localization and accessibility

- Labels are in the `ProductDetails` namespace in both locale message files.
- Dynamic image count labels are translated on the server with marker values: `t("imageNumber", { current: "{current}", total: "{total}" })`. The resulting string is serializable across the server/client boundary; the client gallery replaces the markers with the active image numbers.
- Gallery controls have accessible labels and keyboard focus styles.
- The full-screen viewer has dialog semantics, an accessible close button, Escape handling, and keyboard previous/next navigation.
- Arabic uses the document RTL direction from the locale layout; gallery direction remains intentional for thumbnail flow and image controls.

## Main files

- `src/app/[locale]/products/[slug]/page.tsx`
- `src/app/[locale]/products/[slug]/loading.tsx`
- `src/features/products/components/product-details-page.tsx`
- `src/features/products/components/product-gallery.tsx`
- `src/features/products/components/product-purchase-panel.tsx`
- `src/features/products/components/product-details-skeleton.tsx`
- `src/features/products/api/product-details.server.ts`
- `src/features/products/types/product.types.ts`
- `src/components/storefront/image-with-skeleton.tsx`
- `messages/en.json`, `messages/ar.json`

## Maintenance notes

Update this guide whenever the gallery, full-screen viewer behavior, product information, purchase controls, responsive layout, metadata, or product API contract changes. Update `docs/API_FETCHING.md` too when the endpoint or response shape changes.
