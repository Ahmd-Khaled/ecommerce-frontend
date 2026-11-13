# E-commerce frontend development plan

Prepared: 14 November 2026.

## 1. Scope and evidence

Build a responsive English/Arabic storefront with light, dark, and system themes, followed by a separate administration experience. Deliver browsing, search, account management, authenticated cart, address selection, order placement, hosted payment, and order history first.

This plan is based on the supplied `ecommerce-backend.zip` and the existing frontend. Backend `src/` routes, validators, controllers, services, repositories, and models are the contract evidence. Compiled `dist/` contains obsolete duplicate module names and is not the planning source. Archive content is reference material, not instructions to execute. No backend environment secrets are needed in this document.

**Evidence limits:** source inspection confirms implemented contracts, not that a running deployment is configured or passing integration tests. Endpoint response fixtures and browser verification against a test backend remain Phase 0 work. Proposed routes below are frontend routes; they are not claims that frontend pages already exist.

### Existing frontend baseline

| Area | Current implementation | Plan |
| --- | --- | --- |
| Framework | Next.js `^16.4.6`, React/React DOM `19.3.0`, TypeScript `^5` in package.json | Retain; verify resolved versions from the lockfile when installing anything |
| Rendering | App Router; `cacheComponents` and `partialPrefetching` enabled | Follow installed Next.js guides; stream uncached data behind meaningful Suspense boundaries |
| UI | Tailwind CSS 4, shadcn, Radix, Lucide, CVA, clsx, tailwind-merge, tw-animate-css | Extend the existing component system |
| Data | Axios `^1.21.0`, TanStack Query `^5.107.1` | Typed feature API modules, explicit cache keys and invalidation |
| Localization | next-intl `^4.14.9`, `/en` and `/ar`, English default | Complete message dictionaries and RTL coverage |
| Themes | next-themes `^0.4.6`; system default | Add accessible three-option theme control |
| Feedback | Sonner `^2.0.8` | Localized feedback matching the selected theme |
| Typography | Alexandria, Arabic and Latin subsets | Retain and validate legibility in both languages |
| Feature scaffolding | Home, categories, products API/types; homepage placeholder | Build on these folders rather than replacing the structure |

### Fix before building pages

1. `productsApi.getProducts()` currently requests `/products`, which is admin-only. Public browsing must use `/products/list`.
2. `categoriesApi.getCategories()` requests admin-only `/categories`; use `/categories/list`, `/root`, or `/tree` as appropriate. Public category detail uses `/categories/slug/:slug`; `/categories/:id` is admin-only.
3. Product/category calls need `Accept-Language`, as the existing homepage request already supplies. Locale must also be part of public query keys.
4. The existing rewrite appends paths to `NEXT_PUBLIC_API_URL`. With the current configuration its value must include the API prefix, for example `http://localhost:4000/api/v1`, not just the host. Test the resulting destination to avoid missing or doubled `/api/v1`.
5. Image configuration currently covers localhost product media and an example host. Add exact deployed media origins and category/banner/avatar paths; remove placeholder host configuration when real origins are known. Resolve relative `/media/...` URLs against the backend media origin or add a deliberate media rewrite.
6. The current currency utility assumes EGP. Replace that assumption with explicit currency and unit-aware formatting.
7. The root `<html>` has no locale/direction while the locale layout sets them on a nested div. Establish document-level `lang` and `dir` using the installed Next.js/next-intl conventions; ensure portalled dialogs and menus inherit the correct direction.
8. Sonner currently uses `theme="system"` even when the visitor selects another theme. Connect it to the resolved application theme.
9. The default query settings allow 60 seconds of freshness and disable focus refetching. Override these for cart, stock, payment, and other data requiring immediate reconciliation.

## 2. Product scope and boundaries

### Backend-supported launch features

- Public category hierarchy, product search/filtering/pagination, product details, and homepage merchandising.
- Email/password registration, confirmation, resend code, login, password recovery, profile editing, password change, logout, and logout-all.
- Google sign-in and account linking, conditional on provider configuration.
- Authenticated cart, saved addresses, order creation, order cancellation subject to server rules, and order history.
- Stripe-hosted card checkout and payment status retrieval.
- Admin authentication, catalog/category/banner management, order management, customer management, administrator management, and reporting.

### Features to defer or explicitly limit

