# E-commerce website

A clean Next.js storefront foundation using TypeScript, Tailwind CSS, next-intl, React Query, and Axios.

## Development

1. Run `npm ci`.
2. Set `NEXT_PUBLIC_API_URL` in `.env.local` to the backend API base URL including its version path (for example, `http://localhost:4000/api/v1`).
3. Run `npm run dev` and open `http://localhost:3000`.

The locale proxy routes visitors to English or Arabic (`/en` and `/ar`). Both have a minimal starting page in `src/app/[locale]/page.tsx`.

## Shared foundation

- English/Arabic translations and RTL support.
- Theme, query, and toast providers; reusable UI components.
- Axios client and error handling with same-origin `/api/v1` requests forwarded to the configured backend.
- Existing read-only product and category API methods and response types.
- Public homepage API, response types, and `useHome(view, locale)` hook for backend-managed banners, categories, and product sections.
- Currency formatting and responsive utilities.

The starting page makes no backend requests. The retained API methods are ready for future website features; verify their public access rules against the backend when integrating them. Customer authentication, cart, checkout, and website design are not implemented yet.

Admin routes, management mutations, login/session handling, dashboard components, and dashboard translations have been removed. The API client does not attach admin credentials or refresh admin sessions.

## Checks

- `npx next typegen`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

See [folder structure](docs/FOLDER_STRUCTURE.md) for code organization.
