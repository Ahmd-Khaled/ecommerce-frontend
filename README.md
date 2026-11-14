# E-commerce storefront

A customer-facing bilingual ecommerce storefront built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and next-intl.

## Quick start

1. Install dependencies with `npm ci`.
2. Create `.env.local` in the repository root and configure the backend API base URL, including the API version:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
   ```

3. Start the development server with `npm run dev`.
4. Open `http://localhost:3000/en` or `http://localhost:3000/ar`.

## Current storefront pages

- `/[locale]` — homepage with banners, categories, featured deal, and product collections.
- `/[locale]/products` — searchable/filterable product catalog with sorting and pagination.
- `/[locale]/products/[slug]` — product information, responsive image gallery, zoom viewer, stock, and quantity controls.

English and Arabic are supported. Arabic uses RTL document direction.

## Architecture

- App Router route files are intentionally thin.
- Page composition and server data orchestration live under `src/features`.
- Feature API modules use server-side fetch, locale headers, and typed response contracts.
- Shared UI and storefront primitives live under `src/components`.
- Locale messages live in `messages/en.json` and `messages/ar.json`.

## Documentation

Start with the [project guide](docs/README.md). It covers architecture, route map, environment setup, API conventions, and documentation maintenance.

- [API fetching reference](docs/API_FETCHING.md)
- [Homepage guide](docs/pages/HOME.md)
- [Product catalog guide](docs/pages/PRODUCT_CATALOG.md)
- [Product details guide](docs/pages/PRODUCT_DETAILS.md)
- [Folder structure](docs/FOLDER_STRUCTURE.md)

**Documentation rule:** whenever a page is updated, update its matching page guide in `docs/pages/` in the same change. Update the API reference whenever endpoint contracts or fetching behavior changes.

## Quality checks

```bash
npm run lint
npm run build
```
