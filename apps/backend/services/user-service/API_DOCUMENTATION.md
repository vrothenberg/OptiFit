# User Service API Documentation

This document provides comprehensive documentation for the User Service API, which handles user data, authentication, profiles, and related functionality.

## Authentication

The API uses JWT (JSON Web Token) for authentication. Most endpoints require a valid JWT token in the Authorization header.

### Authentication Flow

1. Register a new user account
2. Login with email and password to receive access and refresh tokens
3. Include the access token in the Authorization header for protected endpoints
4. Use the refresh token to get a new access token when it expires

### Headers for Protected Endpoints

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register User

Creates a new user account.

- **URL**: `/user`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "phoneNumber": "string",
    "profile": {
      "gender": "string",
      "dateOfBirth": "YYYY-MM-DD",
      "activityLevel": "string"
    }
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phoneNumber": "string",
    "hashedPassword": "string",
    "isActive": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```

#### Login

Authenticates a user and returns JWT tokens.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "accessToken": "string",
    "refreshToken": "string"
  }
  ```

#### Refresh Token

Refreshes the access token using a valid refresh token.

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "accessToken": "string",
    "refreshToken": "string"
  }
  ```

#### Get Current User Profile

Returns the profile of the currently authenticated user.

- **URL**: `/auth/profile`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "id": "number",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "isActive": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```

### User Management

#### Get All Users

Returns a list of all users.

- **URL**: `/user`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "number",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phoneNumber": "string",
      "isActive": "boolean",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
  ```

#### Get User by ID

Returns a specific user by ID.

- **URL**: `/user/:id`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `id=[number]`
- **Success Response**: `200 OK`
  ```json
  {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phoneNumber": "string",
    "isActive": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Error Response**: `404 Not Found`

#### Update User

Updates a user's information.

- **URL**: `/user/:id`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `id=[number]`
- **Request Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "isActive": "boolean"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phoneNumber": "string",
    "isActive": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Error Response**: `404 Not Found`

#### Delete User

Deletes a user.

- **URL**: `/user/:id`
- **Method**: `DELETE`
- **Auth required**: Yes
- **URL Parameters**: `id=[number]`
- **Success Response**: `200 OK`
- **Error Response**: `404 Not Found`

### User Profile

#### Get User Profile

Returns a user's profile information.

- **URL**: `/user/profile/:userId`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `userId=[number]`
- **Success Response**: `200 OK`
  ```json
  {
    "userId": "number",
    "gender": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "activityLevel": "string",
    "weightKg": "number",
    "heightCm": "number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Error Response**: `404 Not Found`

#### Update User Profile

Updates a user's profile information.

- **URL**: `/user/profile/:userId`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `userId=[number]`
- **Request Body**:
  ```json
  {
    "gender": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "activityLevel": "string",
    "weightKg": "number",
    "heightCm": "number"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "userId": "number",
    "gender": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "activityLevel": "string",
    "weightKg": "number",
    "heightCm": "number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Note**: If a profile doesn't exist for the user, a new one will be created.

## Error Handling

The API returns standard HTTP status codes to indicate the success or failure of a request.

### Common Error Codes

- `400 Bad Request`: The request was malformed or contained invalid parameters
- `401 Unauthorized`: Authentication is required or the provided credentials are invalid
- `403 Forbidden`: The authenticated user doesn't have permission to access the requested resource
- `404 Not Found`: The requested resource doesn't exist
- `500 Internal Server Error`: An unexpected error occurred on the server

### Error Response Format

```json
{
  "statusCode": "number",
  "message": "string",
  "error": "string"
}
```

## Integration Examples

### Frontend Integration

Here are examples of how to integrate with the API from a frontend application:

#### Register a New User

```javascript
async function registerUser(userData) {
  const response = await fetch('/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  return await response.json();
}
```

#### Login

```javascript
async function login(email, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const { accessToken, refreshToken } = await response.json();
  
  // Store tokens in localStorage or secure cookie
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  return { accessToken, refreshToken };
}
```

#### Making Authenticated Requests

```javascript
async function fetchUserProfile(userId) {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(`/user/profile/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshAccessToken();
    return fetchUserProfile(userId);
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  
  return await response.json();
}
```

#### Refreshing Access Token

```javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  
  if (!response.ok) {
    // Refresh token expired or invalid, redirect to login
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  
  const { accessToken, refreshToken: newRefreshToken } = await response.json();
  
  // Update tokens in storage
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', newRefreshToken);
  
  return { accessToken, refreshToken: newRefreshToken };
}
```

## Data Models

### User

```typescript
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserProfile

```typescript
interface UserProfile {
  userId: number;
  gender?: string;
  dateOfBirth?: Date;
  activityLevel?: string;
  weightKg?: number;
  heightCm?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserActivityLog

```typescript
interface UserActivityLog {
  id: number;
  userId: number;
  eventType: string;
  eventData: any;
  createdAt: Date;
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Clients are limited to 100 requests per minute per IP address. When the rate limit is exceeded, the API will return a `429 Too Many Requests` response.
