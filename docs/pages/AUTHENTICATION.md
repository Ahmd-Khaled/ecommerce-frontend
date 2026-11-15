# Customer Authentication

The storefront customer authentication feature is implemented under `src/features/auth`. It uses the existing backend auth routes and keeps access credentials in memory only.

## Routes

| Route | Purpose |
| --- | --- |
| `/[locale]/login` | Customer email/password login |
| `/[locale]/register` | Customer registration |
| `/[locale]/verify-email` | Email OTP verification and resend |
| `/[locale]/forgot-password` | Request a password-reset OTP |
| `/[locale]/reset-password` | Verify reset OTP and set a new password |
| `/[locale]/account` | Current customer session and sign-out actions |
| `/[locale]/cart` | Protected customer cart |

Each `page.tsx` is a small route entry that imports the feature component.

## Backend API

All requests use the shared Axios instance at `src/lib/api/axios.ts`, whose base URL is `/api/v1`. Next.js rewrites this path to `NEXT_PUBLIC_API_URL`. Requests include credentials so the browser sends the backend's HttpOnly refresh cookie.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create an unverified customer account |
| POST | `/auth/confirm-email` | Confirm the email using `email` and `otp` |
| POST | `/auth/resend-confirm-email` | Request another email confirmation code |
| POST | `/auth/login` | Sign in using `email` and `password` |
| POST | `/auth/refresh-token` | Rotate refresh token and issue a new access token |
| GET | `/auth/profile` | Retrieve the authenticated customer profile |
| POST | `/auth/logout` | Revoke the current device session |
| POST | `/auth/logout-all` | Invalidate all customer sessions |
| PATCH | `/auth/forgot-password` | Request a password-reset OTP |
| PATCH | `/auth/reset-password` | Reset password using email, OTP and new password |

## Token handling

- The backend sets `refreshToken` as an HttpOnly cookie scoped to `/api/v1/auth`; JavaScript never reads the refresh token.
- The login and refresh responses return an access token and the `user` token scheme. The frontend sends `Authorization: user <accessToken>`.
- The access token is held in module memory and is not persisted in localStorage or sessionStorage.
- On initial load, the auth provider calls the refresh endpoint and then retrieves the profile.
- A shared refresh promise prevents simultaneous 401 responses or React Strict Mode effect replay from rotating the same refresh cookie concurrently.
- A 401 from a protected request triggers one refresh attempt and retries that request once. Public auth endpoints and the refresh endpoint are excluded from this interceptor.
- The auth provider exposes `user`, `status`, `login`, `register`, `logout`, `logoutAll`, and `refreshProfile` through `useAuth()`.

## In-place quick login and protected routes

A shared `LoginDialogProvider` is mounted inside `AuthProvider` and exposes `useLoginDialog()` to client features.

- Adding a product while signed out opens a localized dialog explaining that sign-in is required. The customer can dismiss it or switch to a quick-login form without leaving the current page.
- The quick-login form uses the same `useAuth().login()` action and backend endpoint as the full login page. On successful login, the pending add-to-cart callback is completed, then the current page is reloaded so the refreshed session and cart state are restored.
- Visiting a protected route while signed out opens the same dialog with an access-required message. The dialog cannot be dismissed on a protected route; the customer must sign in or choose the registration link.
- Protected route content is withheld while the auth provider restores the session and whenever the customer is unauthenticated. This prevents a brief content flash during session restoration and prevents closing the dialog from exposing the page.
- The quick-login form includes a link to the localized registration page. Selecting it closes the dialog and navigates to registration, which is a public route.
- Current protected routes are `/account` and `/cart`. Add future customer-only routes to the `protectedPaths` list in `login-dialog-provider.tsx`.
- The protected route stays in the URL while the dialog is open. Successful login reloads that route rather than navigating to a separate login page.

## Localization

All authentication UI strings are stored in the `Auth` namespace in `messages/en.json` and `messages/ar.json`. The header also uses the localized `Storefront.login` label for signed-out customers. The shared Axios client receives the active locale through `Accept-Language`.

## Important behavior

- Registration does not automatically sign the customer in. The backend requires email confirmation before login.
- The verification page asks the customer to enter their email directly; the registration redirect does not expose the email in the URL.
- Email verification and password reset use a six-box numeric OTP input. Pasting a six-digit code fills the boxes automatically, and keyboard navigation supports arrow keys and backspace.
- Registration and password reset include a secure random password generator. Generating a password fills both password fields; the generated value can also be copied with the copy control.
- The verification page shows a 60-second countdown before the resend action is enabled and restarts the countdown after a successful resend. The backend remains authoritative for cooldown and hourly rate limits.
- Forgot-password success is intentionally generic to avoid revealing whether an email address belongs to an account.
- Signing out from the current device and signing out from all devices use separate backend endpoints.
- Backend validation remains authoritative for password and OTP requirements; the frontend performs basic required-field and password-match checks only.
