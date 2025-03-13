# User Service

This service handles user authentication, registration, and profile management.

## Database Schema Changes

### Merged User and UserProfile Tables

We've merged the `users` and `user_profiles` tables to simplify the data model and improve performance. This change:

1. Eliminates the need for joins when retrieving user data
2. Simplifies the API by having all user data in a single object
3. Reduces the number of database queries needed for common operations

### Migration

A migration script has been created to handle this change:

```
apps/backend/services/user-service/src/migrations/1710347983000-MergeUserProfileIntoUser.ts
```

This migration:
1. Adds all profile fields to the `users` table
2. Copies data from `user_profiles` to `users`
3. Drops the `user_profiles` table

To run the migration:

```bash
cd apps/backend/services/user-service
npm run typeorm migration:run
```

## Code Changes

The following files have been updated to support the merged user entity:

### Backend

- `apps/backend/services/user-service/src/user/entity/user.entity.ts`: Updated to include all profile fields
- `apps/backend/services/user-service/src/user/user.service.ts`: Updated to remove profile-related methods and handle the merged entity
- `apps/backend/services/user-service/src/user/user.controller.ts`: Updated to handle the merged entity
- `apps/backend/services/user-service/src/user/user.module.ts`: Updated to remove the UserProfile entity
- `apps/backend/services/user-service/src/auth/auth.service.ts`: Updated to handle the merged entity

### Frontend

- `apps/frontend/services/api/types.ts`: Updated the User interface to include all profile fields
- `apps/frontend/app/profile/edit.tsx`: Updated to handle the merged entity

## API Changes

The API endpoints remain the same, but the response structure has changed:

Before:
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "profile": {
    "userId": 1,
    "gender": "male",
    "heightCm": 180,
    "weightKg": 75
  }
}
```

After:
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "gender": "male",
  "heightCm": 180,
  "weightKg": 75
}
```

For backward compatibility, the `profile` field is still included in the User interface, but it's deprecated and will be removed in a future version.
