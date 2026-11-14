# Storefront project guide

This folder is the maintained technical guide for the public customer-facing storefront. Update the relevant page guide whenever a route, section, data dependency, or API behavior changes.

## Project at a glance

- **Framework:** Next.js 16 App Router with React 19 and TypeScript.
- **Styling:** Tailwind CSS v4 and shared CSS design tokens in `src/app/globals.css`.
- **Localization:** next-intl with English (`en`) and Arabic (`ar`); locale routing is always prefixed and Arabic pages render RTL.
- **Data fetching:** server-side `fetch` in feature-specific `*.server.ts` modules for SEO-friendly initial page content.
- **Client interactions:** focused client components for carousels, galleries, filters, and other interactive controls.
- **Shared UI:** reusable components under `src/components`; feature-specific UI belongs under `src/features/<feature>`.

## Routes and page guides

| Route | Purpose | Guide |
|---|---|---|
| `/[locale]` | Store homepage | [Homepage](pages/HOME.md) |
| `/[locale]/products` | Product catalog, filters, and pagination | [Product catalog](pages/PRODUCT_CATALOG.md) |
| `/[locale]/products/[slug]` | Product details, gallery, zoom, and purchase controls | [Product details](pages/PRODUCT_DETAILS.md) |

The route `page.tsx` files should remain thin: import and export the feature page component. Put page composition and data orchestration in the matching feature folder.

## Environment

Create `.env.local` in the repository root:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

The value must include the backend API version prefix. Do not append `/api/v1` again in feature request paths.

Run locally:

```bash
npm ci
npm run dev
```

Then open `http://localhost:3000/en` or `http://localhost:3000/ar`.

## API fetching conventions

1. Read the configured base URL from `NEXT_PUBLIC_API_URL`.
2. Remove trailing slashes from the base URL before appending an endpoint.
3. Send `Accept: application/json` and `Accept-Language: <locale>`.
4. Public page fetches currently use `cache: "no-store"` so product, inventory, homepage and currency data remain current.
5. The backend response envelope is `{ success, message, data }`. Validate `success` and `data` before using the payload.
6. Keep backend calls in server-only feature API modules. Do not expose server orchestration in route files.
7. Handle HTTP errors and network errors. A missing product should resolve to the route's not-found UI; other page failures should show a useful fallback.
8. Keep response types aligned with the backend contract. Do not guess or silently rename backend fields.

### Current public endpoints

| Page / data | Request |
|---|---|
| Homepage desktop content | `GET /home?view=desktop&limit=8` |
| Homepage mobile banners | `GET /home?view=mobile&limit=8` |
| Catalog product list | `GET /products/list?<page,limit,search,minPrice,maxPrice,sortBy,sortOrder>` |
| Product by slug | `GET /products/slug/:slug` |
| Currency metadata | Read from `GET /home?view=desktop&limit=1` |

All requests are relative to `NEXT_PUBLIC_API_URL`. See [API fetching reference](API_FETCHING.md) for request and response details.

## Currency and localization

- Product prices returned by these public endpoints are major currency units.
- Use the currency and `currencyExponent` returned by the homepage endpoint when formatting page prices.
- Current fallback when currency metadata cannot be read is EGP with exponent 2. Treat this as a fallback, not the preferred source.
- Locale is sent to the API using `Accept-Language`.
- Keep all user-visible labels in `messages/en.json` and `messages/ar.json`.
- For next-intl messages containing placeholders, always provide all interpolation values at the call site. For example: `t("imageNumber", { current, total })`.

## Page documentation maintenance

Whenever a page changes, update its matching file in `docs/pages/` in the same change:

- Add/remove/reorder sections and describe their purpose.
- Document API endpoints, query parameters, response fields used, and fetch strategy.
- Update loading, empty, error, SEO, and interaction behavior where relevant.
- Keep file paths and component names accurate.
- If a shared API convention or project-wide architecture changes, update this guide and `API_FETCHING.md` as well.

## Quality checks

Before merging a feature branch, run:

```bash
npm run lint
npm run build
```

For UI changes, also manually inspect both `/en` and `/ar` at mobile, tablet, and desktop widths. Check keyboard focus, accessible names, RTL direction, image loading, and browser console errors.

## More documentation

- [API fetching reference](API_FETCHING.md)
- [Folder structure](FOLDER_STRUCTURE.md)
- [Homepage page guide](pages/HOME.md)
- [Product catalog page guide](pages/PRODUCT_CATALOG.md)
- [Product details page guide](pages/PRODUCT_DETAILS.md)
