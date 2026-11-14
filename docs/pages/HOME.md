# Homepage — `/[locale]`

## Purpose

The storefront homepage introduces the store, highlights active campaigns and categories, and presents product collections supplied by the backend.

## Page composition

**Route file:** `src/app/[locale]/page.tsx`  
**Feature orchestrator:** `src/features/home/components/home-content.tsx`

The route file wraps `HomeContent` in `Suspense` with `HomeLoading` as the fallback. `HomeContent` is a server component and composes these sections in order:

1. **Hero banner carousel** — responsive desktop/mobile campaign banners, slide controls, pagination indicators, and optional campaign link.
2. **Trust strip** — shopping confidence / service benefits.
3. **Category section** — horizontally scrollable category cards.
4. **Best deal** — featured single product, when provided.
5. **Latest products** — horizontal product rail.
6. **Special offers** — horizontal product rail.
7. **Best sellers** — horizontal product rail.
8. **Promotional banners** — additional campaign placements.

Sections with no data are omitted. If all store content is empty, an empty-state message is shown. If both homepage requests fail, the page renders a connection error and retry link.

## API fetching

**API module:** `src/features/home/api/home.server.ts`  
**Response types:** `src/features/home/types/home.types.ts`

The page reads the active locale through `getLocale()` and sends two requests concurrently:

- `GET /home?view=desktop&limit=8`
- `GET /home?view=mobile&limit=8`

Both requests include `Accept-Language` and `Accept: application/json`, and currently use `cache: "no-store"`.

The desktop response is preferred; mobile response is a fallback if desktop fails. The mobile banner collection is passed separately to the carousel, which falls back to desktop banners if the mobile list is empty.

The homepage response provides banners, categories, latest products, offers, best deal, best sellers, currency, and currency exponent. Product sections receive currency metadata directly; they should not independently fetch or guess currency.

## Responsive behavior

- Hero carousel switches between desktop and mobile banner sets at the small-screen breakpoint.
- Category and product sections use horizontal snap rails on narrow screens.
- Product cards share the storefront product-card component.
- The first hero image is eagerly loaded and prioritized; other carousel slides are lazy loaded.
- The homepage loading skeleton mirrors the major hero, benefit, and product-section shapes.

## Localization and SEO

- Locale routing supports `/en` and `/ar`.
- The locale layout sets `lang` and `dir`; Arabic uses RTL.
- Home copy is in the `Home` namespace in `messages/en.json` and `messages/ar.json`.
- Banner text and alt text may be supplied by the backend; fallback labels come from translations.

## Main files

- `src/app/[locale]/page.tsx`
- `src/features/home/components/home-content.tsx`
- `src/features/home/components/home-loading.tsx`
- `src/features/home/components/banner-carousel.tsx`
- `src/features/home/components/category-section.tsx`
- `src/features/home/components/product-section.tsx`
- `src/features/home/api/home.server.ts`
- `src/features/home/types/home.types.ts`
- `messages/en.json`, `messages/ar.json`

## Maintenance notes

When changing the order or behavior of homepage sections, update this guide. When the homepage response contract changes, update the response type, server API module, this guide, and `docs/API_FETCHING.md` together.
