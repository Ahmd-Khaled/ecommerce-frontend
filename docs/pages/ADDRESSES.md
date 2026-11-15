# Saved customer addresses

**Route:** `/[locale]/addresses`

The address feature manages the authenticated customer's addresses through the backend's embedded `User.address` array. The frontend does not create a separate address collection.

## API

Feature modules:

- `src/features/addresses/api/address.api.ts`
- `src/features/addresses/types/address.types.ts`
- `src/features/addresses/hooks/use-addresses.ts`
- `src/features/addresses/components/address-form-dialog.tsx`
- `src/features/addresses/components/addresses-page.tsx`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/addresses` | List the current customer's saved addresses |
| POST | `/addresses` | Create an address |
| PATCH | `/addresses/:addressId` | Update an address |
| PATCH | `/addresses/:addressId/default` | Set the default address |
| DELETE | `/addresses/:addressId` | Delete an address |

The authenticated user is determined by the backend token. The client never sends a user ID or chooses address ownership. Address fields are label, fullName, phone, country, city, street, and optional building/apartment. Each address has a stable `_id` and `isDefault` flag.

## Behavior

- Address queries are scoped by customer ID in TanStack Query.
- Customers can add, edit, delete, and set a default address.
- The first saved address is selected as default by the backend unless the request explicitly says otherwise.
- When the default address is deleted, the backend promotes a remaining address.
- Backend validation and atomic concurrency handling remain authoritative.
- Address management is linked from the customer account page and is available during checkout.

## Verification

Test first-address creation, multiple addresses, edit/clearing optional fields, default switching, deleting default/non-default addresses, API conflicts, and ownership failures in English and Arabic.