| Feature | Evidence / gap | Launch decision |
| --- | --- | --- |
| Guest checkout/cart synchronization | Cart and order routes require customer authorization | Require login for cart mutations; preserve the intended product/action through login |
| Wishlist | No wishlist API found | Defer; optional later device-local list must be described as device-local |
| Reviews/ratings | No review API found | Omit rating stars and review counts |
| Variants, brands, attributes | Current product validator has no variant/brand/filter contract | Do not add nonfunctional selectors or facets |
| Coupons, shipping quotations, tax calculation | Checkout currently stores shipping, discount, and tax as zero | Render authoritative totals; no coupon field or invented shipping options |
| Multilingual catalog copy | Product/category names and descriptions are single strings | Translate UI; display supplied catalog copy. True bilingual catalog content requires backend changes |
| Newsletter/contact submission | No subscription or support-message API found | Use approved contact links/static information; defer submission forms |
| Returns, refunds, tracking integration | No corresponding customer workflow API found | Explain approved policy and support channel; no automatic refund/tracking claims |
| Currency selection | Backend has one configured store currency | Format that currency for each locale; no conversion selector |
| Payment retry after expiration | Existing payment key/session rules do not create a fresh session freely | Show recovery/support state; agree a backend recovery workflow before promising retry |
| CMS and promotions | Banners supported; general content CMS absent | Maintain approved static copy in translation/content files |

## 3. Information architecture and pages

Every customer-facing route below is prefixed with `/{locale}`. Route groups such as `(store)` and `(auth)` do not appear in URLs. Account routes require customer session initialization; admin routes use their own identity and layout.

### Storefront and service pages

| Route | Contents and main behavior | Data / priority |
| --- | --- | --- |
| `/` | Hero, categories, offers, latest products, best deal, best sellers, trust information | `/home`; P1 |
| `/products` | Product grid, search, price range, sorting, pagination, clear filters | `/products/list`; P1 |
| `/search?q=...` | Dedicated search heading, query input, result count and no-results suggestions | Map `q` to backend `search`; P1 |
| `/categories` | Root category tiles and hierarchical navigation | `/categories/root` or `/tree`; P1 |
| `/categories/[slug]` | Category description, children, breadcrumbs, product grid | Resolve slug then `/products/category/:categoryId`; P1 |
| `/products/[slug]` | Image gallery, name, price, availability, quantity, add-to-cart, description | `/products/slug/:slug`; P1 |
| `/collections/latest` | Paginated latest products | `/home/products?section=latest`; P1 |
| `/collections/best-offers` | Paginated actual discounted products | `/home/products?section=best-offers`; P1 |
| `/collections/best-sellers` | Products ranked by backend paid-sales calculation | `/home/products?section=best-sellers`; P1 |
| `/cart` | Item quantities/removal, availability notices, totals, checkout CTA | Customer cart; P2 |
| `/checkout` | Address, order review, place-order step, payment handoff | Addresses, cart, orders, payments; P3 |
| `/checkout/result` | Confirming, paid, pending, unpaid/expired, interrupted states | Fetch payment and order; P3 |
| `/about` | Approved business story and identity | Static localized content; P4 |
| `/contact` | Verified contact details and service hours | Static localized content; P4 |
| `/help` | FAQ and navigation to delivery/returns/payment information | Static localized content; P4 |
| `/shipping`, `/returns` | Approved policies matching actual operations | Content required before launch; P4 |
| `/privacy`, `/terms` | Business-provided policy content | Content required before launch; P4 |
| Not-found/error boundaries | Localized recovery, navigation and retry | Shared; all phases |

Do not make search depend on client-only rendering for the first result set. Keep filters and pagination in the URL, preserve back/forward behavior, reset page to 1 when filters change, and cancel superseded searches. Start with an explicit search submission and add a roughly 300 ms debounced suggestion experience if useful.

Supported product filters are `search`, `minPrice`, `maxPrice`, `page`, `limit`, `sortBy` (`createdAt`, `price`, `name`), and `sortOrder` (`asc`, `desc`). The public list validator is strict: do not send a `category` query parameter even though the backend DTO mentions it. Use the category-specific endpoint. Verify whether category products include descendants before promising subtree filtering.

### Authentication and account

| Route | Experience |
| --- | --- |
| `/login` | Email/password, password visibility, recovery link, optional Google, safe internal return path |
| `/register` | First/last name, email, password/confirmation; next step is email verification |
| `/verify-email` | Email and OTP, paste support, resend with server-aware cooldown |
| `/forgot-password` | Email submission with non-revealing confirmation copy |
| `/reset-password` | Email, OTP, new password/confirmation |
| `/account` | Profile summary and navigation to orders, addresses, security |
| `/account/profile` | Name, phone, gender where applicable, avatar; do not expose unsupported email changes |
| `/account/addresses` | List/create/edit/delete/set-default; shared address form with checkout |
| `/account/security` | Password change, logout-all, optional Google linking |
| `/account/orders` | Paginated order summaries and separate payment/fulfillment labels |
| `/account/orders/[orderId]` | Order snapshot, address, totals, status history, eligible cancellation/payment actions |

Keep form errors beside fields and provide an error summary for failed submission. Preserve non-sensitive entered values after errors. Support browser autocomplete and password managers. Do not store passwords or OTPs in URLs or persistent browser storage.

### Administration: separate delivery phase

