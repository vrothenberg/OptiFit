# Developer Notes for OptiFit User Service

## API Structure

The User Service API is structured with two main controllers:

1. **AuthController** (`/auth/*`) - Handles authentication and registration
   - `/auth/register` - Initial user registration with email/password
   - `/auth/complete-registration` - Complete registration with profile data
   - `/auth/login` - User login
   - `/auth/refresh` - Refresh access token
   - `/auth/profile` - Get current user profile

2. **UserController** (`/user/*`) - Handles user management and data
   - `/user/:id` - CRUD operations for users
   - `/user/profile/:userId` - User profile operations
   - `/user/circadian-questionnaire` - Circadian questionnaire operations

## Authentication Flow

The recommended authentication flow is:

1. **Initial Registration**: Call `/auth/register` with email and password
   - Returns access and refresh tokens
   - Access token is short-lived (1 hour by default)
   - Refresh token is long-lived (7 days by default)

2. **Complete Registration**: Call `/auth/complete-registration` with profile data
   - Requires authentication with the token from step 1
   - Updates the user with profile information

3. **Token Refresh**: When access token expires, call `/auth/refresh` with refresh token
   - Returns new access and refresh tokens
   - Client should automatically handle this (implemented in `api/client.ts`)

## Deprecated Endpoints

The following endpoints are deprecated and will be removed in a future version:

- `POST /user` - Legacy user creation endpoint
  - Use the two-step registration process instead (`/auth/register` + `/auth/complete-registration`)

## Authentication Fixes

### 1. Authentication Bypass Fix

The API client was previously configured to skip authentication for all POST requests containing `/user` in the URL. This has been fixed to only skip authentication for the exact `/user` endpoint (legacy user creation).

```typescript
// Old (problematic) code
const isAuthEndpoint = 
  config.url?.includes('/auth/login') || 
  config.url?.includes('/auth/register') ||
  config.url?.includes('/user') && config.method === 'post';

// New (fixed) code
const isAuthEndpoint = 
  config.url?.includes('/auth/login') || 
  config.url?.includes('/auth/register') ||
  (config.url === '/user' && config.method === 'post'); // Exact match for legacy user creation
```

This ensures that authenticated endpoints like `/user/circadian-questionnaire` properly include the authentication token.

### 2. Infinite Token Refresh Loop Fix

The API client was previously attempting to refresh tokens for all 401 Unauthorized errors, including those from authentication endpoints themselves. This caused an infinite loop when login failed:

1. Login fails with 401
2. Client tries to refresh token (which also fails with 401)
3. Client tries to refresh token again, creating an infinite loop

This has been fixed by:

1. Skipping token refresh for auth endpoints
2. Adding a retry counter to limit refresh attempts
3. Improving error handling with more descriptive messages

```typescript
// Skip token refresh for auth endpoints
const isAuthEndpoint = 
  error.config.url?.includes('/auth/login') || 
  error.config.url?.includes('/auth/register') ||
  (error.config.url === '/user' && error.config.method === 'post');

// Add retry count property if it doesn't exist
const retryCount = error.config._retryCount || 0;

// Handle 401 Unauthorized errors (but not for auth endpoints)
if (error.response?.status === 401 && !isAuthEndpoint) {
  // Check if we've already tried to refresh too many times
  if (retryCount >= 2) {
    console.error('Maximum token refresh attempts reached. Logging out.');
    await this.clearAuthToken();
    return Promise.reject(new Error('Your session has expired. Please log in again.'));
  }
  
  // Try to refresh token...
}
```

## Environment Variables

The following environment variables control JWT token behavior:

```
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
```

## Database Configuration

### Table Names

All entity classes have explicit table names to avoid conflicts with PostgreSQL reserved keywords:

- `User` entity uses table name `users` (previously conflicted with PostgreSQL's reserved `user` keyword)
- `UserProfile` entity uses table name `user_profiles`
- `CircadianQuestionnaire` entity uses table name `circadian_questionnaires`
- `UserActivityLog` entity uses table name `user_activity_logs`

If you encounter issues with table names, you can use the provided reset script:

```bash
cd apps/backend/services/user-service
node test/reset-database.js
```

This script will drop and recreate the database, allowing TypeORM to create tables with the correct names.

## Future Improvements

1. **Remove Legacy Endpoints**: Eventually remove the deprecated `/user` POST endpoint
2. **Implement Proper Migrations**: Replace TypeORM's `synchronize: true` with proper migrations for production
3. **Enhance Token Security**: Consider implementing token rotation or additional security measures
4. **Use TypeORM Naming Strategy**: Implement a custom naming strategy to automatically handle table naming conventions