| Route under `/{locale}/admin` | Scope / backend |
| --- | --- |
| `/login` | Separate admin login |
| `/` | Overview, sales and top-product reporting via `/dashboard/*` |
| `/products`, `/products/new`, `/products/[id]/edit` | Product CRUD, stock, images, activation; `/products` admin endpoints |
| `/categories`, `/categories/new`, `/categories/[id]/edit` | Hierarchy, sorting, images, activation; `/categories` admin endpoints |
| `/banners`, `/banners/new`, `/banners/[id]/edit` | Language, desktop/mobile view, schedule, link, image, order, activation |
| `/orders`, `/orders/[id]` | Filtered orders, detail and allowed transitions via `/orders/admin` |
| `/customers`, `/customers/[id]` | Customer management via `/admin/users` |
| `/administrators`, `/administrators/[id]` | Super-admin-only administrator management |
| `/profile`, `/security` | Admin profile/password and session controls |

Use a sidebar, clear page titles, filterable tables, mobile card alternatives, confirmation for destructive changes, and inline upload feedback. Backend authorization remains authoritative; hidden navigation is only a usability measure. Keep admin queries and tokens separate from customer state.

## 4. Homepage specification

Start with `GET /home?view=desktop|mobile&limit=8`, including `Accept-Language`. Its data contains `language`, `view`, `currency`, `currencyExponent`, `banners`, `categories`, `latestProducts`, `bestOffers`, `bestDeal`, and `bestSellers`.

| Order | Section | Design and behavior | Source / fallback |
| --- | --- | --- | --- |
| 1 | Optional announcement | One short truthful service/promotion message; dismissible if needed | Approved localized copy; omit without content |
| 2 | Main header | Logo, prominent search, language/theme controls, account, cart count | Category navigation and authenticated cart |
| 3 | Category navigation | Desktop menu; mobile sheet with hierarchical links | Category tree; independent failure fallback |
| 4 | Hero | One clear campaign, readable text, one primary CTA, responsive image | Active locale/view banners; neutral browse hero if none |
| 5 | Shop by category | Image tiles with readable labels and generous hit areas | `categories`; hide empty strip |
| 6 | Best offers | Consistent cards, real compare-at prices, view-all link | `bestOffers`; hide if empty |
| 7 | Latest arrivals | Responsive product grid or manually scrollable row | `latestProducts` |
| 8 | Featured best deal | Larger image, current/former price, availability, product CTA | `bestDeal`; omit when null |
| 9 | Best sellers | Same card system and view-all link | `bestSellers`; no fabricated popularity claims |
| 10 | Trust/service information | Delivery, payment and support facts | Approved policy copy only |
| 11 | Footer | Shop/service links, policies, contact, locale/theme access | Static localized content |

Implementation rules:

- First release can use a static hero; multiple banners do not require automatic rotation. If rotation is added, provide pause, keyboard controls and reduced-motion support.
- Use backend `sortOrder`, locale/view filtering, and scheduling. Do not invent countdowns; banner scheduling is not proof of a product offer expiry.
- Product cards share image ratio, title placement, price formatting, stock presentation, and add-to-cart behavior across all pages.
- Validate banner destinations; allow safe internal URLs and explicitly approved HTTPS destinations, rejecting script URLs. Avoid embedding important accessible copy only in images.
- Avoid fetching every product section again when the aggregate response already includes it. Dedicated collection pages use `/home/products` pagination.
- Choose a stable first-render banner view and reconcile client viewport if needed. Reserve hero dimensions to prevent layout shift; do not assume the server knows exact viewport width.
- The aggregate endpoint can fail as a whole. Show a homepage error/retry state while retaining the static shell. Per-section retries need separate endpoints; do not imply aggregate partial success.
- Never display fake catalog data after a failed production request. Use skeletons during loading and honest empty/error states.

## 5. UI/UX and design system

### Visual direction

Use a calm, product-focused store: neutral surfaces, a single configurable brand accent, clear typography, generous spacing, and consistent photography. Establish semantic tokens for background, foreground, card, border, muted, primary, destructive, success, warning, focus and overlay. Build light and dark palettes from these roles instead of scattering fixed colors.

- Content width around 1200–1320 px with 16 px mobile gutters and larger desktop gutters.
- Product grids: 2 columns on typical phones, 3 on tablets, 4 on desktop; allow 1 column when narrow content or zoom requires it.
- Prefer readable 16 px form text and restrained heading levels. Let Arabic labels grow without clipping.
- Use consistent spacing, image ratios, border radii and control heights. Keep shadows subtle in both themes.
- Mobile product pages can use a sticky purchase bar that does not cover content, focus targets, errors, or system safe areas.
- Checkout uses a simpler header and a persistent order summary on wide screens; mobile shows an expandable summary without hiding totals.

### Reusable components

Extend the existing Button, Input, Label, Card, Badge, Dialog, Sheet, Select, Table, Skeleton, Separator, Tooltip, Avatar and DropdownMenu. Add shared Header, Footer, Breadcrumbs, ProductCard, ProductGrid, ProductGallery, Price, QuantityControl, SearchForm, FilterPanel, Pagination, EmptyState, ErrorState, AddressForm, OrderSummary, OrderStatus and ThemeToggle.

Add shadcn-style checkbox/radio, accordion, tabs, alert and confirmation primitives only when a page needs them. A basic OTP input with paste/autocomplete can precede any specialized package. Avoid carousels, chart libraries and animation libraries until there is a concrete interaction requirement.

### Accessibility and feedback

Target WCAG 2.2 AA and validate manually as well as with automation. Use semantic landmarks/headings, visible focus, labeled icon buttons, keyboard navigation, meaningful image alternatives, and errors connected to inputs. Verify contrast in both themes and keep dialogs focus-trapped with focus restored on close. See the [W3C reference](https://www.w3.org/WAI/WCAG22/quickref/).

Use approximately 44 px interactive targets where practical, reduced-motion support, sufficient spacing and no color-only status communication. Keep quantities and cart feedback accessible through a polite live region. Toasts supplement inline confirmation; they must not be the only place a critical checkout error appears.

Every data feature needs loading, empty, failure, retry, success, disabled and permission states where applicable. Preserve already rendered results during pagination refetches with an explicit updating indicator; never let stale values appear confirmed after checkout validation fails.

## 6. API integration contract

All paths in this section are relative to `/api/v1` unless noted. Use feature adapters to unwrap actual responses; do not assume every module shares `{success,message,data}`. Authentication returns token fields outside `data`, and the global error handler can return only `message` plus development diagnostics. Never expose stack/cause data in UI.

### Public endpoints

| Method | Path | Purpose / inputs |
| --- | --- | --- |
| GET | `/home` | `view`, `limit` (1–20, default 8) |
| GET | `/home/products` | `section=latest|best-offers|best-sellers`, `page`, `limit` |
| GET | `/banners/list` | Public banner listing; use validated view/pagination inputs |
| GET | `/products/list` | Public list with supported filters; limit up to 100 |
| GET | `/products/slug/:slug` | Canonical product route resolution |
| GET | `/products/:productId` | Public product detail by ID |
| GET | `/products/category/:categoryId` | Category products with product-list filters |
| GET | `/categories/list`, `/categories/active`, `/categories/root` | Public category lists; use each validator's allowed query fields |
| GET | `/categories/tree` | Full public category navigation |
| GET | `/categories/slug/:slug` | Public category detail |
| GET | `/categories/:categoryId/children`, `/categories/:categoryId/tree` | Descendant navigation |

### Customer authentication

| Method | Path | Body / behavior |
| --- | --- | --- |
| POST | `/auth/register` | `firstName`, `lastName`, `email`, `password`, `confirmPassword` |
| POST | `/auth/confirm-email` | `email`, `otp` |
| POST | `/auth/resend-confirm-email` | `email` |
| POST | `/auth/login` | `email`, `password`; receive access credentials and refresh cookie |
| POST | `/auth/google` | `idToken`; provider setup required |
| POST | `/auth/google/link` | `idToken`, `currentPassword`; authenticated |
| POST | `/auth/refresh-token` | Empty body; HttpOnly refresh cookie |
| POST | `/auth/logout` | Access authorization plus refresh cookie |
| POST | `/auth/logout-all` | Access authorization |
| GET | `/auth/profile` | Authenticated profile |
| PATCH | `/auth/profile` | Supported profile fields; multipart avatar when uploading |
| PATCH | `/auth/change-password` | `currentPassword`, `newPassword`; cookie cleared by backend |
| PATCH | `/auth/forgot-password` | `email` |
| PATCH | `/auth/reset-password` | `email`, `otp`, `newPassword`, `confirmPassword` |

The backend's authorization scheme is **`user <accessToken>`**, not an assumed `Bearer` scheme. Use the returned `tokens.tokenType`; admin is `admin <accessToken>`. Customer refresh cookie is `refreshToken`, HttpOnly, SameSite=Lax, scoped to `/api/v1/auth`; admin uses `adminRefreshToken` scoped to `/api/v1/admin/auth`.

Keep access tokens in memory. Initialize a customer session through one refresh attempt, then profile retrieval; show a session-loading state before deciding whether to redirect. Implement one shared in-flight refresh per identity, queue affected requests, retry an eligible request once, and stop refresh loops. Skip automatic refresh for failed login/refresh requests. On terminal session failure clear protected query data and return to login with a safe internal return path.

Keep same-origin browser requests through the existing rewrite and `withCredentials: true`. Verify cookie setting, refresh and logout across local and deployed HTTPS environments. Do not assume page Server Components receive refresh cookies scoped to `/api/v1/auth`; customer pages can render a shell and fetch protected data after client session bootstrap. A future server-session/BFF design requires an explicit cookie/authorization redesign.

### Cart, addresses, orders and payments

| Method | Path | Body / notes |
| --- | --- | --- |
| GET | `/cart` | Items, availability, version, currency, totals |
| POST | `/cart/items` | `productId`, `quantity`; adds quantity |
| PATCH | `/cart/items/:productId` | `quantity`; absolute quantity update |
| DELETE | `/cart/items/:productId` | Remove item |
| DELETE | `/cart/clear` | Clear cart |
| GET / POST | `/addresses` | List / create address |
| PATCH / DELETE | `/addresses/:addressId` | Edit / delete address |
| PATCH | `/addresses/:addressId/default` | Empty body; set default |
| POST | `/orders/checkout` | Versioned price snapshot; `Idempotency-Key` required |
| GET | `/orders` | Customer's orders; `page`, `limit` |
| GET | `/orders/:orderId` | Owned order detail |
| PATCH | `/orders/:orderId/cancel` | Optional `reason`; server eligibility rules |
| POST | `/payments/checkout` | `{orderId}`; separate `Idempotency-Key` required |
| GET | `/payments/orders/:orderId` | Authoritative payment state |
| POST | `/payments/webhook` | Provider-to-backend only; frontend never calls it |

Address fields: `label`, `fullName`, `phone`, `country`, `city`, `street`, optional `building`, `apartment`, `isDefault`. Prefer dedicated address endpoints over replacing the profile's complete address array. Do not invent required postal/state fields absent from this contract.

### Admin endpoints

- Authentication: `POST /admin/auth/login`, `/refresh-token`, `/logout`, `/logout-all`; `GET/PATCH /admin/auth/profile`; `PATCH /admin/auth/change-password`.
- Administrators: `GET/POST /admin`, `GET/PATCH/DELETE /admin/:id`, `PATCH /admin/:id/status`; management routes require super admin.
- Customers: `GET/POST /admin/users`, `GET/PATCH/DELETE /admin/users/:id`, `PATCH /admin/users/:id/status`. `/users` is also mounted, but the admin-prefixed route makes frontend intent clearer.
- Products: `GET/POST /products`, `PATCH/DELETE /products/:productId`.
- Categories: `GET/POST /categories`, `GET/PATCH/DELETE /categories/:categoryId`.
- Banners: `GET/POST /banners`, `GET/PATCH/DELETE /banners/:bannerId`.
- Orders: `GET /orders/admin`, `GET /orders/admin/:orderId`, `PATCH /orders/admin/:orderId/status` with `expectedStatus`, `status`, optional `reason`.
- Reporting: `GET /dashboard/overview`, `/dashboard/sales`, `/dashboard/top-products`; implement filters from their validators before building controls.

For multipart uploads, let the browser set the boundary. Verified fields/limits: avatar `avatar` up to 2 MB; category/banner `image` up to 5 MB; product `images` up to 10 files, 5 MB each. Validate accepted formats against backend inspection rules during implementation; file extensions alone are insufficient. Handle failed uploads without losing the rest of the form.

### Money, checkout and payment: required behavior

Catalog/home `price` and `compareAtPrice` are major-unit amounts. Cart provides both legacy major-unit totals and authoritative `unitPriceMinor`/`subtotalMinor`; new orders provide `*Minor` fields and `currencyExponent`. Format minor amounts by dividing by `10 ** currencyExponent` only for display. Do not divide catalog prices again. Use explicit `formatMajorMoney`/`formatMinorMoney` interfaces and backend-supplied currency; locale changes formatting, not value.

1. Require a customer session and obtain a fresh cart and saved address list. Block unavailable items and missing prices; let users remove or reduce problematic items.
2. Review quantities from the cart, selected address, and current totals. Send `POST /orders/checkout` with `{version, addressId, items: [{productId, unitPriceMinor}]}`. Quantities come from the server cart and are not supplied in this body.
3. Generate an order idempotency key once per reviewed checkout attempt, 16–128 characters using letters/numbers/underscore/hyphen. Preserve the key and exact request across ambiguous timeouts/retries. A changed reviewed request needs a new key after reconciliation.
4. On `409`, distinguish an uncertain previous attempt from a genuinely changed cart/price/stock. Reconcile the original request first where needed; reload and ask the customer to review changed values. Never silently accept a price increase.
5. Successful order creation reserves/decrements stock and clears the cart before payment. Save the returned order ID and invalidate cart, orders and affected catalog queries. Do not create another order if payment initiation fails.
6. Start `POST /payments/checkout` with `{orderId}` and a separate key retained for that order. Backend rejects a different payment key after a payment has been claimed. Retain key association across reloads (scoped by customer/order, without storing credentials); retrieve payment status/checkout URL before attempting another mutation.
7. Redirect only to the validated returned HTTPS Stripe checkout URL. No frontend Stripe SDK or embedded card form is required for this flow.
8. On return, fetch order and payment status. Browser URL parameters or a success-page visit are not proof of payment. Use bounded polling while pending, stop on terminal state or timeout, and offer manual refresh/support.
9. Payment status is `unpaid` when absent, otherwise `pending`, `paid`, or `expired`. Fulfillment status is independently `placed`, `processing`, `shipped`, `delivered`, or `cancelled`.
10. Customers can cancel eligible placed orders, but pending/paid payment records block cancellation; expired payment records are treated differently. Surface backend conflicts and refresh instead of guessing eligibility from fulfillment status alone. No refund workflow is implemented.
11. Legacy order responses have `schemaVersion: 1`, `legacy: true`, and unknown currency. Show limited historical detail, do not invent currency or convert totals, and suppress unsupported payment/transition actions.

**Payment return dependency:** success/cancel URLs are static backend configuration; the implementation does not append order ID or locale. Before launch, agree return routing and recovery: persist the active order/locale for the same-tab redirect, then verify ownership through the API; fall back to authenticated order history when context is absent. A robust cross-device order-specific return requires backend support. Do not treat Stripe's session identifier as an order ID.

**Operational limits:** current payment code accepts exponent 2 and EGP/USD/EUR/GBP/AED/SAR, with positive bounded amounts. Payment requires provider configuration. Expired or uncertain sessions need an agreed reconciliation process. Shipping/tax/discount are presently zero in order creation; business fulfillment/payment policy must be resolved before launch.

### Query and error strategy

- Public keys: `['home', locale, view, limit]`, `['products', locale, normalizedFilters]`, `['product', locale, slug]`, `['categories', locale, scope]`.
- Protected keys include identity/user ID: cart, profile, addresses, orders and payment. Clear them on logout/account switch; never reuse customer data across accounts.
- Use mutation responses to replace cart state; serialize or disable overlapping quantity changes initially. Do not optimistically confirm stock, orders, payments, or final totals.
- Refetch cart before checkout, after mutations, and when returning from payment. Invalidate category/product/home data after relevant admin changes; respect backend `no-store` for homepage/dashboard/banner responses.
- Distinguish HTTP 400 validation, 401 session expiry, 403 permission, 404 unavailable resource, 409 stale state, 429 rate limit, 5xx and offline/timeout. Use localized fallbacks and stable error codes when available; request backend error codes if reliable translation would otherwise require matching English strings.
- Retry safe reads conservatively. Avoid automatic mutation retries unless the operation has a retained idempotency key and an explicit recovery policy. Respect Retry-After when supplied.

## 7. English/Arabic localization and RTL

- Retain next-intl, locale-prefixed routing and existing navigation helpers. Switching locale preserves the current page, safe search parameters, and user state.
- Expand both dictionaries using shared namespaces: `Common`, `Navigation`, `Home`, `Products`, `Categories`, `Search`, `Auth`, `Cart`, `Checkout`, `Account`, `Orders`, `Addresses`, `Validation`, `Errors`, `Footer`, `Admin`.
- Translate labels, placeholders, errors, empty/loading states, accessibility labels, metadata and status names. Check key parity automatically and use ICU plural messages for Arabic counts.
- Pass locale explicitly into server-side requests and shared browser requests; avoid a mutable server-global locale header that could leak between concurrent visitors.
- Use logical spacing/alignment (`start/end`, `ms/me`, `ps/pe`) and direction-aware icons. Mirror directional arrows, not logos or product photography.
- Verify Radix portals, menus, sheets, toast placement, pagination, galleries and keyboard behavior in RTL. Use LTR/isolation for emails, phone numbers, SKUs and mixed-language identifiers as needed.
- Use Intl/next-intl number/date formatting; store timestamps unchanged and label report timezone. Format money with the API currency and correct units.
- Catalog strings remain as authored until the backend supports localized fields. Banners already carry language and device view; do not imply all API messages or product descriptions are translated.
- Set localized document metadata, alternate-language links and canonical URLs; keep identifiers/slugs stable unless a future backend contract introduces localized slugs.

## 8. Light/dark/system themes

- Keep the existing class-based next-themes provider, system default, and persistent visitor preference.
- Offer named Light, Dark and System options with keyboard access and visible selected state. Avoid an icon whose meaning is ambiguous.
- Resolve hydration-sensitive theme controls after mounting; reserve their dimensions. Limit hydration suppression to genuinely necessary theme attributes.
- Define semantic tokens for all surfaces, borders, text, controls, focus and feedback. Confirm disabled controls remain understandable.
- Check product images on appropriate neutral surfaces; do not invert images. Treat hero artwork independently from UI colors.
- Apply the selected theme to dialogs, sheets, inputs, menus, skeletons, toasts, and admin tables. Verify system theme changes when System is selected.

## 9. Frontend architecture

```text
messages/
  en.json
  ar.json
src/
  app/
    [locale]/
      (store)/             Homepage, catalog, collections, informational pages
      (auth)/              Login, registration, verification, recovery
      (customer)/          Cart, checkout, account routes
      admin/               Separate admin layout and pages
      loading.tsx
      error.tsx
      not-found.tsx
    providers.tsx
    globals.css
  components/
    ui/                    Existing primitives
    layout/                Header, footer, navigation
    shared/                Price, pagination, empty/error states
    providers/             Query/theme and session providers
  features/
    home/ products/ categories/
    auth/ cart/ addresses/ checkout/ orders/ payments/
    admin/                 Admin identity and management features
  lib/
    api/                   Axios clients, error normalization, refresh coordination
    money/                 Explicit major/minor formatting
  i18n/                    Existing routing, request and navigation
  proxy.ts                 Locale routing; exclude API/media/framework paths
```

Each feature owns `api`, `types`, `hooks`, `components`, and form schemas as needed. Keep page files focused on composition. Use URL state for catalog filters, local state for UI, Query for remote data, and narrow context for session state. Do not add Redux/Zustand merely to duplicate Query caches.

Use Server Components for public initial content and metadata, with client islands for forms, filters, galleries and cart actions. Server API access needs an absolute configured backend URL; the browser's relative Axios base URL is not a server transport. Keep credentials out of public HTML and never forward user authorization into shared public caches.

The installed guides read for this plan are `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`, `02-guides/client-side-data-fetching/tanstack-query.md`, and `02-guides/internationalization.md`. Read the relevant additional installed guide before implementation. With Cache Components enabled, use supported Suspense/runtime-data boundaries rather than copying older route-cache recipes. Cache only deliberately safe content; no shared caching of personal/payment data.

## 10. Package plan

Retain the current stack. This documentation task does not require installing packages or upgrading dependencies.

| Addition | When / purpose | Decision |
| --- | --- | --- |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Phase 2 forms: reusable validation and typed form schemas | Recommended together after checking resolved React/TypeScript compatibility; [form documentation](https://react-hook-form.com/get-started), [schema documentation](https://zod.dev/) |
| `@playwright/test` | Phase 2 onward: browser coverage for auth/cart, later checkout and RTL/theme | Recommended dev dependency; [official documentation](https://playwright.dev/docs/intro) |
| Unit test runner | Money conversion, response adapters, refresh coordination and checkout recovery | Choose when implementing these critical helpers; avoid adding a runner solely for this document |
| Additional UI packages | Only if a concrete component cannot be served by current Radix/shadcn/CSS | Defer |

Use existing CSS animation utilities and Intl formatting. Hosted Stripe redirects do not need `@stripe/react-stripe-js`. Google sign-in can use the provider's supported browser flow after configuration is verified; select a wrapper only if it reduces actual implementation work. No chart package is needed for the storefront; admin reporting can begin with tables.

Use the repository's existing package manager and lockfile, check peer dependency compatibility, pin the resulting resolved graph, and avoid unrelated upgrades.

## 11. SEO, performance and operational quality

- Generate localized product/category titles and descriptions, canonical and language alternates, Open Graph data, sitemap and robots behavior. Mark account/admin/checkout pages noindex; authorization still protects their data.
- Use accurate Product/Breadcrumb structured data from API fields. Do not fabricate ratings, reviews, delivery promises or offer expiry.
- Make catalog pagination crawlable. Define canonical/noindex rules for low-value filter combinations and internal search to avoid uncontrolled URL indexing.
- Use optimized images with known aspect ratios, responsive sizes and allowlisted media origins. Prioritize the initial hero/product image; lazy-load lower content.
- Keep initial product content server-rendered where practical. Prevent duplicate hydration requests when providing initial Query data.
- Measure mobile LCP, INP and CLS; project targets are LCP <= 2.5 s, INP <= 200 ms and CLS <= 0.1 under representative conditions. These are acceptance targets, not current measured results.
- Record useful frontend errors without credentials, OTPs, payment secrets or unnecessary personal data. Add analytics only with an approved data/consent policy; count purchase events after verified payment and deduplicate by order ID.
- Production readiness includes backend availability, exact origin/media configuration, HTTPS cookies, email delivery, Google configuration if enabled, Stripe webhook delivery and payment return URLs.

## 12. Delivery phases and acceptance gates

### Phase 0 — Contract and environment foundation

- [ ] Confirm lockfile/package manager, backend base URL and deployed media origins.
- [ ] Correct public API paths and add locale propagation.
- [ ] Capture sanitized response fixtures for home, catalog, auth, cart, addresses, orders and payments.
- [ ] Define typed adapters, currency units, error model and query-key conventions.
- [ ] Verify cookie/session behavior through the rewrite and identify payment-return recovery requirements.
- [ ] Document business decisions: brand, contact/policy content, fulfillment, accepted store currency and enabled sign-in/payment methods.

Gate: public browsing works unauthenticated; customer/admin authorization and money contracts are demonstrated against a test backend.

### Phase 1 — Storefront foundation and discovery

- [ ] Build tokens, responsive header/footer, locale/theme controls, loading/error/empty states.
- [ ] Implement homepage, category navigation, product listing/detail, search and collection pages.
- [ ] Add metadata, responsive images and URL-based filtering/pagination.
- [ ] Verify English/Arabic and both themes for every delivered component.

Gate: a visitor can find and inspect real products on phone and desktop without admin credentials or broken navigation.

### Phase 2 — Customer identity, addresses and cart

- [ ] Add form packages when implementing reusable forms.
- [ ] Complete register/verify/login/recovery, profile/security and session bootstrap/refresh.
- [ ] Implement addresses and cart mutation/reconciliation flows.
- [ ] Preserve intended add-to-cart action after login with duplicate-submit protection.
- [ ] Add browser tests for session isolation, quantity changes and validation.

Gate: users can authenticate, manage addresses and maintain an accurate cart; logout/account switch removes private data.

### Phase 3 — Orders and payments

- [ ] Implement reviewed checkout snapshots, idempotency retention and conflict handling.
- [ ] Implement hosted payment handoff, return recovery, bounded status polling and support states.
- [ ] Build order list/detail and eligible cancellation.
- [ ] Test ambiguous timeouts, duplicate clicks, stock/price changes, cart changes in another tab, delayed webhook and missing return context.
- [ ] Agree operational handling for unpaid/expired orders, stock reservation and payment reconciliation.

Gate: one checkout attempt cannot accidentally create duplicate orders/payments; paid UI appears only after server verification.

### Phase 4 — Launch readiness

- [ ] Complete approved informational/policy pages and translations.
- [ ] Validate keyboard/screen-reader journeys, RTL, dark mode and small-screen layouts.
- [ ] Verify SEO, performance, image origins, offline/error handling and deployed cookie behavior.
- [ ] Run lint, type checks, production build and the critical browser suite.
- [ ] Verify configured email, payment/webhook and recovery behavior in a test environment.

Gate: no placeholder claims or dead feature controls, no unresolved purchase-blocking defects, and all launch dependencies have owners.

### Phase 5 — Administration

- [ ] Separate admin identity, dashboard and management layouts.
- [ ] Product/category/banner forms with uploads and conflict feedback.
- [ ] Orders with expected-status checks; customer and super-admin management.
- [ ] Reporting filters and tables; optional charts after data contracts are validated.

Gate: backend role restrictions hold even when visiting a route directly; changes refresh affected storefront data.

## 13. Verification matrix

| Area | Required scenarios |
| --- | --- |
| Browsing | Public access, valid/invalid slugs, empty catalog, failed API, filters/pagination/back navigation |
| Home | No banners, missing mobile/locale artwork, empty offers/sellers, null best deal, aggregate failure |
| Authentication | Verification/resend limits, invalid credentials, reload bootstrap, expired access, concurrent 401s, failed refresh, logout-all |
| Authorization | Customer cannot call admin routes; cross-account order access fails; caches clear on identity change |
| Cart | Quantity bounds, unavailable/deleted products, changed prices, rapid updates, multi-tab changes, timeout recovery |
| Checkout | Missing address, changed version, changed price/stock, repeated key with same/different body, ambiguous response |
| Payment | Initiation failure after order creation, original-key recovery, pending/paid/expired, delayed webhook, forged success URL, lost context |
| Orders | Separate payment/fulfillment state, forbidden cancellation, stale admin transition, legacy order display |
| Money | Major vs minor amounts, non-default exponent display, zero/free product, API currency vs locale, payment currency limits |
| Localization | Message-key parity, Arabic plurals, mixed-direction values, translated accessibility labels, preserved navigation |
| Theme/layout | EN/AR x light/dark; system preference change; 360/768/1280 px plus zoom/reflow |
| Accessibility | Keyboard-only purchase journey, focus restoration, error announcements, contrast, reduced motion |
| Deployment | Rewrite destination, media allowlist, cookie path/security, no private shared cache, provider return/webhook configuration |

During implementation run the existing `lint` and `build` scripts and a TypeScript no-emit check with the repository's package manager. Add focused tests for money/adapters/session/idempotency logic and browser tests for critical user journeys. A documentation-only change does not need an application build.

## 14. Immediate first implementation slice

Start with Phase 0 and a small end-to-end browsing slice: fix public API clients, implement unit-aware prices, build the bilingual themed header/footer, and render the real homepage with product/category links. Then add catalog/detail pages before authentication and checkout. Keep each slice usable in both languages and themes so localization and accessibility do not become a final retrofit.
